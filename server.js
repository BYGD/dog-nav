const express = require('express');
const initSqlJs = require('sql.js');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 3000;
const DB_PATH = './dognav.db';
const UPLOAD_DIR = './uploads';

let db;

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// File upload config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = Date.now() + '-' + Math.random().toString(36).substr(2, 9) + ext;
        cb(null, name);
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(UPLOAD_DIR));

// Save database to file
function saveDb() {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
}

// Helper: get single setting value
function getSetting(key) {
    const result = db.exec("SELECT value FROM settings WHERE key = ?", [key]);
    return result[0]?.values[0]?.[0] || null;
}

// Helper: set single setting value
function setSetting(key, value) {
    db.run("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))", [key, value]);
}

// Helper: log activity
function logAction(userId, action, detail) {
    db.run("INSERT INTO logs (user_id, action, detail, created_at) VALUES (?, ?, ?, datetime('now'))", [userId, action, detail]);
    saveDb();
}

// Initialize database
async function initDb() {
    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
        console.log('Loaded existing database');
    } else {
        db = new SQL.Database();
        console.log('Created new database');
    }

    // ═══════════════════════════════════════════
    // DATABASE TABLES
    // ═══════════════════════════════════════════

    db.run(`CREATE TABLE IF NOT EXISTS sites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        screenshot TEXT,
        category TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        is_featured INTEGER DEFAULT 0,
        click_count INTEGER DEFAULT 0,
        nofollow INTEGER DEFAULT 0,
        seo_title TEXT,
        seo_description TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        color TEXT DEFAULT '#667eea'
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS site_tags (
        site_id INTEGER,
        tag_id INTEGER,
        PRIMARY KEY (site_id, tag_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'editor',
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        description TEXT,
        category TEXT,
        submitter_email TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reviewed_at DATETIME,
        reviewed_by INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site_id INTEGER,
        reason TEXT,
        reporter_email TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME,
        resolved_by INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        detail TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site_id INTEGER,
        ip_address TEXT,
        user_agent TEXT,
        referrer TEXT,
        clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // ═══════════════════════════════════════════
    // DEFAULT DATA
    // ═══════════════════════════════════════════

    // Default admin user
    const userResult = db.exec("SELECT COUNT(*) as count FROM users");
    const userCount = userResult[0]?.values[0][0] || 0;
    if (userCount === 0) {
        db.run("INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin')");
        console.log('Default admin created: admin / admin123');
    }

    // Default categories
    const catResult = db.exec("SELECT COUNT(*) as count FROM categories");
    const catCount = catResult[0]?.values[0][0] || 0;
    if (catCount === 0) {
        const cats = [
            ['recommend', '常用推荐', '⭐', 1],
            ['video', '影视资源', '🎬', 2],
            ['anime', '动漫', '🌸', 3],
            ['software', '软件博客', '💿', 4],
            ['tools', '在线工具', '🔧', 5],
            ['news', '资讯', '📰', 6],
            ['community', '社区', '💬', 7],
            ['ai', 'AI 工具', '🤖', 8],
            ['dev', '开发编程', '💻', 9],
            ['design', '设计素材', '🎨', 10],
        ];
        cats.forEach(([id, name, icon, sort]) => {
            db.run("INSERT INTO categories (id, name, icon, sort_order) VALUES (?, ?, ?, ?)", [id, name, icon, sort]);
        });
        console.log('Default categories created');
    }

    // Default settings
    const settingsResult = db.exec("SELECT COUNT(*) as count FROM settings");
    const settingsCount = settingsResult[0]?.values[0][0] || 0;
    if (settingsCount === 0) {
        const defaults = [
            ['site_name', 'DogNav'],
            ['site_description', '发现互联网的无限精彩'],
            ['weather_api_key', 'd7ebb8f4da72492f9ac290d366e8dab4'],
            ['weather_enabled', 'true'],
            ['footer_text', 'DogNav © 2026 — Design by CangDog'],
            ['footer_blog_url', 'https://www.cangdog.com'],
            ['footer_github_url', 'https://github.com/BYGD'],
            ['theme_primary_color', '#667eea'],
            ['theme_secondary_color', '#764ba2'],
            ['submission_enabled', 'true'],
            ['auto_nofollow', 'false'],
        ];
        defaults.forEach(([key, value]) => {
            db.run("INSERT INTO settings (key, value) VALUES (?, ?)", [key, value]);
        });
        console.log('Default settings created');
    }

    // Default pages
    const pagesResult = db.exec("SELECT COUNT(*) as count FROM pages");
    const pagesCount = pagesResult[0]?.values[0][0] || 0;
    if (pagesCount === 0) {
        const pages = [
            ['about', '关于 DogNav', 'DogNav 是一个精选网址导航，收录了互联网上最优质的网站。'],
            ['contribute', '提交站点', '如果你发现了好网站，欢迎提交给我们。'],
            ['links', '友情链接', '以下是与本站有友好往来的网站。'],
        ];
        pages.forEach(([id, title, content]) => {
            db.run("INSERT INTO pages (id, title, content) VALUES (?, ?, ?)", [id, title, content]);
        });
        console.log('Default pages created');
    }

    saveDb();
}

// ═══════════════════════════════════════════
// AUTH MIDDLEWARE
// ═══════════════════════════════════════════

function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    // Simple token check (in production, use JWT)
    if (token === 'admin_token') {
        req.userId = 1;
        req.userRole = 'admin';
        next();
    } else {
        res.status(401).json({ error: 'Invalid token' });
    }
}

// ═══════════════════════════════════════════
// AUTH API
// ═══════════════════════════════════════════

app.post('/api/auth/login', (req, res) => {
    try {
        const { username, password } = req.body;
        const stmt = db.prepare("SELECT * FROM users WHERE username=? AND password=? AND is_active=1");
        stmt.bind([username, password]);
        if (stmt.step()) {
            const user = stmt.getAsObject();
            logAction(user.id, 'login', `User ${username} logged in`);
            res.json({ success: true, token: 'admin_token', user: { id: user.id, username: user.username, role: user.role } });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
        stmt.free();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/auth/password', requireAuth, (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const stmt = db.prepare("SELECT * FROM users WHERE id=?");
        stmt.bind([req.userId]);
        if (stmt.step()) {
            const user = stmt.getAsObject();
            if (user.password !== oldPassword) {
                stmt.free();
                return res.status(401).json({ error: 'Old password incorrect' });
            }
        }
        stmt.free();

        db.run("UPDATE users SET password=? WHERE id=?", [newPassword, req.userId]);
        logAction(req.userId, 'change_password', 'Password changed');
        saveDb();
        res.json({ message: 'Password changed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════
// SITES API
// ═══════════════════════════════════════════

app.get('/api/sites', (req, res) => {
    try {
        const sort = req.query.sort;
        const orderBy = sort === 'created' ? 'created_at DESC, id DESC' : 'sort_order, category, name';
        const result = db.exec(`SELECT * FROM sites ORDER BY ${orderBy}`);
        res.json(result[0] ? result[0].values.map(row => {
            const obj = {};
            result[0].columns.forEach((col, i) => obj[col] = row[i]);
            return obj;
        }) : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/sites', requireAuth, (req, res) => {
    try {
        const { name, url, description, icon, screenshot, category, sort_order, is_featured, nofollow, seo_title, seo_description } = req.body;
        if (!name || !url || !category) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const stmt = db.prepare(`INSERT INTO sites (name, url, description, icon, screenshot, category, sort_order, is_featured, nofollow, seo_title, seo_description, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`);
        stmt.run([name, url, description || '', icon || '', screenshot || '', category, sort_order || 0, is_featured || 0, nofollow || 0, seo_title || '', seo_description || '']);
        stmt.free();
        logAction(req.userId, 'create_site', `Created site: ${name}`);
        saveDb();
        const idResult = db.exec("SELECT last_insert_rowid() as id");
        res.json({ id: idResult[0]?.values[0][0] || 0, message: 'Site added' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/sites/:id', requireAuth, (req, res) => {
    try {
        const { name, url, description, icon, screenshot, category, sort_order, is_featured, nofollow, seo_title, seo_description, status } = req.body;
        const stmt = db.prepare(`UPDATE sites SET name=?, url=?, description=?, icon=?, screenshot=?, category=?, sort_order=?, is_featured=?, nofollow=?, seo_title=?, seo_description=?, status=?, updated_at=datetime('now') WHERE id=?`);
        stmt.run([name, url, description || '', icon || '', screenshot || '', category, sort_order || 0, is_featured || 0, nofollow || 0, seo_title || '', seo_description || '', status || 'active', req.params.id]);
        stmt.free();
        logAction(req.userId, 'update_site', `Updated site ID: ${req.params.id}`);
        saveDb();
        res.json({ message: 'Site updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/sites/:id', requireAuth, (req, res) => {
    try {
        db.run("DELETE FROM sites WHERE id=?", [req.params.id]);
        logAction(req.userId, 'delete_site', `Deleted site ID: ${req.params.id}`);
        saveDb();
        res.json({ message: 'Site deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Batch operations
app.post('/api/sites/batch', requireAuth, (req, res) => {
    try {
        const { ids, action, data } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'No IDs provided' });
        }

        if (action === 'delete') {
            const placeholders = ids.map(() => '?').join(',');
            db.run(`DELETE FROM sites WHERE id IN (${placeholders})`, ids);
            logAction(req.userId, 'batch_delete', `Deleted ${ids.length} sites`);
        } else if (action === 'update') {
            const fields = Object.keys(data);
            const setClause = fields.map(f => `${f}=?`).join(',');
            const values = fields.map(f => data[f]).concat(ids);
            const placeholders = ids.map(() => '?').join(',');
            db.run(`UPDATE sites SET ${setClause} WHERE id IN (${placeholders})`, values);
            logAction(req.userId, 'batch_update', `Updated ${ids.length} sites`);
        }
        saveDb();
        res.json({ message: `Batch ${action} completed`, count: ids.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Click tracking
app.post('/api/sites/:id/click', (req, res) => {
    try {
        const ip = req.ip || req.connection.remoteAddress;
        const ua = req.headers['user-agent'] || '';
        const ref = req.headers.referer || '';
        
        db.run("UPDATE sites SET click_count = click_count + 1 WHERE id=?", [req.params.id]);
        db.run("INSERT INTO stats (site_id, ip_address, user_agent, referrer) VALUES (?, ?, ?, ?)", [req.params.id, ip, ua, ref]);
        saveDb();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════
// CATEGORIES API
// ═══════════════════════════════════════════

app.get('/api/categories', (req, res) => {
    try {
        const result = db.exec("SELECT * FROM categories ORDER BY sort_order");
        res.json(result[0] ? result[0].values.map(row => {
            const obj = {};
            result[0].columns.forEach((col, i) => obj[col] = row[i]);
            return obj;
        }) : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/categories', requireAuth, (req, res) => {
    try {
        const { id, name, icon, sort_order } = req.body;
        if (!id || !name) return res.status(400).json({ error: 'Missing required fields' });
        db.run("INSERT INTO categories (id, name, icon, sort_order) VALUES (?, ?, ?, ?)", [id, name, icon || '', sort_order || 0]);
        logAction(req.userId, 'create_category', `Created category: ${name}`);
        saveDb();
        res.json({ message: 'Category created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/categories/:id', requireAuth, (req, res) => {
    try {
        const { name, icon, sort_order, is_active } = req.body;
        db.run("UPDATE categories SET name=?, icon=?, sort_order=?, is_active=? WHERE id=?", [name, icon || '', sort_order || 0, is_active !== undefined ? is_active : 1, req.params.id]);
        logAction(req.userId, 'update_category', `Updated category: ${req.params.id}`);
        saveDb();
        res.json({ message: 'Category updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/categories/:id', requireAuth, (req, res) => {
    try {
        db.run("DELETE FROM categories WHERE id=?", [req.params.id]);
        logAction(req.userId, 'delete_category', `Deleted category: ${req.params.id}`);
        saveDb();
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════
// TAGS API
// ═══════════════════════════════════════════

app.get('/api/tags', (req, res) => {
    try {
        const result = db.exec("SELECT * FROM tags ORDER BY name");
        res.json(result[0] ? result[0].values.map(row => {
            const obj = {};
            result[0].columns.forEach((col, i) => obj[col] = row[i]);
            return obj;
        }) : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tags', requireAuth, (req, res) => {
    try {
        const { name, color } = req.body;
        if (!name) return res.status(400).json({ error: 'Name required' });
        db.run("INSERT INTO tags (name, color) VALUES (?, ?)", [name, color || '#667eea']);
        logAction(req.userId, 'create_tag', `Created tag: ${name}`);
        saveDb();
        res.json({ message: 'Tag created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/sites/:id/tags', requireAuth, (req, res) => {
    try {
        const { tag_ids } = req.body;
        db.run("DELETE FROM site_tags WHERE site_id=?", [req.params.id]);
        if (tag_ids && Array.isArray(tag_ids)) {
            tag_ids.forEach(tagId => {
                db.run("INSERT INTO site_tags (site_id, tag_id) VALUES (?, ?)", [req.params.id, tagId]);
            });
        }
        saveDb();
        res.json({ message: 'Tags updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════
// IMPORT/EXPORT API
// ═══════════════════════════════════════════

app.get('/api/export', requireAuth, (req, res) => {
    try {
        const data = {
            sites: db.exec("SELECT * FROM sites")[0]?.values.map(row => {
                const obj = {};
                db.exec("SELECT * FROM sites")[0].columns.forEach((col, i) => obj[col] = row[i]);
                return obj;
            }) || [],
            categories: db.exec("SELECT * FROM categories")[0]?.values.map(row => {
                const obj = {};
                db.exec("SELECT * FROM categories")[0].columns.forEach((col, i) => obj[col] = row[i]);
                return obj;
            }) || [],
            tags: db.exec("SELECT * FROM tags")[0]?.values.map(row => {
                const obj = {};
                db.exec("SELECT * FROM tags")[0].columns.forEach((col, i) => obj[col] = row[i]);
                return obj;
            }) || [],
            links: db.exec("SELECT * FROM links")[0]?.values.map(row => {
                const obj = {};
                db.exec("SELECT * FROM links")[0].columns.forEach((col, i) => obj[col] = row[i]);
                return obj;
            }) || [],
            settings: db.exec("SELECT * FROM settings")[0]?.values.reduce((acc, row) => {
                acc[row[0]] = row[1];
                return acc;
            }, {}) || {},
            exportDate: new Date().toISOString()
        };
        logAction(req.userId, 'export', 'Database exported');
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/import', requireAuth, (req, res) => {
    try {
        const data = req.body;
        
        if (data.sites) {
            db.run("DELETE FROM sites");
            data.sites.forEach(s => {
                db.run(`INSERT INTO sites (id, name, url, description, icon, category, sort_order, is_featured, click_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [s.id, s.name, s.url, s.description || '', s.icon || '', s.category, s.sort_order || 0, s.is_featured || 0, s.click_count || 0]);
            });
        }

        if (data.categories) {
            db.run("DELETE FROM categories");
            data.categories.forEach(c => {
                db.run("INSERT INTO categories (id, name, icon, sort_order) VALUES (?, ?, ?, ?)", [c.id, c.name, c.icon || '', c.sort_order || 0]);
            });
        }

        if (data.tags) {
            db.run("DELETE FROM tags");
            data.tags.forEach(t => {
                db.run("INSERT INTO tags (id, name, color) VALUES (?, ?, ?)", [t.id, t.name, t.color || '#667eea']);
            });
        }

        if (data.links) {
            db.run("DELETE FROM links");
            data.links.forEach(l => {
                db.run("INSERT INTO links (id, name, url, description, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)", [l.id, l.name, l.url, l.description || '', l.icon || '', l.sort_order || 0]);
            });
        }

        if (data.settings) {
            Object.entries(data.settings).forEach(([key, value]) => {
                setSetting(key, value);
            });
        }

        logAction(req.userId, 'import', 'Database imported');
        saveDb();
        res.json({ message: 'Import successful' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════
// FILE UPLOAD API
// ═══════════════════════════════════════════

app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const url = `/uploads/${req.file.filename}`;
        logAction(req.userId, 'upload', `Uploaded: ${req.file.originalname}`);
        res.json({ url, filename: req.file.filename });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════
// SUBMISSIONS API
// ═══════════════════════════════════════════

app.get('/api/submissions', requireAuth, (req, res) => {
    try {
        const result = db.exec("SELECT * FROM submissions ORDER BY created_at DESC");
        res.json(result[0] ? result[0].values.map(row => {
            const obj = {};
            result[0].columns.forEach((col, i) => obj[col] = row[i]);
            return obj;
        }) : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/submissions', (req, res) => {
    try {
        const { name, url, description, category, submitter_email } = req.body;
        if (!name || !url) return res.status(400).json({ error: 'Missing required fields' });
        db.run("INSERT INTO submissions (name, url, description, category, submitter_email) VALUES (?, ?, ?, ?, ?)",
            [name, url, description || '', category || '', submitter_email || '']);
        saveDb();
        res.json({ message: 'Submission received' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/submissions/:id', requireAuth, (req, res) => {
    try {
        const { status } = req.body;
        db.run("UPDATE submissions SET status=?, reviewed_at=datetime('now'), reviewed_by=? WHERE id=?",
            [status, req.userId, req.params.id]);
        
        if (status === 'approved') {
            const sub = db.exec("SELECT * FROM submissions WHERE id=?", [req.params.id]);
            if (sub[0]) {
                const s = sub[0].values[0];
                const cols = sub[0].columns;
                const site = {};
                cols.forEach((col, i) => site[col] = s[i]);
                db.run("INSERT INTO sites (name, url, description, category) VALUES (?, ?, ?, ?)",
                    [site.name, site.url, site.description || '', site.category || 'tools']);
            }
        }
        
        logAction(req.userId, 'review_submission', `Submission ${req.params.id}: ${status}`);
        saveDb();
        res.json({ message: 'Submission updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════
// REPORTS API
// ═══════════════════════════════════════════

app.get('/api/reports', requireAuth, (req, res) => {
    try {
        const result = db.exec("SELECT r.*, s.name as site_name, s.url as site_url FROM reports r LEFT JOIN sites s ON r.site_id = s.id ORDER BY r.created_at DESC");
        res.json(result[0] ? result[0].values.map(row => {
            const obj = {};
            result[0].columns.forEach((col, i) => obj[col] = row[i]);
            return obj;
        }) : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/reports', (req, res) => {
    try {
        const { site_id, reason, reporter_email } = req.body;
        if (!site_id || !reason) return res.status(400).json({ error: 'Missing required fields' });
        db.run("INSERT INTO reports (site_id, reason, reporter_email) VALUES (?, ?, ?)",
            [site_id, reason, reporter_email || '']);
        saveDb();
        res.json({ message: 'Report received' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/reports/:id', requireAuth, (req, res) => {
    try {
        const { status } = req.body;
        db.run("UPDATE reports SET status=?, resolved_at=datetime('now'), resolved_by=? WHERE id=?",
            [status, req.userId, req.params.id]);
        
        if (status === 'resolved' && req.body.remove_site) {
            const report = db.exec("SELECT site_id FROM reports WHERE id=?", [req.params.id]);
            if (report[0]) {
                const siteId = report[0].values[0][0];
                db.run("UPDATE sites SET status='inactive' WHERE id=?", [siteId]);
            }
        }
        
        logAction(req.userId, 'resolve_report', `Report ${req.params.id}: ${status}`);
        saveDb();
        res.json({ message: 'Report updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════
// STATS API
// ═══════════════════════════════════════════

app.get('/api/stats/overview', requireAuth, (req, res) => {
    try {
        const totalSites = db.exec("SELECT COUNT(*) FROM sites")[0]?.values[0][0] || 0;
        const totalClicks = db.exec("SELECT SUM(click_count) FROM sites")[0]?.values[0][0] || 0;
        const pendingSubmissions = db.exec("SELECT COUNT(*) FROM submissions WHERE status='pending'")[0]?.values[0][0] || 0;
        const pendingReports = db.exec("SELECT COUNT(*) FROM reports WHERE status='pending'")[0]?.values[0][0] || 0;
        const activeSites = db.exec("SELECT COUNT(*) FROM sites WHERE status='active'")[0]?.values[0][0] || 0;

        res.json({
            totalSites,
            totalClicks,
            pendingSubmissions,
            pendingReports,
            activeSites
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/stats/popular', requireAuth, (req, res) => {
    try {
        const result = db.exec("SELECT id, name, url, click_count FROM sites ORDER BY click_count DESC LIMIT 10");
        res.json(result[0] ? result[0].values.map(row => {
            const obj = {};
            result[0].columns.forEach((col, i) => obj[col] = row[i]);
            return obj;
        }) : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/stats/category-distribution', requireAuth, (req, res) => {
    try {
        const result = db.exec("SELECT c.name, COUNT(s.id) as count FROM categories c LEFT JOIN sites s ON c.id = s.category GROUP BY c.id ORDER BY count DESC");
        res.json(result[0] ? result[0].values.map(row => {
            const obj = {};
            result[0].columns.forEach((col, i) => obj[col] = row[i]);
            return obj;
        }) : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════
// LOGS API
// ═══════════════════════════════════════════

app.get('/api/logs', requireAuth, (req, res) => {
    try {
        const result = db.exec("SELECT l.*, u.username FROM logs l LEFT JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC LIMIT 100");
        res.json(result[0] ? result[0].values.map(row => {
            const obj = {};
            result[0].columns.forEach((col, i) => obj[col] = row[i]);
            return obj;
        }) : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════
// SETTINGS API
// ═══════════════════════════════════════════

app.get('/api/settings', (req, res) => {
    try {
        const result = db.exec("SELECT key, value FROM settings");
        const settings = {};
        if (result[0]) {
            result[0].values.forEach(([key, value]) => settings[key] = value);
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/settings', requireAuth, (req, res) => {
    try {
        Object.entries(req.body).forEach(([key, value]) => setSetting(key, value));
        logAction(req.userId, 'update_settings', 'Settings updated');
        saveDb();
        res.json({ message: 'Settings updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════
// PAGES API
// ═══════════════════════════════════════════

app.get('/api/pages', (req, res) => {
    try {
        const result = db.exec("SELECT * FROM pages ORDER BY id");
        res.json(result[0] ? result[0].values.map(row => {
            const obj = {};
            result[0].columns.forEach((col, i) => obj[col] = row[i]);
            return obj;
        }) : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/pages/:id', (req, res) => {
    try {
        const result = db.exec("SELECT * FROM pages WHERE id = ?", [req.params.id]);
        if (!result[0] || result[0].values.length === 0) {
            return res.status(404).json({ error: 'Page not found' });
        }
        const obj = {};
        result[0].columns.forEach((col, i) => obj[col] = result[0].values[0][i]);
        res.json(obj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/pages/:id', requireAuth, (req, res) => {
    try {
        const { title, content } = req.body;
        db.run("UPDATE pages SET title=?, content=?, updated_at=datetime('now') WHERE id=?", [title, content, req.params.id]);
        logAction(req.userId, 'update_page', `Updated page: ${req.params.id}`);
        saveDb();
        res.json({ message: 'Page updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════
// LINKS API
// ═══════════════════════════════════════════

app.get('/api/links', (req, res) => {
    try {
        const result = db.exec("SELECT * FROM links ORDER BY sort_order, name");
        res.json(result[0] ? result[0].values.map(row => {
            const obj = {};
            result[0].columns.forEach((col, i) => obj[col] = row[i]);
            return obj;
        }) : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/links', requireAuth, (req, res) => {
    try {
        const { name, url, description, icon, sort_order } = req.body;
        if (!name || !url) return res.status(400).json({ error: 'Missing required fields' });
        db.run("INSERT INTO links (name, url, description, icon, sort_order) VALUES (?, ?, ?, ?, ?)",
            [name, url, description || '', icon || '', sort_order || 0]);
        logAction(req.userId, 'create_link', `Created link: ${name}`);
        saveDb();
        res.json({ message: 'Link added' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/links/:id', requireAuth, (req, res) => {
    try {
        const { name, url, description, icon, sort_order } = req.body;
        db.run("UPDATE links SET name=?, url=?, description=?, icon=?, sort_order=? WHERE id=?",
            [name, url, description || '', icon || '', sort_order || 0, req.params.id]);
        logAction(req.userId, 'update_link', `Updated link ID: ${req.params.id}`);
        saveDb();
        res.json({ message: 'Link updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/links/:id', requireAuth, (req, res) => {
    try {
        db.run("DELETE FROM links WHERE id=?", [req.params.id]);
        logAction(req.userId, 'delete_link', `Deleted link ID: ${req.params.id}`);
        saveDb();
        res.json({ message: 'Link deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════
// FETCH ICON API
// ═══════════════════════════════════════════

const https = require('https');
const http = require('http');

app.get('/api/fetch-icon', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'Missing url parameter' });

    try {
        const origin = new URL(url).origin;
        const meta = await fetchPageMeta(url, origin);
        res.json(meta);
    } catch (err) {
        res.json({ icon: '', title: '', description: '' });
    }
});

function fetchPageMeta(pageUrl, origin) {
    return new Promise((resolve) => {
        const mod = pageUrl.startsWith('https') ? https : http;
        const req = mod.get(pageUrl, { timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (resp) => {
            if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
                const newOrigin = new URL(resp.headers.location).origin;
                fetchPageMeta(resp.headers.location, newOrigin).then(resolve).catch(() => resolve({ icon: origin + '/favicon.ico', title: '', description: '' }));
                return;
            }
            let html = '';
            resp.on('data', chunk => {
                html += chunk;
                if (html.length > 50000) { resp.destroy(); resolve(parseMeta(html, origin)); }
            });
            resp.on('end', () => resolve(parseMeta(html, origin)));
            resp.on('error', () => resolve({ icon: origin + '/favicon.ico', title: '', description: '' }));
        });
        req.on('error', () => resolve({ icon: origin + '/favicon.ico', title: '', description: '' }));
        req.on('timeout', () => { req.destroy(); resolve({ icon: origin + '/favicon.ico', title: '', description: '' }); });
    });
}

function parseMeta(html, origin) {
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

    return { icon, title, description };
}

// ═══════════════════════════════════════════
// USERS API
// ═══════════════════════════════════════════

app.get('/api/users', requireAuth, (req, res) => {
    try {
        const result = db.exec("SELECT id, username, role, is_active, created_at FROM users ORDER BY id");
        res.json(result[0] ? result[0].values.map(row => {
            const obj = {};
            result[0].columns.forEach((col, i) => obj[col] = row[i]);
            return obj;
        }) : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users', requireAuth, (req, res) => {
    try {
        const { username, password, role } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Missing required fields' });
        db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, password, role || 'editor']);
        logAction(req.userId, 'create_user', `Created user: ${username}`);
        saveDb();
        res.json({ message: 'User created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:id', requireAuth, (req, res) => {
    try {
        const { role, is_active } = req.body;
        db.run("UPDATE users SET role=?, is_active=? WHERE id=?", [role, is_active, req.params.id]);
        logAction(req.userId, 'update_user', `Updated user ID: ${req.params.id}`);
        saveDb();
        res.json({ message: 'User updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════
// HEALTH CHECK API
// ═══════════════════════════════════════════

app.post('/api/health-check', requireAuth, (req, res) => {
    try {
        const { urls } = req.body;
        if (!urls || !Array.isArray(urls)) return res.status(400).json({ error: 'urls array required' });

        const http = require('http');
        const https = require('https');
        const { URL } = require('url');

        const results = [];
        let completed = 0;
        const total = urls.length;

        urls.forEach(url => {
            const startTime = Date.now();
            try {
                const parsed = new URL(url);
                const client = parsed.protocol === 'https:' ? https : http;
                const req2 = client.get(url, { timeout: 8000, headers: { 'User-Agent': 'DogNav-HealthCheck/1.0' } }, (resp) => {
                    const latency = Date.now() - startTime;
                    let status = 'online';
                    if (resp.statusCode >= 400) status = 'offline';
                    else if (latency > 3000) status = 'slow';
                    results.push({ url, status, latency, time: new Date().toLocaleString('zh-CN'), statusCode: resp.statusCode });
                    completed++;
                    if (completed === total) res.json({ results });
                });
                req2.on('error', () => {
                    results.push({ url, status: 'offline', latency: '-', time: new Date().toLocaleString('zh-CN'), error: 'Connection failed' });
                    completed++;
                    if (completed === total) res.json({ results });
                });
                req2.on('timeout', () => {
                    req2.destroy();
                    results.push({ url, status: 'offline', latency: '-', time: new Date().toLocaleString('zh-CN'), error: 'Timeout' });
                    completed++;
                    if (completed === total) res.json({ results });
                });
            } catch (err) {
                results.push({ url, status: 'offline', latency: '-', time: new Date().toLocaleString('zh-CN'), error: err.message });
                completed++;
                if (completed === total) res.json({ results });
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════
// SERVE ADMIN PAGES
// ═══════════════════════════════════════════

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'index.html')));
app.get('/admin/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'dashboard.html')));
app.get('/admin/settings', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'settings.html')));
app.get('/admin/pages', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'pages.html')));
app.get('/admin/links', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'links.html')));
app.get('/admin/categories', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'categories.html')));
app.get('/admin/submissions', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'submissions.html')));
app.get('/admin/reports', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'health.html')));
app.get('/admin/health', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'health.html')));
app.get('/admin/stats', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'stats.html')));
app.get('/admin/logs', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'logs.html')));
app.get('/admin/users', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'users.html')));
app.get('/admin/backup', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'backup.html')));

// Start server
async function start() {
    await initDb();
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
        console.log(`Admin panel: http://localhost:${PORT}/admin`);
    });
}

start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
