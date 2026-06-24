import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Middleware
app.use('*', cors());

// ─── Auth middleware ───
function requireAuth(c, next) {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    if (!token || token !== 'admin_token') {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    c.set('userId', 1);
    c.set('userRole', 'admin');
    return next();
}

// ─── Helper: log action ───
async function logAction(db, userId, action, detail) {
    await db.prepare('INSERT INTO logs (user_id, action, detail, created_at) VALUES (?, ?, ?, datetime(\'now\'))')
        .bind(userId, action, detail).run();
}

// ═══════════════════════════════════════════
// AUTH API
// ═══════════════════════════════════════════

app.post('/api/auth/login', async (c) => {
    const { username, password } = await c.req.json();
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE username=? AND password=? AND is_active=1')
        .bind(username, password).first();
    if (!user) return c.json({ error: 'Invalid credentials' }, 401);
    await logAction(c.env.DB, user.id, 'login', `User ${username} logged in`);
    return c.json({ success: true, token: 'admin_token', user: { id: user.id, username: user.username, role: user.role } });
});

app.put('/api/auth/password', requireAuth, async (c) => {
    const { oldPassword, newPassword } = await c.req.json();
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE id=?').bind(c.get('userId')).first();
    if (user.password !== oldPassword) return c.json({ error: 'Old password incorrect' }, 401);
    await c.env.DB.prepare('UPDATE users SET password=? WHERE id=?').bind(newPassword, c.get('userId')).run();
    await logAction(c.env.DB, c.get('userId'), 'change_password', 'Password changed');
    return c.json({ message: 'Password changed' });
});

// ═══════════════════════════════════════════
// SITES API
// ═══════════════════════════════════════════

app.get('/api/sites', async (c) => {
    const sort = c.req.query('sort');
    const orderBy = sort === 'created' ? 'created_at DESC, id DESC' : 'sort_order, category, name';
    const { results } = await c.env.DB.prepare(`SELECT * FROM sites ORDER BY ${orderBy}`).all();
    return c.json(results);
});

app.post('/api/sites', requireAuth, async (c) => {
    const b = await c.req.json();
    if (!b.name || !b.url || !b.category) return c.json({ error: 'Missing required fields' }, 400);
    const result = await c.env.DB.prepare(
        `INSERT INTO sites (name,url,description,icon,screenshot,category,sort_order,is_featured,nofollow,seo_title,seo_description,status,updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))`
    ).bind(b.name, b.url, b.description||'', b.icon||'', b.screenshot||'', b.category, b.sort_order||0, b.is_featured||0, b.nofollow||0, b.seo_title||'', b.seo_description||'', b.status||'active').run();
    await logAction(c.env.DB, c.get('userId'), 'create_site', `Created site: ${b.name}`);
    return c.json({ id: result.meta.last_row_id, message: 'Site added' });
});

app.put('/api/sites/:id', requireAuth, async (c) => {
    const b = await c.req.json();
    await c.env.DB.prepare(
        `UPDATE sites SET name=?,url=?,description=?,icon=?,screenshot=?,category=?,sort_order=?,is_featured=?,nofollow=?,seo_title=?,seo_description=?,status=?,updated_at=datetime('now') WHERE id=?`
    ).bind(b.name, b.url, b.description||'', b.icon||'', b.screenshot||'', b.category, b.sort_order||0, b.is_featured||0, b.nofollow||0, b.seo_title||'', b.seo_description||'', b.status||'active', c.req.param('id')).run();
    await logAction(c.env.DB, c.get('userId'), 'update_site', `Updated site ID: ${c.req.param('id')}`);
    return c.json({ message: 'Site updated' });
});

app.delete('/api/sites/:id', requireAuth, async (c) => {
    await c.env.DB.prepare('DELETE FROM sites WHERE id=?').bind(c.req.param('id')).run();
    await logAction(c.env.DB, c.get('userId'), 'delete_site', `Deleted site ID: ${c.req.param('id')}`);
    return c.json({ message: 'Site deleted' });
});

// Batch operations
app.post('/api/sites/batch', requireAuth, async (c) => {
    const { ids, action, data } = await c.req.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) return c.json({ error: 'No IDs provided' }, 400);
    if (action === 'delete') {
        for (const id of ids) {
            await c.env.DB.prepare('DELETE FROM sites WHERE id=?').bind(id).run();
        }
        await logAction(c.env.DB, c.get('userId'), 'batch_delete', `Deleted ${ids.length} sites`);
    } else if (action === 'update') {
        const fields = Object.keys(data);
        const setClause = fields.map(f => `${f}=?`).join(',');
        const values = fields.map(f => data[f]);
        for (const id of ids) {
            await c.env.DB.prepare(`UPDATE sites SET ${setClause} WHERE id=?`).bind(...values, id).run();
        }
        await logAction(c.env.DB, c.get('userId'), 'batch_update', `Updated ${ids.length} sites`);
    }
    return c.json({ message: `Batch ${action} completed`, count: ids.length });
});

// Click tracking
app.post('/api/sites/:id/click', async (c) => {
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || '';
    const ua = c.req.header('user-agent') || '';
    const ref = c.req.header('referer') || '';
    await c.env.DB.prepare('UPDATE sites SET click_count = click_count + 1 WHERE id=?').bind(c.req.param('id')).run();
    await c.env.DB.prepare('INSERT INTO stats (site_id, ip_address, user_agent, referrer) VALUES (?,?,?,?)')
        .bind(c.req.param('id'), ip, ua, ref).run();
    return c.json({ success: true });
});

// ═══════════════════════════════════════════
// CATEGORIES API
// ═══════════════════════════════════════════

app.get('/api/categories', async (c) => {
    const { results } = await c.env.DB.prepare('SELECT * FROM categories ORDER BY sort_order').all();
    return c.json(results);
});

app.post('/api/categories', requireAuth, async (c) => {
    const { id, name, icon, sort_order } = await c.req.json();
    if (!id || !name) return c.json({ error: 'Missing required fields' }, 400);
    await c.env.DB.prepare('INSERT INTO categories (id,name,icon,sort_order) VALUES (?,?,?,?)')
        .bind(id, name, icon||'', sort_order||0).run();
    await logAction(c.env.DB, c.get('userId'), 'create_category', `Created category: ${name}`);
    return c.json({ message: 'Category created' });
});

app.put('/api/categories/:id', requireAuth, async (c) => {
    const b = await c.req.json();
    await c.env.DB.prepare('UPDATE categories SET name=?,icon=?,sort_order=?,is_active=? WHERE id=?')
        .bind(b.name, b.icon||'', b.sort_order||0, b.is_active !== undefined ? b.is_active : 1, c.req.param('id')).run();
    await logAction(c.env.DB, c.get('userId'), 'update_category', `Updated category: ${c.req.param('id')}`);
    return c.json({ message: 'Category updated' });
});

app.delete('/api/categories/:id', requireAuth, async (c) => {
    await c.env.DB.prepare('DELETE FROM categories WHERE id=?').bind(c.req.param('id')).run();
    await logAction(c.env.DB, c.get('userId'), 'delete_category', `Deleted category: ${c.req.param('id')}`);
    return c.json({ message: 'Category deleted' });
});

// ═══════════════════════════════════════════
// TAGS API
// ═══════════════════════════════════════════

app.get('/api/tags', async (c) => {
    const { results } = await c.env.DB.prepare('SELECT * FROM tags ORDER BY name').all();
    return c.json(results);
});

app.post('/api/tags', requireAuth, async (c) => {
    const { name, color } = await c.req.json();
    if (!name) return c.json({ error: 'Name required' }, 400);
    await c.env.DB.prepare('INSERT INTO tags (name,color) VALUES (?,?)').bind(name, color||'#667eea').run();
    await logAction(c.env.DB, c.get('userId'), 'create_tag', `Created tag: ${name}`);
    return c.json({ message: 'Tag created' });
});

app.post('/api/sites/:id/tags', requireAuth, async (c) => {
    const { tag_ids } = await c.req.json();
    await c.env.DB.prepare('DELETE FROM site_tags WHERE site_id=?').bind(c.req.param('id')).run();
    if (tag_ids && Array.isArray(tag_ids)) {
        for (const tagId of tag_ids) {
            await c.env.DB.prepare('INSERT INTO site_tags (site_id,tag_id) VALUES (?,?)').bind(c.req.param('id'), tagId).run();
        }
    }
    return c.json({ message: 'Tags updated' });
});

// ═══════════════════════════════════════════
// SUBMISSIONS API
// ═══════════════════════════════════════════

app.get('/api/submissions', requireAuth, async (c) => {
    const { results } = await c.env.DB.prepare('SELECT * FROM submissions ORDER BY created_at DESC').all();
    return c.json(results);
});

app.post('/api/submissions', async (c) => {
    const { name, url, description, category, submitter_email } = await c.req.json();
    if (!name || !url) return c.json({ error: 'Missing required fields' }, 400);
    await c.env.DB.prepare('INSERT INTO submissions (name,url,description,category,submitter_email) VALUES (?,?,?,?,?)')
        .bind(name, url, description||'', category||'', submitter_email||'').run();
    return c.json({ message: 'Submission received' });
});

app.put('/api/submissions/:id', requireAuth, async (c) => {
    const { status } = await c.req.json();
    await c.env.DB.prepare("UPDATE submissions SET status=?,reviewed_at=datetime('now'),reviewed_by=? WHERE id=?")
        .bind(status, c.get('userId'), c.req.param('id')).run();
    if (status === 'approved') {
        const sub = await c.env.DB.prepare('SELECT * FROM submissions WHERE id=?').bind(c.req.param('id')).first();
        if (sub) {
            await c.env.DB.prepare('INSERT INTO sites (name,url,description,category) VALUES (?,?,?,?)')
                .bind(sub.name, sub.url, sub.description||'', sub.category||'tools').run();
        }
    }
    await logAction(c.env.DB, c.get('userId'), 'review_submission', `Submission ${c.req.param('id')}: ${status}`);
    return c.json({ message: 'Submission updated' });
});

// ═══════════════════════════════════════════
// REPORTS API
// ═══════════════════════════════════════════

app.get('/api/reports', requireAuth, async (c) => {
    const { results } = await c.env.DB.prepare(
        'SELECT r.*, s.name as site_name, s.url as site_url FROM reports r LEFT JOIN sites s ON r.site_id = s.id ORDER BY r.created_at DESC'
    ).all();
    return c.json(results);
});

app.post('/api/reports', async (c) => {
    const { site_id, reason, reporter_email } = await c.req.json();
    if (!site_id || !reason) return c.json({ error: 'Missing required fields' }, 400);
    await c.env.DB.prepare('INSERT INTO reports (site_id,reason,reporter_email) VALUES (?,?,?)')
        .bind(site_id, reason, reporter_email||'').run();
    return c.json({ message: 'Report received' });
});

app.put('/api/reports/:id', requireAuth, async (c) => {
    const body = await c.req.json();
    const { status } = body;
    await c.env.DB.prepare("UPDATE reports SET status=?,resolved_at=datetime('now'),resolved_by=? WHERE id=?")
        .bind(status, c.get('userId'), c.req.param('id')).run();
    if (status === 'resolved' && body.remove_site) {
        const report = await c.env.DB.prepare('SELECT site_id FROM reports WHERE id=?').bind(c.req.param('id')).first();
        if (report) {
            await c.env.DB.prepare("UPDATE sites SET status='inactive' WHERE id=?").bind(report.site_id).run();
        }
    }
    await logAction(c.env.DB, c.get('userId'), 'resolve_report', `Report ${c.req.param('id')}: ${status}`);
    return c.json({ message: 'Report updated' });
});

// ═══════════════════════════════════════════
// STATS API
// ═══════════════════════════════════════════

app.get('/api/stats/overview', requireAuth, async (c) => {
    const db = c.env.DB;
    const totalSites = (await db.prepare('SELECT COUNT(*) as cnt FROM sites').first()).cnt;
    const totalClicks = (await db.prepare('SELECT COALESCE(SUM(click_count),0) as cnt FROM sites').first()).cnt;
    const pendingSubmissions = (await db.prepare("SELECT COUNT(*) as cnt FROM submissions WHERE status='pending'").first()).cnt;
    const pendingReports = (await db.prepare("SELECT COUNT(*) as cnt FROM reports WHERE status='pending'").first()).cnt;
    const activeSites = (await db.prepare("SELECT COUNT(*) as cnt FROM sites WHERE status='active'").first()).cnt;
    return c.json({ totalSites, totalClicks, pendingSubmissions, pendingReports, activeSites });
});

app.get('/api/stats/popular', requireAuth, async (c) => {
    const { results } = await c.env.DB.prepare('SELECT id,name,url,click_count FROM sites ORDER BY click_count DESC LIMIT 10').all();
    return c.json(results);
});

app.get('/api/stats/category-distribution', requireAuth, async (c) => {
    const { results } = await c.env.DB.prepare(
        'SELECT c.name, COUNT(s.id) as count FROM categories c LEFT JOIN sites s ON c.id = s.category GROUP BY c.id ORDER BY count DESC'
    ).all();
    return c.json(results);
});

// ═══════════════════════════════════════════
// LOGS API
// ═══════════════════════════════════════════

app.get('/api/logs', requireAuth, async (c) => {
    const { results } = await c.env.DB.prepare(
        'SELECT l.*, u.username FROM logs l LEFT JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC LIMIT 100'
    ).all();
    return c.json(results);
});

// ═══════════════════════════════════════════
// SETTINGS API
// ═══════════════════════════════════════════

app.get('/api/settings', async (c) => {
    const { results } = await c.env.DB.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    for (const row of results) settings[row.key] = row.value;
    return c.json(settings);
});

app.put('/api/settings', requireAuth, async (c) => {
    const body = await c.req.json();
    for (const [key, value] of Object.entries(body)) {
        await c.env.DB.prepare("INSERT OR REPLACE INTO settings (key,value,updated_at) VALUES (?,?,datetime('now'))")
            .bind(key, value).run();
    }
    await logAction(c.env.DB, c.get('userId'), 'update_settings', 'Settings updated');
    return c.json({ message: 'Settings updated' });
});

// ═══════════════════════════════════════════
// PAGES API
// ═══════════════════════════════════════════

app.get('/api/pages', async (c) => {
    const { results } = await c.env.DB.prepare('SELECT * FROM pages ORDER BY id').all();
    return c.json(results);
});

app.get('/api/pages/:id', async (c) => {
    const page = await c.env.DB.prepare('SELECT * FROM pages WHERE id=?').bind(c.req.param('id')).first();
    if (!page) return c.json({ error: 'Page not found' }, 404);
    return c.json(page);
});

app.put('/api/pages/:id', requireAuth, async (c) => {
    const { title, content } = await c.req.json();
    await c.env.DB.prepare("UPDATE pages SET title=?,content=?,updated_at=datetime('now') WHERE id=?")
        .bind(title, content, c.req.param('id')).run();
    await logAction(c.env.DB, c.get('userId'), 'update_page', `Updated page: ${c.req.param('id')}`);
    return c.json({ message: 'Page updated' });
});

// ═══════════════════════════════════════════
// LINKS API
// ═══════════════════════════════════════════

app.get('/api/links', async (c) => {
    const { results } = await c.env.DB.prepare('SELECT * FROM links ORDER BY sort_order, name').all();
    return c.json(results);
});

app.post('/api/links', requireAuth, async (c) => {
    const { name, url, description, icon, sort_order } = await c.req.json();
    if (!name || !url) return c.json({ error: 'Missing required fields' }, 400);
    await c.env.DB.prepare('INSERT INTO links (name,url,description,icon,sort_order) VALUES (?,?,?,?,?)')
        .bind(name, url, description||'', icon||'', sort_order||0).run();
    await logAction(c.env.DB, c.get('userId'), 'create_link', `Created link: ${name}`);
    return c.json({ message: 'Link added' });
});

app.put('/api/links/:id', requireAuth, async (c) => {
    const b = await c.req.json();
    await c.env.DB.prepare('UPDATE links SET name=?,url=?,description=?,icon=?,sort_order=? WHERE id=?')
        .bind(b.name, b.url, b.description||'', b.icon||'', b.sort_order||0, c.req.param('id')).run();
    await logAction(c.env.DB, c.get('userId'), 'update_link', `Updated link ID: ${c.req.param('id')}`);
    return c.json({ message: 'Link updated' });
});

app.delete('/api/links/:id', requireAuth, async (c) => {
    await c.env.DB.prepare('DELETE FROM links WHERE id=?').bind(c.req.param('id')).run();
    await logAction(c.env.DB, c.get('userId'), 'delete_link', `Deleted link ID: ${c.req.param('id')}`);
    return c.json({ message: 'Link deleted' });
});

// ═══════════════════════════════════════════
// FETCH ICON API
// ═══════════════════════════════════════════

app.get('/api/fetch-icon', async (c) => {
    const url = c.req.query('url');
    if (!url) return c.json({ error: 'Missing url parameter' }, 400);

    try {
        const parsed = new URL(url);
        const origin = parsed.origin;

        const resp = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            redirect: 'follow',
        });
        const html = await resp.text();

        // Extract icon
        const iconPatterns = [
            /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i,
            /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i,
            /<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i,
            /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']apple-touch-icon["']/i,
        ];
        let icon = origin + '/favicon.ico';
        for (const pat of iconPatterns) {
            const m = html.match(pat);
            if (m && m[1]) {
                let ico = m[1].trim();
                if (ico.startsWith('data:')) { icon = ico; break; }
                if (ico.startsWith('//')) { icon = 'https:' + ico; break; }
                if (ico.startsWith('/')) { icon = origin + ico; break; }
                if (ico.startsWith('http')) { icon = ico; break; }
                icon = origin + '/' + ico;
                break;
            }
        }

        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : '';

        // Extract description
        const descPatterns = [
            /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
            /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i,
            /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i,
            /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:description["']/i,
        ];
        let description = '';
        for (const pat of descPatterns) {
            const m = html.match(pat);
            if (m && m[1]) { description = m[1].trim(); break; }
        }

        return c.json({ icon, title, description });
    } catch (err) {
        return c.json({ icon: '', title: '', description: '' });
    }
});

// ═══════════════════════════════════════════
// USERS API
// ═══════════════════════════════════════════

app.get('/api/users', requireAuth, async (c) => {
    const { results } = await c.env.DB.prepare('SELECT id,username,role,is_active,created_at FROM users ORDER BY id').all();
    return c.json(results);
});

app.post('/api/users', requireAuth, async (c) => {
    const { username, password, role } = await c.req.json();
    if (!username || !password) return c.json({ error: 'Missing required fields' }, 400);
    await c.env.DB.prepare('INSERT INTO users (username,password,role) VALUES (?,?,?)')
        .bind(username, password, role||'editor').run();
    await logAction(c.env.DB, c.get('userId'), 'create_user', `Created user: ${username}`);
    return c.json({ message: 'User created' });
});

app.put('/api/users/:id', requireAuth, async (c) => {
    const { role, is_active } = await c.req.json();
    await c.env.DB.prepare('UPDATE users SET role=?,is_active=? WHERE id=?')
        .bind(role, is_active, c.req.param('id')).run();
    await logAction(c.env.DB, c.get('userId'), 'update_user', `Updated user ID: ${c.req.param('id')}`);
    return c.json({ message: 'User updated' });
});

// ═══════════════════════════════════════════
// IMPORT / EXPORT API
// ═══════════════════════════════════════════

app.get('/api/export', requireAuth, async (c) => {
    const db = c.env.DB;
    const sites = (await db.prepare('SELECT * FROM sites').all()).results;
    const categories = (await db.prepare('SELECT * FROM categories').all()).results;
    const tags = (await db.prepare('SELECT * FROM tags').all()).results;
    const links = (await db.prepare('SELECT * FROM links').all()).results;
    const settingsRows = (await db.prepare('SELECT key,value FROM settings').all()).results;
    const settings = {};
    for (const row of settingsRows) settings[row.key] = row.value;
    await logAction(c.env.DB, c.get('userId'), 'export', 'Database exported');
    return c.json({ sites, categories, tags, links, settings, exportDate: new Date().toISOString() });
});

app.post('/api/import', requireAuth, async (c) => {
    const data = await c.req.json();
    const db = c.env.DB;
    if (data.sites) {
        await db.prepare('DELETE FROM sites').run();
        for (const s of data.sites) {
            await db.prepare('INSERT INTO sites (id,name,url,description,icon,category,sort_order,is_featured,click_count) VALUES (?,?,?,?,?,?,?,?,?)')
                .bind(s.id,s.name,s.url,s.description||'',s.icon||'',s.category,s.sort_order||0,s.is_featured||0,s.click_count||0).run();
        }
    }
    if (data.categories) {
        await db.prepare('DELETE FROM categories').run();
        for (const cat of data.categories) {
            await db.prepare('INSERT INTO categories (id,name,icon,sort_order) VALUES (?,?,?,?)')
                .bind(cat.id,cat.name,cat.icon||'',cat.sort_order||0).run();
        }
    }
    if (data.tags) {
        await db.prepare('DELETE FROM tags').run();
        for (const t of data.tags) {
            await db.prepare('INSERT INTO tags (id,name,color) VALUES (?,?,?)').bind(t.id,t.name,t.color||'#667eea').run();
        }
    }
    if (data.links) {
        await db.prepare('DELETE FROM links').run();
        for (const l of data.links) {
            await db.prepare('INSERT INTO links (id,name,url,description,icon,sort_order) VALUES (?,?,?,?,?,?)')
                .bind(l.id,l.name,l.url,l.description||'',l.icon||'',l.sort_order||0).run();
        }
    }
    if (data.settings) {
        for (const [key, value] of Object.entries(data.settings)) {
            await db.prepare("INSERT OR REPLACE INTO settings (key,value,updated_at) VALUES (?,?,datetime('now'))").bind(key,value).run();
        }
    }
    await logAction(c.env.DB, c.get('userId'), 'import', 'Database imported');
    return c.json({ message: 'Import successful' });
});

// ═══════════════════════════════════════════
// FILE UPLOAD (base64 → R2 or skip)
// ═══════════════════════════════════════════

app.post('/api/upload', requireAuth, async (c) => {
    // Simplified: in CF Workers, file uploads would go to R2
    // For now, return a placeholder
    return c.json({ url: '', filename: '', message: 'Upload not available on CF. Use external image hosting.' });
});

// ═══════════════════════════════════════════
// HEALTH CHECK API
// ═══════════════════════════════════════════

app.post('/api/health-check', requireAuth, async (c) => {
    const { urls } = await c.req.json();
    if (!urls || !Array.isArray(urls)) return c.json({ error: 'urls array required' }, 400);

    const results = [];
    await Promise.all(urls.map(async (url) => {
        const startTime = Date.now();
        try {
            const resp = await fetch(url, {
                method: 'GET',
                headers: { 'User-Agent': 'DogNav-HealthCheck/1.0' },
                redirect: 'follow',
            });
            const latency = Date.now() - startTime;
            let status = 'online';
            if (resp.status >= 400) status = 'offline';
            else if (latency > 3000) status = 'slow';
            results.push({ url, status, latency, time: new Date().toLocaleString('zh-CN'), statusCode: resp.status });
        } catch (err) {
            results.push({ url, status: 'offline', latency: '-', time: new Date().toLocaleString('zh-CN'), error: 'Connection failed' });
        }
    }));

    return c.json({ results });
});

export default app;
