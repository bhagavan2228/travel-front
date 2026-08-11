# Voyager — AI Travel Frontend

Premium React + Tailwind CSS frontend for the AI-powered travel application.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion
- TanStack Query
- React Router

## Run locally

### 1. Start the backend

From `travel back` folder:

```powershell
# MySQL (travelback database) — set your password first
$env:MYSQL_PASSWORD = "your_mysql_password"
mvn spring-boot:run

# OR in-memory H2 (no MySQL password needed)
mvn spring-boot:run "-Dspring-boot.run.profiles=h2"
```

H2 profile runs on **http://localhost:8081/api** (default MySQL profile uses port **8080**).

### 2. Start the frontend

```powershell
cd "C:\Users\muthi\OneDrive\Desktop\travel front"
npm install
npm run dev
```

Open **http://localhost:5173**

## Features

- Landing page: hero, features, stats, testimonials, pricing, FAQ
- Dark / light mode
- Destination explorer (live API)
- Trip planner (authenticated)
- AI travel assistant chat bubble
- Reviews, events, and food recommendations per destination
- Glassmorphism UI, smooth animations, mobile-first layout

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api` | API base (proxied to backend in dev) |

## Build for production

```powershell
npm run build
npm run preview
```
