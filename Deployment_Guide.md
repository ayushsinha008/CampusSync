# Deployment Guide (Vercel)

Deploying Next.js 15 with MongoDB and NextAuth to Vercel is seamless.

## Step 1: Push Code to GitHub
1. Create a repository on GitHub.
2. Push your `CampusSync` code.
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

## Step 2: Configure MongoDB Atlas
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Go to Database Access and create a new user.
3. Go to Network Access and allow access from anywhere (`0.0.0.0/0`) or just Vercel IPs.
4. Get your connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/campussync?retryWrites=true&w=majority`

## Step 3: Import Project to Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your `CampusSync` GitHub repository.

## Step 4: Environment Variables
Add the following Environment Variables in Vercel before deploying:
- `MONGODB_URI`: Your MongoDB Atlas connection string.
- `NEXTAUTH_URL`: The production URL (e.g., `https://campussync.vercel.app`).
- `NEXTAUTH_SECRET`: A strong random string (e.g., run `openssl rand -base64 32`).

## Step 5: Deploy
1. Click **Deploy**.
2. Once the build finishes, your app is live!

### Seeding Production Database
You can temporarily connect to your production DB locally by changing `.env.local` to use your Atlas string and running `npx ts-node scripts/seed.ts`.
