# 🚀 Step-by-Step Deployment Guide for UPMS

This guide walks you through deploying the complete **UPMS (User Profile Management System)** to the web for free using **Render** (Backend API), **Vercel** (Frontend UI), and **MongoDB Atlas** (Database).

---

## 📋 Overview of Deployment Architecture

```
┌─────────────────────────────────┐
│     MongoDB Atlas (Cloud)       │  <-- Already set up & running!
│ cluster0.6fvxd5a.mongodb.net   │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│     Render (Free Web Service)   │
│   Backend API: Node.js/Express  │  <-- https://upms-api.onrender.com
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│      Vercel (Free Static App)   │
│      Frontend UI: React + Vite  │  <-- https://upms-client.vercel.app
└─────────────────────────────────┘
```

---

## Step 1: Push Your Code to GitHub

Before deploying to Render and Vercel, your code must be on GitHub.

1. Open PowerShell in your project root:
   ```powershell
   cd C:\Users\palbi\OneDrive\Attachments\Desktop\project\upms\upms
   ```

2. Check git status to confirm all files are ready:
   ```powershell
   git status
   ```

3. Commit your changes:
   ```powershell
   git add .
   git commit -m "Production-ready UPMS with MongoDB Atlas, JWT Auth & Modern UI"
   ```

4. Create a new repository on [GitHub](https://github.com/new):
   - Name it `upms` (or `user-profile-management-system`).
   - Leave it **Public** (or **Private**).
   - Do **NOT** initialize with README, .gitignore, or license (we already have them).
   - Click **Create repository**.

5. Link your local repo and push:
   ```powershell
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/upms.git
   git push -u origin main
   ```

*(Note: Your `.gitignore` automatically protects `server/.env`, so your secrets will not be exposed).*

---

## Step 2: Deploy Backend API to Render (Free)

1. Go to [https://render.com](https://render.com) and click **Get Started** or **Sign In** with **GitHub**.
2. Click **New +** (top right) and select **Web Service**.
3. Under *Connect a repository*, choose your `upms` repository.
4. Fill in the service settings:
   - **Name:** `upms-api` (or any name you like)
   - **Region:** Nearest to you (e.g., *Singapore* or *Frankfurt*)
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`

5. Scroll down to **Environment Variables** and add the following keys:
   | Key | Value |
   |---|---|
   | `MONGO_URI` | `mongodb+srv://profileManagementSystem:QRU6vlnkexRwBsTT@cluster0.6fvxd5a.mongodb.net/profileManagementDB?retryWrites=true&w=majority` |
   | `JWT_SECRET` | `upms_super_secret_jwt_key_2024_secure_and_random` |
   | `JWT_EXPIRES_IN` | `7d` |
   | `NODE_ENV` | `production` |

6. Click **Create Web Service**.
7. Wait ~2 minutes for Render to build and start your server.
8. Once live, Render displays your URL at the top:
   ```
   https://upms-api-xxxx.onrender.com
   ```
9. **Test it:** Open `https://upms-api-xxxx.onrender.com/api/health` in your browser.  
   You should see:
   ```json
   { "status": "healthy", "database": { "connected": true } }
   ```

---

## Step 3: Deploy Frontend UI to Vercel (Free)

1. Go to [https://vercel.com](https://vercel.com) and log in with **GitHub**.
2. Click **Add New...** -> **Project**.
3. Under *Import Git Repository*, find your `upms` repo and click **Import**.
4. In the configuration screen:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and choose `client` (then click *Continue*).
   - Leave *Build Command* (`npm run build`) and *Output Directory* (`dist`) as default.
5. Expand the **Environment Variables** section:
   - **Name:** `VITE_API_URL`
   - **Value:** Paste your Render backend URL from Step 2 (e.g. `https://upms-api-xxxx.onrender.com`)
     *(Important: Do NOT include a trailing slash `/`)*
6. Click **Deploy**.
7. Within 60 seconds, your deployment will be complete and Vercel will give you a live production link (e.g., `https://upms-client.vercel.app`).

---

## Step 4: Final Connection (CORS Whitelist)

1. Copy your new Vercel URL (e.g. `https://upms-client.vercel.app`).
2. Go back to your [Render Dashboard](https://dashboard.render.com).
3. Click on your `upms-api` service -> **Environment**.
4. Add or update the variable:
   - **Key:** `CLIENT_URL`
   - **Value:** `https://upms-client.vercel.app`
5. Click **Save Changes** (Render will automatically redeploy with the updated setting).

---

## ✅ Testing Your Live Deployed Application

1. Open your Vercel URL: `https://upms-client.vercel.app`.
2. Click **Login** and test with your pre-seeded accounts:
   - **Admin:** `admin@upms.com` / `admin123`
   - **User:** `bikram@upms.com` / `user123`
3. Try updating your profile, uploading an avatar photo, and accessing the Admin Panel.
4. Try dark mode / light mode toggle!

---

## 💡 Notes on Free Tier Hosting:
- **Render Free Tier Spin-Down:** If inactive for 15 minutes, Render puts free services to sleep. The very first request after sleeping may take 30-40 seconds to wake up. Once awake, it responds with normal speed.
- **Vercel Frontend:** Vercel frontend is always instant and globally distributed on edge CDN.
- **MongoDB Atlas:** Free cluster is always on and does not sleep.
