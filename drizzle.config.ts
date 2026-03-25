import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  driver: "better-sqlite",
  dbCredentials: {
    url: (process.env.DATABASE_URL || "file:./data/db/floorplanner.db").replace("file:", ""),
  },
} satisfies Config;
