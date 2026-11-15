# User Profile Management System (UPMS - MERN Stack)

A complete full-stack web application built with **React (Vite)**, **Node.js / Express**, and **MongoDB (Mongoose)** for user profile management with role-based access control (User and Admin).

---

## ✨ Features

- **Authentication & Security:**
  - Secure JWT authentication stored in HTTP headers (`Bearer <token>`).
  - Passwords hashed with bcrypt (salt rounds = 10).
  - Protected API routes and client-side route guards (`ProtectedRoute`).
  - Account deactivation check (deactivated users cannot login).
- **User Profile Management:**
  - View full profile details (name, email, phone, bio, DOB, address, join date).
  - Edit personal profile information with instant feedback.
  - Avatar image upload (Multer with file size/type restrictions).
  - Secure password change flow (requires current password validation).
  - Self-service account deletion.
- **Admin Dashboard:**
  - Paginated user list with live text search (by name, email, phone).
  - Toggle user account active status (enable / disable).
  - Role management (promote to admin / demote to regular user).
  - Admin user deletion (with self-deletion protection).
- **Database Architecture:**
  - Document-based storage in MongoDB collection `users`.
  - Schema validation for emails, phone numbers, and string lengths.
  - Automatic timestamps (`createdAt`, `updatedAt`).

---

## 📁 Project Structure

```
upms/
├── DEPLOYMENT.md            # Complete free cloud deployment guide (Render + Vercel)
├── DATABASE_SETUP.md        # Comprehensive DB setup & troubleshooting guide
├── README.md                # Project documentation
├── server/
│   ├── server.js            # Express app entry point & CORS/Health config
│   ├── .env.example         # Template for environment variables
│   ├── .env                 # Server configuration (git-ignored)
│   ├── package.json
│   ├── uploads/             # Static storage for avatar photos
│   └── src/
│       ├── config/
│       │   └── db.js        # Mongoose connection & reconnection handlers
│       ├── test-db.js       # Database diagnostics tool
│       ├── models/
│       │   └── User.js      # Mongoose User schema & password hashing
│       ├── middleware/
│       │   ├── auth.js      # JWT verification & admin guard
│       │   ├── error.js     # 404 & centralized error handler
│       │   └── upload.js    # Multer photo upload config (max 2MB, JPG/PNG)
│       ├── controllers/
│       │   ├── authController.js # Register, login, me
│       │   └── userController.js # Profile CRUD, password, admin actions
│       ├── routes/
│       │   ├── authRoutes.js
│       │   └── userRoutes.js
│       └── seed.js          # Database initial data seeder
└── client/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── .env                 # VITE_API_URL=http://localhost:5000
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js           # Axios instance with auth interceptor
        ├── index.css        # Clean responsive styles
        ├── context/
        │   └── AuthContext.jsx # Global user authentication state
        ├── components/
        │   ├── Navbar.jsx
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Profile.jsx
            ├── EditProfile.jsx
            ├── ChangePassword.jsx
            └── AdminUsers.jsx
```

---

## 🚀 Quick Start Guide

### 1. Database Setup
See [DATABASE_SETUP.md](file:///c:/Users/palbi/OneDrive/Attachments/Desktop/project/upms/upms/DATABASE_SETUP.md) for detailed instructions.
- **Option A (Easiest):** Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and put your URI in `server/.env`.
- **Option B (Local):** Start local MongoDB service: `net start MongoDB`.

### 2. Verify Database Connection
```bash
cd server
npm run test-db
```

### 3. Seed Default Accounts
```bash
npm run seed
```
**Default Credentials:**
- **Admin Account:** `admin@upms.com` / `admin123`
- **User Account:** `bikram@upms.com` / `user123`
- **Test Account:** `test@upms.com` / `user123`

### 4. Start the Application
**Backend:**
```bash
cd server
npm run dev
# Server running at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

**Frontend:**
```bash
cd client
npm install
npm run dev
# Client running at http://localhost:5173
```

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Health check & DB connection status |
| `POST` | `/api/auth/register` | Public | Register new account & return JWT |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT |
| `GET` | `/api/auth/me` | Authenticated | Get current authenticated user |
| `GET` | `/api/users/profile` | Authenticated | Get user profile details |
| `PUT` | `/api/users/profile` | Authenticated | Update user profile fields |
| `PUT` | `/api/users/password` | Authenticated | Change user password |
| `POST` | `/api/users/avatar` | Authenticated | Upload profile picture (`multipart/form-data`) |
| `DELETE`| `/api/users/profile` | Authenticated | Permanently delete account |
| `GET` | `/api/users` | Admin Only | Search & paginate all users |
| `GET` | `/api/users/:id` | Admin Only | Get single user details by ID |
| `PUT` | `/api/users/:id` | Admin Only | Update user role or active status |
| `DELETE`| `/api/users/:id` | Admin Only | Delete user account by ID |
