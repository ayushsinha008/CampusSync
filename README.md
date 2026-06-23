# CampusSync - Smart Campus Utility App

CampusSync is a production-ready full-stack web application designed for college students to organize their campus life. 

## Features
- **Authentication**: Secure login and signup via NextAuth (Credentials).
- **Dashboard**: Real-time stats on tasks, attendance, notices, and upcoming schedule.
- **Tasks Manager**: Add, track, complete, and delete personal tasks with priority and deadlines.
- **Timetable & Attendance**: Database schemas ready for Timetable tracking and Attendance calculation.
- **Dark Mode**: Fully responsive, accessible dark/light mode toggle.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS, Shadcn UI, Framer Motion
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB, Mongoose
- **Authentication**: NextAuth.js v4, bcryptjs
- **Validation**: Zod (Schema Validation ready)

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### Installation

1. Install dependencies
```bash
npm install
```

2. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your details.
```bash
cp .env.example .env.local
```

3. Seed the Database
```bash
npx ts-node scripts/seed.ts
```

4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Deployment
Check out the `Deployment_Guide.md` for deploying this application to Vercel.
