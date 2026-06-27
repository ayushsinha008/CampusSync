# Deployment Guide (Vercel)

Deploy CampusSync to Vercel with MongoDB Atlas and secure environment variables.

## Step 1: Push code to GitHub

```bash
git add .
git commit -m "Your message"
git push origin master
```

## Step 2: MongoDB Atlas

1. Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. **Database Access** — create a DB user with a strong password.
3. **Network Access** — allow `0.0.0.0/0` (or restrict to Vercel IPs later).
4. Copy connection string:
   `mongodb+srv://<user>:<password>@cluster.mongodb.net/campussync?retryWrites=true&w=majority`

## Step 3: Import to Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import the `CampusSync` GitHub repository.
3. Framework: **Next.js** (auto-detected).

## Step 4: Environment variables (required)

Set these in **Vercel → Project → Settings → Environment Variables** for **Production**:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` (no trailing slash) |
| `NEXTAUTH_SECRET` | Random secret: `openssl rand -base64 32` |
| `STAFF_EMAIL` | Admin login email (e.g. `staff@campus.sync`) |
| `STAFF_PASSWORD` | **Strong** admin password (never commit this) |
| `EMAIL_USER` | SMTP email for OTP (e.g. Gmail) |
| `EMAIL_PASS` | SMTP app password |

See `.env.example` for a template.

### Security notes

- **Never** set `NEXT_PUBLIC_STAFF_PASSWORD` in production.
- **Never** set `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS` in production.
- `STAFF_PASSWORD` is server-only — not exposed to the browser.
- After deploy, change default passwords if you seeded with demo data.

## Step 5: Deploy

Click **Deploy**. Build should complete with `npm run build`.

## Step 6: Seed production database (once)

Locally, point `.env.local` at your Atlas URI and run:

```bash
npm run seed
```

Then **change** `STAFF_PASSWORD` in Vercel to match what you want in production (or update the staff user password in MongoDB).

## File uploads on Vercel

Avatar and assignment uploads use in-database data URLs on Vercel (no local disk). Keep files under 10MB.

## Post-deploy checklist

- [ ] Login as staff with `STAFF_EMAIL` / `STAFF_PASSWORD`
- [ ] Student signup OTP email works
- [ ] MongoDB Atlas network allows connections
- [ ] `NEXTAUTH_URL` matches your live domain exactly
