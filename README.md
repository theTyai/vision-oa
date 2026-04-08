# Vision CSE — Online Assessment Platform
## Complete Setup Guide

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | v18 or higher | `node -v` |
| npm | v9 or higher | `npm -v` |
| MongoDB Atlas account | Free tier is fine | cloud.mongodb.com |

---

## Step 1 — MongoDB Atlas Setup

### 1a. Create a free cluster
1. Go to **https://cloud.mongodb.com** → sign in
2. Click **"Build a Database"** → choose **Free (M0)**
3. Pick any region close to you → click **Create**

### 1b. Create a database user
1. Left sidebar → **Database Access** → **Add New Database User**
2. Choose **Password** auth
3. Username: `visionadmin`, set a strong password
4. Role: **"Read and write to any database"**
5. Click **Add User**

### 1c. Whitelist your IP
1. Left sidebar → **Network Access** → **Add IP Address**
2. Development: click **"Allow Access from Anywhere"** (0.0.0.0/0)
3. Click **Confirm**

### 1d. Get your connection string
1. Click **"Connect"** on your cluster → **"Drivers"** → **Node.js**
2. Copy the string, replace `<password>` with your actual password:
   ```
   mongodb+srv://visionadmin:YourPassword@cluster0.xxxxx.mongodb.net/vision-oa?retryWrites=true&w=majority
   ```

---

## Step 2 — Configure Environment

Open `server/.env` and fill in:

```env
MONGO_URI=mongodb+srv://visionadmin:YourPassword@cluster0.xxxxx.mongodb.net/vision-oa?retryWrites=true&w=majority
JWT_SECRET=paste_a_long_random_string_here
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Generate a JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Step 3 — Install & Seed

```bash
# Install server dependencies
cd vision-oa/server
npm install

# Install client dependencies
cd ../client
npm install

# Seed database (creates questions + admin account)
cd ../server
npm run seed
```

Seed creates:
- 15 sample MCQ questions
- 3 coding problems (Easy / Medium / Hard)
- Default test config (MCQ starts 5 min from now)
- Admin account → **admin@visioncse.com** / **Admin@123**

---

## Step 4 — Add Your Logo

1. Copy your logo into: `client/src/assets/logo.png`
2. Open `client/src/components/VisionLogo.jsx`
3. Find and change:
   ```js
   // BEFORE:
   // import logoSrc from '../assets/logo.png'
   const logoSrc = null

   // AFTER:
   import logoSrc from '../assets/logo.png'
   // (delete the const logoSrc = null line)
   ```

Supports `.png` `.svg` `.jpg` `.webp` — just match the import extension.

---

## Step 5 — Run

```bash
# Terminal 1 — Backend
cd vision-oa/server
npm run dev
# ✅ MongoDB Atlas Connected
# 🚀 Server → http://localhost:5000

# Terminal 2 — Frontend
cd vision-oa/client
npm run dev
# ➜ http://localhost:5173
```

---

## Step 6 — Admin First Login

1. Open **http://localhost:5173**
2. Login: `admin@visioncse.com` / `Admin@123`
3. Go to **Test Config** tab — set start/end times for both rounds
4. Go to **MCQ Questions** — add or edit questions
5. Change your admin password!

---

## Adding More MCQ Questions

**Via Admin Panel:** Admin → MCQ Questions → Add Question (supports image upload)

**Via Seed (bulk):** Edit `server/scripts/seed.js` → add to `mcqQuestions` array → run `npm run seed:fresh`

```js
{
  questionText: 'What is the time complexity of quicksort?',
  options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
  correctOption: 1,   // 0=A, 1=B, 2=C, 3=D
  marks: 4,
  negativeMarks: 1,
  order: 16
}
```

---

## Enable Live Code Execution (Optional)

1. Get a free key at **https://rapidapi.com/judge0-official/api/judge0-ce**
2. Add to `server/.env`:
   ```env
   JUDGE0_API_KEY=your_key_here
   ```
3. Restart server — Run Code button now works live.

---

## Common Errors

| Error | Fix |
|-------|-----|
| `MongoServerSelectionError` | Check MONGO_URI in .env. Whitelist your IP in Atlas. |
| `Cannot find module` | Run `npm install` in both server/ and client/ |
| Port 5000 in use | Change `PORT=5001` in .env, update vite.config.js proxy |
| Logo not showing | Uncomment import in VisionLogo.jsx, delete `const logoSrc = null` |
| Admin panel 403 | Run `npm run seed` to create admin account |

---

## Project Structure

```
vision-oa/
├── client/src/
│   ├── assets/            ← PUT YOUR LOGO HERE (logo.png)
│   ├── components/        ← Navbar, Timer, Editor, Logo
│   ├── pages/             ← Login, Register, Dashboard, MCQTest, CodingTest, AdminPanel
│   ├── context/           ← Auth state
│   └── services/api.js    ← Axios instance
└── server/
    ├── config/db.js       ← MongoDB Atlas connection
    ├── controllers/       ← Business logic
    ├── models/            ← Mongoose schemas
    ├── routes/            ← API endpoints
    ├── scripts/seed.js    ← Database seeder
    ├── uploads/           ← Question images (auto-created)
    └── .env               ← Your secrets (never commit!)
```

---

## Security Before Going Live

- [ ] Change default admin password
- [ ] Use a 64+ char random JWT_SECRET
- [ ] Restrict Atlas IP to your server only
- [ ] Set `NODE_ENV=production`
- [ ] Set `CLIENT_URL` to your real domain

---

*Vision CSE Recruitment Assessment Platform*
