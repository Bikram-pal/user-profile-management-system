# 🗄️ UPMS Database Setup Guide (MongoDB & Mongoose)

This project uses **MongoDB** as its primary database with **Mongoose** as the ODM (Object Data Modeling) layer.

Follow either **Option 1 (Recommended – Free Cloud Database, No Install Needed)** or **Option 2 (Local MongoDB on Windows)**.

---

## 🌟 Option 1: MongoDB Atlas Cloud (Recommended – 3 Minutes, Free Forever)

Using MongoDB Atlas requires **no software installation** on your Windows computer and works anywhere.

### Step 1: Create a Free Account
1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with Google or your email (it is 100% free, no credit card required).

### Step 2: Create a Free Cluster (M0)
1. Choose the **Free (M0)** tier.
2. Select your nearest cloud provider & region (e.g. AWS / Mumbai or Singapore).
3. Click **Create Deployment** (or **Create Cluster**).

### Step 3: Create a Database User
1. Under **Quickstart** or navigate to **Security** -> **Database Access**.
2. Click **Add New Database User**.
3. Choose **Password Authentication**.
4. Set a **Username** (e.g. `upms_admin`) and a **Password** (e.g. `adminPass123`).
   > ⚠️ **Important:** Avoid special characters like `@`, `:`, `/`, or `#` in the password, or URL-encode them.
5. Set Database User Privileges to **Read and write to any database**.
6. Click **Add User** (or **Built-in Role**).

### Step 4: Allow Network Access (IP Whitelist)
1. In the left sidebar, click **Network Access** (under Security).
2. Click **Add IP Address**.
3. Select **Allow Access from Anywhere** (`0.0.0.0/0`).
4. Click **Confirm**. (This allows your local app to connect to the cloud DB).

### Step 5: Get Your Connection String
1. Go to **Database** (or **Clusters**) in the left menu.
2. Click the **Connect** button next to your cluster.
3. Select **Drivers** (Node.js).
4. Copy the connection string provided. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` with your Atlas username.
6. Replace `<password>` with your Atlas password.
7. Change the path to add the database name `/user_profile_db`, like this:
   ```
   mongodb+srv://upms_admin:adminPass123@cluster0.xxxx.mongodb.net/user_profile_db?retryWrites=true&w=majority
   ```

### Step 6: Paste into `server/.env`
Open `server/.env` and update `MONGO_URI`:
```env
PORT=5000
MONGO_URI=mongodb+srv://upms_admin:adminPass123@cluster0.xxxx.mongodb.net/user_profile_db?retryWrites=true&w=majority
JWT_SECRET=upms_super_secret_jwt_key_2024_secure_and_random
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

---

## 💻 Option 2: Local MongoDB on Windows

If you prefer running MongoDB locally on your machine:

### Step 1: Download & Install MongoDB Community Server
1. Visit: [MongoDB Community Download](https://www.mongodb.com/try/download/community)
2. Select **Windows x64** and package **MSI**.
3. Run the downloaded installer:
   - Choose **Complete** setup.
   - Check **"Install MongoDB as a Service"** (Run service as Network Service user).
   - Check **"Install MongoDB Compass"** (graphical UI to view tables and records).
4. Complete the installation.

### Step 2: Verify the Local Service is Running
Open PowerShell as Administrator and run:
```powershell
net start MongoDB
```
If it is already started, it will output: *The requested service has already been started.*

### Step 3: Update `server/.env`
In `server/.env`:
```env
MONGO_URI=mongodb://127.0.0.1:27017/user_profile_db
```

---

## 🐳 Option 3: Run with Docker (If you use Docker)

If you have Docker Desktop installed, you can start a local MongoDB container with one command:
```bash
docker run -d --name upms-mongo -p 27017:27017 mongo:latest
```
Your URI will be `mongodb://127.0.0.1:27017/user_profile_db`.

---

## 🧪 Testing Your Database Connection

We added an automated diagnostic script to check your database configuration instantly:

```bash
cd server
npm run test-db
```

**If connected successfully, you will see:**
```
✅ SUCCESS: Database connected successfully!
   Host:     cluster0-shard-00-00.xxxx.mongodb.net
   Database: user_profile_db
   Latency:  180ms
🚀 Your database is READY!
```

---

## 🌱 Seeding Initial Data

Once your database is connected, insert the default admin and sample users:

```bash
cd server
npm run seed
```

**Default Accounts Created:**
| Role | Email | Password | Notes |
|---|---|---|---|
| **Admin** | `admin@upms.com` | `admin123` | Full access to user management panel |
| **User** | `bikram@upms.com` | `user123` | Pre-populated profile with bio & address |
| **User** | `test@upms.com` | `user123` | Standard test profile |

---

## 🚀 Running the Full Stack Application

### Start Backend:
```bash
cd server
npm run dev
# Running on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### Start Frontend:
```bash
cd client
npm install
npm run dev
# Running on http://localhost:5173
```

---

## 🔍 Common Errors & Troubleshooting

| Error | Root Cause | Solution |
|---|---|---|
| `connect EACCES 127.0.0.1:27017` or `ECONNREFUSED` | Local MongoDB is not installed or service is stopped | Start service with `net start MongoDB` or switch to **Option 1 (MongoDB Atlas)**. |
| `bad auth : authentication failed` | Wrong Atlas username or password | Re-check credentials in Atlas -> Database Access. If password contains special characters, URL-encode them. |
| `querySrv ENOTFOUND` | DNS resolution failure | Check your internet connection or use standard non-srv connection string. |
| `MongooseServerSelectionError` | IP not whitelisted in Atlas | In MongoDB Atlas -> Network Access -> Add IP Address -> Add `0.0.0.0/0` (Allow from anywhere). |
| `E11000 duplicate key error` | Email already exists | The email address is already in use by another account. Use a unique email. |
