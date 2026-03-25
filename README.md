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

## Docker Compose

A `Dockerfile` is included for local builds, but the simplest setup is to run the published GHCR image with Docker Compose.
The published image is `ghcr.io/marvinvr/appartment-planner:latest`.

Create a `compose.yml` file with:

```yaml
services:
  appartment-planner:
    image: ghcr.io/marvinvr/appartment-planner:latest
    container_name: appartment-planner
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: file:/data/db/floorplanner.db
      UPLOAD_DIR: /data/uploads
      NEXT_PUBLIC_PDF_RENDER_SCALE: "1"
    volumes:
      - appartment_planner_data:/data

volumes:
  appartment_planner_data:
```

Start it with:

```bash
docker compose up -d
```

Then open `http://localhost:3000`.

To update later:

```bash
docker compose pull
docker compose up -d
```

## Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Drizzle ORM
- SQLite
- react-konva
