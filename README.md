# Apartment Planner

Self-hosted floor plan layout planner built with Next.js, React Konva, Drizzle, and SQLite.

## What It Does

- Upload a floor plan PDF
- Calibrate the drawing to real-world dimensions
- Build a furniture library with real measurements
- Create and compare layout variants in the browser
- Persist project data locally with SQLite

## Local Development

1. Copy the example environment file: `cp .env.example .env`
2. Install dependencies: `bun install`
3. Start the app: `bun run dev`
4. Open `http://localhost:3000`

## Docker

Run the app with Docker Compose:

```bash
docker compose up --build
```

## Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Drizzle ORM
- SQLite
- react-konva
