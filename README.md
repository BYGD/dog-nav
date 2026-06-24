<div align="center">

<img src="https://raw.githubusercontent.com/BYGD/dog-nav/main/ico.ico" width="100" style="border-radius:50%" alt="DogNav Logo">

# 🐕 DogNav

### ✨ Discover the Best of the Internet ✨

**A curated navigation site with full CMS backend — self-hosted or one-click deploy to Cloudflare.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-nav.cangdog.com-FF6B6B?style=flat-square)](https://nav.cangdog.com)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-dognav.ccgg.workers.dev-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://dognav.ccgg.workers.dev)
[![Version](https://img.shields.io/badge/Version-2.0-4ECDC4?style=flat-square)]()
[![Sites](https://img.shields.io/badge/Sites-151+-45B7D1?style=flat-square)]()
[![Categories](https://img.shields.io/badge/Categories-10-96CEB4?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-FFEAA7?style=flat-square)]()

<br>

[![Deploy to Cloudflare](https://img.shields.io/badge/Deploy_to_Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](#cloudflare-one-click-deploy)

</div>

---

## 📋 Table of Contents

```
dog-nav/
├── 📖 About
├── 🌟 Features
├── 🏗️ Architecture
├── 🚀 Quick Start
│   ├── Local Development
│   └── Cloudflare One-Click Deploy
├── 🔧 Admin Panel
├── 📁 Project Structure
├── 🛠️ Tech Stack
├── 📸 Screenshots
└── 📄 License
```

---

## 📖 About

DogNav is a carefully curated website navigation directory that helps you discover the best of the internet. It features a **glassmorphism UI** with dark/light theme support, **151+ hand-picked sites** across 10 categories, and a **full CMS backend** for easy content management.

Originally built as a pure static frontend, DogNav has evolved into a full-stack application with two deployment options: a local Node.js CMS and a serverless Cloudflare Workers version.

---

## 🌟 Features

| Feature | Description |
|:--------|:------------|
| 🎨 **Glassmorphism UI** | Modern frosted-glass design with smooth animations and mouse glow effects |
| 🌓 **Dark / Light Mode** | Seamless theme switching with persistent preference |
| 🔍 **Multi-Engine Search** | Google, Bing, Baidu, DuckDuckGo — search directly from the nav bar |
| 📂 **10 Categories** | Recommend, Video, Anime, Software, Tools, News, Community, AI, Dev, Design |
| 📱 **Fully Responsive** | Optimized for desktop, tablet, and mobile devices |
| 🇨🇳 **China Optimized** | All sites accessible from mainland China, CDN via Chinese-friendly providers |
| 🗄️ **Full CMS Backend** | Manage sites, categories, pages, links, users, and settings via admin panel |
| 📊 **Click Analytics** | Track site popularity with built-in click counting |
| 📝 **User Submissions** | Visitors can submit sites for admin review and approval |
| ☁️ **Cloudflare Deploy** | One-click deploy to Cloudflare Workers + D1 serverless stack |
| 🔐 **Admin Auth** | Bearer token authentication with action audit logging |
| 📦 **Zero Config** | Pre-seeded with 151 sites, 10 categories, and default settings |

---

## 🏗️ Architecture

DogNav provides **two deployment modes** with the same frontend and API:

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (HTML/CSS/JS)              │
│   index.html · about.html · links.html · contribute  │
│              + 12 admin panel pages                  │
└────────────────────┬────────────────────────────────┘
                     │ fetch('/api/...')
        ┌────────────┴────────────┐
        ▼                         ▼
┌───────────────┐       ┌──────────────────┐
│  Local Mode   │       │  Cloudflare Mode  │
│               │       │                   │
│  Express.js   │       │  Hono Framework   │
│  + sql.js     │       │  + D1 (SQLite)    │
│  + multer     │       │  + Workers Assets │
│  Port 3000    │       │  Edge Runtime     │
└───────────────┘       └──────────────────┘
```

| | Local Mode | Cloudflare Mode |
|:--|:-----------|:----------------|
| **Runtime** | Node.js (Express) | Cloudflare Workers (Hono) |
| **Database** | sql.js (file-based SQLite) | D1 (serverless SQLite) |
| **Upload** | multer → `./uploads` | Not included |
| **Deploy** | `node server.js` | `wrangler deploy` |
| **Cost** | Free (self-hosted) | Free tier generous |

---

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/BYGD/dog-nav.git
cd dog-nav

# Install dependencies
npm install

# Seed the database (first time)
node seed.js

# Start the server
npm start
# → http://localhost:3000
```

**Default admin:** `admin` / `admin123`

### Cloudflare One-Click Deploy

```bash
# Clone the repository
git clone https://github.com/BYGD/dog-nav.git
cd dog-nav/cloudflare

# Install dependencies
npm install

# One-click deploy (handles auth, D1 creation, schema, seed, and deploy)
npm run deploy
```

The deploy script will:

1. Check & install Wrangler CLI
2. Guide you through Cloudflare login (browser OAuth)
3. Create a D1 database (or reuse existing)
4. Update `wrangler.toml` with the database ID
5. Run `schema.sql` + `seed.sql` to initialize data
6. Deploy the Worker with all static assets

**Your site will be live at:** `https://dognav.<your-subdomain>.workers.dev`

### Manual Cloudflare Deploy

```bash
cd cloudflare

# Login to Cloudflare
npx wrangler login

# Create D1 database
npx wrangler d1 create dognav
# → Copy the database_id to wrangler.toml

# Initialize database
npx wrangler d1 execute dognav --remote --file=./schema.sql
npx wrangler d1 execute dognav --remote --file=./seed.sql

# Deploy
npx wrangler deploy
```

---

## 🔧 Admin Panel

Access the admin panel at `/admin` — a full CMS to manage every aspect of your navigation site.

| Module | Description |
|:-------|:------------|
| 📊 **Dashboard** | Overview with site stats, recent submissions, and quick actions |
| 🌐 **Sites** | Add, edit, delete, and reorder navigation sites |
| 📂 **Categories** | Manage site categories with icons and sort order |
| 📄 **Pages** | Rich-text editor for About, Contribute, and Links pages |
| 🔗 **Links** | Manage friend links displayed on the Links page |
| 📝 **Submissions** | Review and approve/reject user-submitted sites |
| 📈 **Statistics** | Click analytics with per-site tracking |
| 👥 **Users** | Manage admin accounts and permissions |
| ⚙️ **Settings** | Site title, description, footer, SEO, and appearance settings |
| 📋 **Logs** | Admin action audit trail |
| 🚨 **Reports** | View and resolve dead link / issue reports from visitors |
| 💾 **Backup** | Export and import database backups |

---

## 📁 Project Structure

```
dog-nav/
├── index.html              # Main navigation page
├── about.html              # About page (CMS-driven)
├── links.html              # Friend links page (CMS-driven)
├── contribute.html          # Site submission page (CMS-driven)
├── server.js               # Local CMS server (Express + sql.js, 1005 lines)
├── seed.js                 # Database seed script
├── package.json            # Node.js dependencies
│
├── css/
│   ├── style.css           # Main stylesheet (glassmorphism, themes)
│   └── font-awesome.css    # Icon library
├── js/
│   └── app.js              # Frontend logic (rendering, search, themes)
├── ico/                    # Site favicon images
│
├── admin/                  # Admin panel (12 pages)
│   ├── index.html          # Login page
│   ├── dashboard.html      # Main dashboard
│   ├── categories.html     # Category management
│   ├── ...                 # (see Admin Panel section)
│   └── backup.html         # Database backup
│
├── cloudflare/             # Cloudflare Workers deployment
│   ├── src/
│   │   └── index.js        # Hono API backend (446 lines)
│   ├── public/             # Static assets (copy of frontend)
│   ├── schema.sql          # D1 database schema (10 tables)
│   ├── seed.sql            # Seed data (151 sites, 10 categories)
│   ├── deploy.js           # One-click deploy script
│   ├── wrangler.toml       # Cloudflare configuration
│   └── package.json        # CF dependencies (hono, wrangler)
│
├── robots.txt              # Search engine rules
├── sitemap.xml             # XML sitemap
└── README.md               # This file
```

---

## 🛠️ Tech Stack

**Frontend**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Font Awesome](https://img.shields.io/badge/Font_Awesome-528DD7?style=flat-square&logo=font-awesome&logoColor=white)

**Local Backend**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)

**Cloudflare Backend**

![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)
![Hono](https://img.shields.io/badge/Hono-E36002?style=flat-square)
![D1](https://img.shields.io/badge/D1_SQLite-004B85?style=flat-square)

---

## 📸 Screenshots

<div align="center">

**Dark Theme**

![Dark Mode](https://raw.githubusercontent.com/BYGD/dog-nav/main/screenshot.png)

**Light Theme**

![Light Mode](https://raw.githubusercontent.com/BYGD/dog-nav/main/screenshot-light.png)

</div>

---

## 🌍 Deployment Links

| Platform | URL | Notes |
|:---------|:----|:------|
| Tencent EdgeOne | [nav.cangdog.com](https://nav.cangdog.com) | Static frontend (original) |
| Cloudflare Workers | [dognav.ccgg.workers.dev](https://dognav.ccgg.workers.dev) | Full-stack with CMS |
| Local | `localhost:3000` | Self-hosted with Node.js |

---

## 📄 License

This project is open source under the [MIT License](LICENSE).

---

<div align="center">

**⭐ If you find this project useful, consider giving it a star! ⭐**

[Live Demo](https://nav.cangdog.com) · [Cloudflare Demo](https://dognav.ccgg.workers.dev) · [Report Bug](https://github.com/BYGD/dog-nav/issues) · [Request Feature](https://github.com/BYGD/dog-nav/issues)

</div>
