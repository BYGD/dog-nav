#!/usr/bin/env node

/**
 * DogNav 一键部署到 Cloudflare
 * 
 * 使用方法:
 *   npm install
 *   npm run deploy
 * 
 * 前提条件:
 *   1. 已安装 Node.js 18+
 *   2. 已注册 Cloudflare 账号
 *   3. 首次运行会引导你登录 Cloudflare
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const WRANGLER = path.join(__dirname, 'node_modules', '.bin', process.platform === 'win32' ? 'wrangler.cmd' : 'wrangler');
const DB_NAME = 'dognav';

function run(cmd, opts = {}) {
    console.log(`\n> ${cmd}`);
    try {
        return execSync(cmd, { cwd: __dirname, encoding: 'utf8', stdio: 'pipe', ...opts }).trim();
    } catch (err) {
        // Return stdout even on error if available
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

    // ─── Step 1: Check wrangler ───
    step('Step 1/6: 检查 Wrangler');
    if (!fs.existsSync(WRANGLER)) {
        console.log('Wrangler 未安装，正在安装...');
        run('npm install');
    }
    console.log('✓ Wrangler 已就绪');

    // ─── Step 2: Check auth ───
    step('Step 2/6: 检查 Cloudflare 认证');
    const whoami = run(`${WRANGLER} whoami`);
    if (whoami.includes('not logged in') || whoami.includes('Error') || !whoami.includes('@')) {
        console.log('需要登录 Cloudflare...');
        console.log('即将打开浏览器，请在浏览器中完成登录。\n');
        run(`${WRANGLER} login`, { stdio: 'inherit' });
    }
    console.log('✓ Cloudflare 认证通过');

    // ─── Step 3: Create D1 database ───
    step('Step 3/6: 创建 D1 数据库');
    let dbId = '';

    // Check if database already exists
    const dbList = run(`${WRANGLER} d1 list`);
    const dbMatch = dbList.match(new RegExp(`${DB_NAME}\\s+\\|\\s+([a-f0-9-]{36})`));
    
    if (dbMatch) {
        dbId = dbMatch[1];
        console.log(`✓ 数据库已存在: ${DB_NAME} (${dbId})`);
    } else {
        console.log(`创建新数据库: ${DB_NAME}`);
        const createOut = run(`${WRANGLER} d1 create ${DB_NAME}`);
        const idMatch = createOut.match(/database_id\s*=\s*"([a-f0-9-]{36})"/);
        if (idMatch) {
            dbId = idMatch[1];
            console.log(`✓ 数据库已创建: ${dbId}`);
        } else {
            console.error('✗ 创建数据库失败，输出:', createOut);
            process.exit(1);
        }
    }

    // ─── Step 4: Update wrangler.toml ───
    step('Step 4/6: 更新配置');
    const tomlPath = path.join(__dirname, 'wrangler.toml');
    let toml = fs.readFileSync(tomlPath, 'utf8');
    toml = toml.replace(/database_id\s*=\s*".*"/, `database_id = "${dbId}"`);
    fs.writeFileSync(tomlPath, toml);
    console.log(`✓ wrangler.toml 已更新 (database_id = ${dbId})`);

    // ─── Step 5: Initialize database ───
    step('Step 5/6: 初始化数据库');
    
    // Check if tables already exist
    const checkResult = run(`${WRANGLER} d1 execute ${DB_NAME} --remote --command="SELECT COUNT(*) as cnt FROM sites" --json`);
    const needsSeed = checkResult.includes('no such table') || checkResult.includes('Error');
    
    if (needsSeed) {
        console.log('执行 schema.sql...');
        run(`${WRANGLER} d1 execute ${DB_NAME} --remote --file=./schema.sql`, { stdio: 'inherit' });
        
        console.log('\n执行 seed.sql...');
        run(`${WRANGLER} d1 execute ${DB_NAME} --remote --file=./seed.sql`, { stdio: 'inherit' });
        
        console.log('✓ 数据库初始化完成');
    } else {
        console.log('✓ 数据库已有数据，跳过初始化');
    }

    // ─── Step 6: Deploy ───
    step('Step 6/6: 部署到 Cloudflare');
    run(`${WRANGLER} deploy`, { stdio: 'inherit' });

    // ─── Done! ───
    console.log(`\n${'═'.repeat(50)}`);
    console.log('  ✅ 部署成功!');
    console.log('═'.repeat(50));
    console.log(`\n  🌐 网站地址: https://${DB_NAME}.workers.dev`);
    console.log(`  🔧 后台管理: https://${DB_NAME}.workers.dev/admin`);
    console.log(`  👤 默认账号: admin / admin123`);
    console.log(`\n  提示: 建议登录后立即修改默认密码!\n`);
}

main().catch(err => {
    console.error('\n✗ 部署失败:', err.message);
    process.exit(1);
});
