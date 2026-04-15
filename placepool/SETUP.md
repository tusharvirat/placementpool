# PlacePool — Setup & Deployment Guide

## Project Structure
```
placepool/
├── backend/          ← Node.js + Express + MongoDB API
└── frontend/         ← React app
```

---

## STEP 1 — MongoDB Atlas (Database)

1. Go to https://cloud.mongodb.com and create a FREE account
2. Click **"Build a Database"** → choose **FREE (M0 Sandbox)**
3. Choose any cloud region → Click **"Create"**
4. Under **Security → Database Access** → Add a database user
   - Username: `placepool_user`
   - Password: (auto-generate and copy it)
   - Role: **Atlas Admin**
5. Under **Security → Network Access** → Click **"Add IP Address"**
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0) → Confirm
6. Under **Deployment → Database** → Click **"Connect"**
   - Choose **"Drivers"** → Driver: Node.js
   - Copy the connection string — looks like:
     `mongodb+srv://placepool_user:<password>@cluster0.xxxxx.mongodb.net/`
7. Replace `<password>` with your actual password
8. Paste it into `backend/.env` as `MONGO_URI=<your_uri>placepool?retryWrites=true&w=majority`

---

## STEP 2 — Gmail OTP Setup (Nodemailer)

1. Log into the Gmail account you want to send OTPs from
2. Go to **Google Account → Security**
3. Enable **2-Step Verification** (required for App Passwords)
4. Go back to **Security → App Passwords**
5. Select **Mail** as the app, **Other** as the device → name it "PlacePool"
6. Google generates a **16-character password** — copy it exactly (no spaces)
7. In `backend/.env`:
   ```
   EMAIL_USER=yourgmail@gmail.com
   EMAIL_PASS=abcdefghijklmnop    ← 16 chars, no spaces
   ```

---

## STEP 3 — Cloudinary (File Uploads)

1. Go to https://cloudinary.com → Create FREE account
2. After signing in → go to **Dashboard**
3. Copy:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key**    → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`
4. Paste all three into `backend/.env`
5. Cloudinary handles ALL file types: PDF, video, PPT, images, ZIP, etc.

---

## STEP 4 — Backend Setup

```bash
cd placepool/backend

# Copy env file
cp .env.example .env

# Edit .env — fill in all values from Steps 1-3 above
nano .env          # or open in VS Code

# Install dependencies
npm install

# Start the server
npm run dev
```

Server starts at: http://localhost:5000
On first run it auto-creates:
- Admin user (using ADMIN_EMAIL / ADMIN_PASSWORD from .env)
- Default DSA topics (Arrays, Trees, DP, Graphs, etc.)
- Default subjects (OS, DBMS, CN, OOP, System Design)
- Default aptitude categories (Quant, Logical, Verbal, etc.)

---

## STEP 5 — Frontend Setup

```bash
cd placepool/frontend

# Install dependencies
npm install

# Start the React app
npm start
```

App starts at: http://localhost:3000

The frontend proxies all `/api/*` requests to `http://localhost:5000` automatically
(configured via `"proxy"` in frontend/package.json)

---

## STEP 6 — Using the Portal

### Admin Login
- URL: http://localhost:3000/login
- Email: whatever you set as `ADMIN_EMAIL` in .env (default: admin@university.edu)
- Password: whatever you set as `ADMIN_PASSWORD` in .env (default: Admin@1234)
- OTP will be sent to `ADMIN_EMAIL`

### Student Signup
- URL: http://localhost:3000/signup
- Students sign up with university email → get OTP → verified automatically

### Admin Panel
- After logging in as admin, click **"⚙ Admin Panel"** in the top-right
- Add DSA problems (with LeetCode link, difficulty, company tags)
- Add core subject questions (MCQ, short answer, true/false)
- Add aptitude questions (with options, correct answer, explanation)
- Add companies (name, role, tags, accent color)
- For each company → click "+ Resource" → upload any file OR paste a URL

---

## STEP 7 — Production Deployment (Optional)

### Backend → Railway / Render / Fly.io (all free tier)

**Railway (recommended):**
1. Go to https://railway.app → New Project → Deploy from GitHub
2. Connect your GitHub repo, select the `backend` folder
3. Add all environment variables from your `.env` in the Railway dashboard
4. Railway gives you a public URL like `https://placepool-api.up.railway.app`

**Render:**
1. Go to https://render.com → New Web Service → connect GitHub
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add env variables

### Frontend → Vercel (free)

1. Go to https://vercel.com → New Project → import GitHub repo
2. Root directory: `frontend`
3. Add env variable: `REACT_APP_API_URL=https://your-backend-url.railway.app`
4. In `frontend/src/api/axios.js`, change baseURL to:
   ```js
   baseURL: process.env.REACT_APP_API_URL || '/api'
   ```
5. Also update CORS in backend `.env`:
   ```
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```

---

## Features Summary

| Feature | Details |
|---|---|
| Auth | Signup + Login with email OTP (6-digit, 10min expiry) |
| DSA Sheet | Topics sidebar, problems with difficulty/company tags, LeetCode links, solve tracker |
| Core Subjects | Multiple subjects, topics, MCQ/short answer questions with answers |
| Aptitude | 6 categories, MCQ with options, instant feedback, progress rings |
| Company Resources | Admin adds companies, attaches any file format or URL |
| Progress Tracking | Per-user solved problems, aptitude done, streak, weekly bar chart |
| Admin Panel | Full CRUD for all content types, file uploads via Cloudinary |
| Charts | Doughnut (difficulty breakdown) + Bar (weekly activity) using Chart.js |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Chart.js, React Hot Toast |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT + bcryptjs + OTP via Nodemailer |
| File Uploads | Multer + Cloudinary (any file format, 100MB limit) |
| Email | Gmail SMTP via Nodemailer |

---

## Common Errors & Fixes

| Error | Fix |
|---|---|
| `MongoServerError: bad auth` | Wrong password in MONGO_URI — regenerate DB user password |
| `Invalid login: 535` (email) | Gmail App Password is wrong — must be 16 chars, no spaces |
| `CORS error` | Make sure CLIENT_URL in backend .env matches your frontend URL exactly |
| `Cannot POST /api/auth/login` | Backend not running — run `npm run dev` in the backend folder |
| OTP not received | Check spam folder; also verify EMAIL_USER and EMAIL_PASS are set correctly |
| File upload fails | Cloudinary credentials wrong — double-check cloud name, API key, secret |

