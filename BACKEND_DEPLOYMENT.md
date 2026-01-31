# Sacred Sound Backend Deployment Guide

## 🚀 Railway Deployment Steps

### 1. Add PostgreSQL Database
1. Go to your Railway project: https://railway.com/project/90959665-aca6-4cf0-93a8-68dfb86f640d
2. Click "New" → "Database" → "Add PostgreSQL"
3. Wait for deployment to complete
4. Railway will auto-create `PGDATABASE_URL` variable

### 2. Configure Service
Your existing service should automatically detect the new backend structure.

**Environment Variables** (auto-set by Railway):
- `DATABASE_URL` → Reference `${{Postgres.PGDATABASE_URL}}`
- `NODE_ENV` → `production`
- `PORT` → Will be set by Railway

### 3. Initialize Database Schema
After first deployment, run the migrations:

**Option A: Railway CLI**
```bash
railway run node server/db/migrate.js
```

**Option B: Manual SQL**
1. Go to Railway → PostgreSQL → Data tab
2. Copy contents of `server/db/schema.sql`
3. Paste and execute

### 4. Deploy
Push to GitHub - Railway will auto-deploy:
```bash
git add .
git commit -m "feat: Add backend API with PostgreSQL"
git push origin main
```

---

## 🔌 API Endpoints

Base URL (after deployment): `https://sound-heal-me-production.up.railway.app/api`

### Authentication
- `POST /api/auth/login` - Login/create user
- `POST /api/auth/register` - Register with email

### Profile
- `GET /api/profile/:userId` - Get profile
- `PUT /api/profile/:userId` - Update profile
- `POST /api/profile/:userId/xp` - Add XP

### Sessions
- `GET /api/sessions/:userId` - All sessions
- `POST /api/sessions/:userId` - Create session
- `GET /api/sessions/:userId/recent` - Recent 10
- `GET /api/sessions/:userId/calendar/:year/:month` - Calendar
- `DELETE /api/sessions/:sessionId` - Delete

### Analytics
- `GET /api/analytics/:userId/streak` - Streak data
- `GET /api/analytics/:userId/mood-stats` - Mood trends
- `GET /api/analytics/:userId/recommendations` - AI recommendations

---

## 🧪 Local Testing

### 1. Install PostgreSQL
```bash
brew install postgresql@15
brew services start postgresql@15
```

### 2. Create Database
```bash
createdb soundheal
```

### 3. Setup Environment
```bash
cd server
cp .env.example .env
# Edit .env with your local DB URL
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Run Migrations
```bash
psql soundheal < db/schema.sql
```

### 6. Start Server
```bash
npm run dev  # Uses nodemon for auto-reload
# or
npm start
```

Server runs on http://localhost:3000

---

## 📊 Database Schema

### Tables
- **users**: Profile, XP, level, preferences, stats
- **sessions**: Completed practices with mood tracking
- **achievements**: Unlocked milestones

### Indexes
Optimized for:
- User session lookups
- Date-based queries
- Calendar views

---

## 🔒 Security Notes

**Current (MVP)**:
- Anonymous users with UUID
- No authentication required
- UUID stored in localStorage

**Recommended for Production**:
- Implement JWT tokens
- Add email/password auth
- Rate limiting
- Input validation
- HTTPS only

---

## 🐛 Troubleshooting

### Database connection fails
Check Railway logs:
```bash
railway logs
```

Verify `DATABASE_URL` is set:
```bash
railway variables
```

### Migrations not running
Manually execute schema:
1. Railway → PostgreSQL → Data
2. Copy/paste `server/db/schema.sql`

### CORS errors
Backend already configured for CORS.
If issues persist, check Railway environment variables.

---

## ✅ Verification Checklist

- [ ] PostgreSQL addon added to Railway
- [ ] Database schema executed
- [ ] Backend deployed successfully
- [ ] Health check responds: `/api/health`
- [ ] Can create user: `POST /api/auth/login`
- [ ] Can create session: `POST /api/sessions/:userId`
- [ ] Frontend connects to API

---

## 📝 Next Steps

After backend is live:
1. **Update frontend** to use API instead of IndexedDB
2. **Test sync** across multiple devices
3. **Add error handling** for offline scenarios
4. **Implement** achievements system
5. **Add** social features (optional)
