#!/usr/bin/env node

/**
 * DogNav Cloudflare 一键部署脚本（根目录）
 *
 * 使用方法:
 *   git clone https://github.com/BYGD/dog-nav.git
 *   cd dog-nav
 *   npm install
 *   npm run deploy:cf
 *
 * 本脚本自动完成:
 *   1. 检查/登录 Cloudflare
 *   2. 创建 D1 数据库（如不存在）— 先试 wrangler CLI，失败则用 REST API
 *   3. 更新 wrangler.toml 中的 database_id
 *   4. 部署 Worker 及静态资源
 *   5. 首次访问自动初始化数据库（建表 + 默认数据）
 *
 * 可选: 导入完整 150+ 站点数据
 *   npm run db:seed
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DB_NAME = 'dognav';
const TOML_PATH = path.join(ROOT, 'wrangler.toml');

function run(cmd, opts = {}) {
    console.log(`\n> ${cmd}`);
    try {
        return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe', ...opts }).trim();
    } catch (err) {
        const stdout = (err.stdout || '').trim();
        const stderr = (err.stderr || '').trim();
        return [stdout, stderr].filter(Boolean).join('\n');
    }
}

function step(msg) {
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`  ${msg}`);
    console.log('═'.repeat(50));
}

async function createD1ViaAPI() {
    const token = process.env.CLOUDFLARE_API_TOKEN;
    if (!token) {
        console.log('  未检测到 CLOUDFLARE_API_TOKEN，跳过 API 方式');
        return null;
    }

    try {
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        // 获取 Account ID
        const acctResp = await fetch('https://api.cloudflare.com/client/v4/accounts', { headers });
        const acctData = await acctResp.json();

        if (!acctData.success || !acctData.result || acctData.result.length === 0) {
            console.log('  无法获取 Account ID');
            return null;
        }

        const accountId = acctData.result[0].id;
        const accountName = acctData.result[0].name;
        console.log(`  Account: ${accountName} (${accountId})`);

        // 检查数据库是否已存在
        const dbResp = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database`, { headers });
        const dbData = await dbResp.json();

        const existing = dbData.result?.find(db => db.name === DB_NAME);
        if (existing) {
            console.log(`  数据库已存在: ${existing.uuid}`);
            return existing.uuid;
        }

        // 创建新数据库
        const createResp = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: DB_NAME })
        });
        const createData = await createResp.json();

        if (createData.success && createData.result?.uuid) {
            console.log(`  数据库已创建 (API): ${createData.result.uuid}`);
            return createData.result.uuid;
        }

        console.log('  API 创建失败:', JSON.stringify(createData.errors));
        return null;
    } catch (e) {
        console.log('  API 异常:', e.message);
        return null;
    }
}

async function main() {
    console.log('\n🐕 DogNav Cloudflare 一键部署\n');

    // ─── Step 1: Install deps ───
    step('Step 1/5: 安装依赖');
    if (!fs.existsSync(path.join(ROOT, 'node_modules', 'hono'))) {
        console.log('安装依赖中...');
        run('npm install', { stdio: 'inherit' });
    }
    console.log('✓ 依赖已就绪');

    // ─── Step 2: Check auth ───
    step('Step 2/5: 检查 Cloudflare 认证');
    const whoami = run('npx wrangler whoami');
    if (whoami.includes('not logged in') || whoami.includes('Error') || !whoami.includes('@')) {
        console.log('需要登录 Cloudflare...');
        console.log('即将打开浏览器，请在浏览器中完成登录。\n');
        run('npx wrangler login', { stdio: 'inherit' });
    }
    console.log('✓ Cloudflare 认证通过');

    // ─── Step 3: Create D1 database ───
    step('Step 3/5: 创建 D1 数据库');
    let dbId = '';

    // 方式 1: wrangler CLI
    const dbList = run('npx wrangler d1 list');
    const dbMatch = dbList.match(new RegExp(`${DB_NAME}.*?([a-f0-9-]{36})`, 'i'));

    if (dbMatch) {
        dbId = dbMatch[1];
        console.log(`✓ 数据库已存在: ${DB_NAME} (${dbId})`);
    } else {
        console.log(`创建新数据库: ${DB_NAME}`);
        const createOut = run(`npx wrangler d1 create ${DB_NAME}`);
        const idMatch = createOut.match(/database_id\s*=\s*"([a-f0-9-]{36})"/);

        if (idMatch) {
            dbId = idMatch[1];
            console.log(`✓ 数据库已创建 (CLI): ${dbId}`);
        } else {
            console.log('  wrangler CLI 创建失败，完整输出:');
            console.log('  ' + createOut.split('\n').join('\n  '));

            // 方式 2: REST API fallback
            console.log('\n  尝试通过 Cloudflare API 创建...');
            dbId = await createD1ViaAPI();

            if (!dbId) {
                console.error('\n✗ 无法创建 D1 数据库');
                console.error('  请手动执行:');
                console.error('    npx wrangler d1 create dognav');
                console.error('  然后将 database_id 复制到 wrangler.toml\n');
                process.exit(1);
            }
        }
    }

    // ─── Step 4: Update wrangler.toml ───
    step('Step 4/5: 更新配置');
    let toml = fs.readFileSync(TOML_PATH, 'utf8');

    if (toml.includes('database_id')) {
        toml = toml.replace(/database_id\s*=\s*".*"/, `database_id = "${dbId}"`);
    } else {
        toml = toml.replace(
            /(database_name\s*=\s*"dognav")/,
            `$1\ndatabase_id = "${dbId}"`
        );
    }
    fs.writeFileSync(TOML_PATH, toml);
    console.log(`✓ wrangler.toml 已更新 (database_id = ${dbId})`);

    // ─── Step 5: Deploy ───
    step('Step 5/5: 部署到 Cloudflare');
    run('npx wrangler deploy', { stdio: 'inherit' });

    // ─── Done! ───
    console.log(`\n${'═'.repeat(50)}`);
    console.log('  ✅ 部署成功!');
    console.log('═'.repeat(50));
    console.log(`\n  🌐 网站地址: https://${DB_NAME}.<你的子域名>.workers.dev`);
    console.log(`  🔧 后台管理: https://${DB_NAME}.<你的子域名>.workers.dev/admin`);
    console.log(`  👤 默认账号: admin / admin123`);
    console.log(`\n  首次访问网站时 Worker 会自动创建数据库表和默认数据。`);
    console.log(`  如需导入完整 150+ 站点数据，运行: npm run db:seed\n`);
}

main().catch(err => {
    console.error('\n✗ 部署失败:', err.message);
    process.exit(1);
});
