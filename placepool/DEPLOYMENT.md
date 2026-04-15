# PlacePool — Production Deployment Guide (Railway + Vercel)

## THE #1 REASON LOGIN FAILS IN PRODUCTION

The `proxy` setting in `frontend/package.json` only works **locally**.
On Vercel, you MUST set `REACT_APP_API_URL` as an environment variable.
Without it, the frontend calls `/api/...` which goes to Vercel itself — not Railway.

---

## STEP-BY-STEP (follow exactly in this order)

### Step 1 — Push your code to GitHub

```bash
cd placepool
git init
git add .
git commit -m "PlacePool v4"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/placepool.git
git push -u origin main
```

Make sure `.gitignore` has `node_modules/` and `.env` in it.

---

### Step 2 — Deploy Backend on Railway

1. Go to https://railway.app → Login with GitHub → **New Project** → **Deploy from GitHub repo**
2. Select your `placepool` repository
3. Railway will detect the repo — click **Add Service** → **GitHub Repo**
4. Click on the service → **Settings** → **Root Directory** → type: `backend` → Save
5. Click **Deploy** (first deploy may fail until env vars are set — that's OK)

**Add ALL these environment variables in Railway → Variables:**

```
MONGO_URI          = mongodb+srv://user:pass@cluster.mongodb.net/placepool?retryWrites=true&w=majority
JWT_SECRET         = (run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_EXPIRE         = 7d
EMAIL_HOST         = smtp.gmail.com
EMAIL_PORT         = 587
EMAIL_USER         = yourgmail@gmail.com
EMAIL_PASS         = abcdefghijklmnop
EMAIL_FROM         = PlacePool <yourgmail@gmail.com>
CLOUDINARY_CLOUD_NAME = your_cloud_name
CLOUDINARY_API_KEY    = your_api_key
CLOUDINARY_API_SECRET = your_api_secret
ADMIN_EMAIL        = admin@youremail.com
ADMIN_PASSWORD     = Admin@1234
ADMIN_NAME         = Portal Admin
NODE_ENV           = production
PORT               = 5000
CLIENT_URL         = (leave empty for now — fill after Step 3)
```

6. Click **Deploy** → wait for build to finish (2-3 minutes)
7. Click **Settings** → **Networking** → copy the Railway public URL
   It looks like: `https://placepool-production-xxxx.up.railway.app`
8. Test it: open that URL in browser → should show `{"message":"PlacePool API ✅"}`

---

### Step 3 — Deploy Frontend on Vercel

1. Go to https://vercel.com → Login with GitHub → **New Project** → Import your repo
2. **Framework Preset**: Create React App
3. **Root Directory**: click Edit → type `frontend` → Continue
4. **Environment Variables** → Add:
   ```
   REACT_APP_API_URL = https://your-railway-url.up.railway.app/api
   ```
   ← Replace with your actual Railway URL from Step 2, with `/api` at the end
5. Click **Deploy** → wait ~2 minutes
6. Copy your Vercel URL — looks like: `https://placepool-xyz.vercel.app`

---

### Step 4 — Update CLIENT_URL in Railway

Go back to **Railway → Variables** and set:
```
CLIENT_URL = https://placepool-xyz.vercel.app
```
← Use your actual Vercel URL. NO trailing slash. Must be exact https URL.

Railway will automatically redeploy with the new variable.

---

### Step 5 — Verify Everything Works

Open your Vercel URL and check each item:

- [ ] Login page loads
- [ ] Admin login works (email OTP arrives in inbox)
- [ ] OTP verification works → redirected to dashboard
- [ ] Admin Panel accessible
- [ ] Add a DSA problem → appears without refresh
- [ ] Upload a company resource → Open button works
- [ ] Student signup works (OTP arrives)
- [ ] Logout → redirected to login

---

## COMMON ERRORS & FIXES

### "Login failed" / "Network Error" on Vercel

**Cause**: `REACT_APP_API_URL` not set or wrong in Vercel.

**Fix**:
1. Vercel → Project → Settings → Environment Variables
2. Add `REACT_APP_API_URL` = `https://YOUR-RAILWAY-URL.up.railway.app/api`
3. **IMPORTANT**: Go to Vercel → Deployments → click the 3 dots → **Redeploy**
   (env vars only take effect on a new deploy)

---

### CORS error in browser console

**Cause**: `CLIENT_URL` in Railway doesn't match Vercel URL exactly.

**Fix**: Railway → Variables → set `CLIENT_URL` = `https://placepool-xyz.vercel.app`
- No trailing slash
- Must be `https://` not `http://`
- Must be exact URL the browser sends as `Origin`

**To find the exact origin**: Open browser DevTools → Network → click the failing request → look at Request Headers → `Origin:` value → use that exact value.

---

### OTP email not arriving

**Cause**: Gmail App Password wrong or 2-Step Verification not enabled.

**Fix**:
1. Gmail → Google Account → Security → 2-Step Verification → Enable
2. Security → App Passwords → generate new one → copy all 16 chars
3. Railway → Variables → `EMAIL_PASS` = paste without spaces
4. Railway → Redeploy

---

### Railway build fails

**Cause**: Missing `node_modules` or wrong root directory.

**Fix**:
1. Railway → Service → Settings → Root Directory = `backend`
2. Make sure `package.json` start script = `"start": "node server.js"` (not nodemon)
3. Trigger a new deploy

---

### MongoDB connection fails

**Cause**: Wrong password or IP not whitelisted.

**Fix**:
1. MongoDB Atlas → Network Access → Add `0.0.0.0/0` (Allow from anywhere)
2. Check MONGO_URI has the correct password (no angle brackets)
3. Format: `mongodb+srv://user:ACTUALPASSWORD@cluster.xxxxx.mongodb.net/placepool?retryWrites=true&w=majority`

---

### 404 on page refresh on Vercel

**Cause**: Vercel doesn't know to serve `index.html` for all routes.

**Fix**: The `vercel.json` file in the `frontend/` folder handles this:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```
This is already included in the zip.

---

## QUICK CHECKLIST

| Check | Where | Value |
|---|---|---|
| `REACT_APP_API_URL` set | Vercel → Settings → Env Vars | `https://xxx.up.railway.app/api` |
| `CLIENT_URL` set | Railway → Variables | `https://xxx.vercel.app` (no slash) |
| Root directory | Railway → Settings | `backend` |
| Start script | backend/package.json | `"start": "node server.js"` |
| vercel.json | frontend/vercel.json | rewrites to index.html |
| MongoDB IP | Atlas → Network Access | `0.0.0.0/0` |
| Redeployed Vercel | Vercel → Deployments | after adding env var |

