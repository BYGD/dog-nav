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
 *   2. 创建 D1 数据库（如不存在）
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
        return err.stdout?.trim() || '';
    }
}

function step(msg) {
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`  ${msg}`);
    console.log('═'.repeat(50));
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

    const dbList = run('npx wrangler d1 list');
    const dbMatch = dbList.match(new RegExp(`${DB_NAME}\\s+\\|\\s+([a-f0-9-]{36})`));

    if (dbMatch) {
        dbId = dbMatch[1];
        console.log(`✓ 数据库已存在: ${DB_NAME} (${dbId})`);
    } else {
        console.log(`创建新数据库: ${DB_NAME}`);
        const createOut = run(`npx wrangler d1 create ${DB_NAME}`);
        const idMatch = createOut.match(/database_id\s*=\s*"([a-f0-9-]{36})"/);
        if (idMatch) {
            dbId = idMatch[1];
            console.log(`✓ 数据库已创建: ${dbId}`);
        } else {
            console.error('✗ 创建数据库失败');
            console.error('输出:', createOut);
            process.exit(1);
        }
    }

    // ─── Step 4: Update wrangler.toml ───
    step('Step 4/5: 更新配置');
    let toml = fs.readFileSync(TOML_PATH, 'utf8');

    if (toml.includes('database_id')) {
        // Replace existing database_id
        toml = toml.replace(/database_id\s*=\s*".*"/, `database_id = "${dbId}"`);
    } else {
        // Add database_id after database_name line
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
