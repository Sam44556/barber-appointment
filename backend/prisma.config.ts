import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// In local dev, this loads the .env file. In Docker, env vars are already
// injected by docker-compose's env_file directive so this is a safe no-op
// (dotenv only sets vars that aren't already defined).
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Prefer DATABASE_URL. Note: DIRECT_URL in .env has an un-encoded '@'
    // in the password which makes it an invalid connection string.
    url: process.env.DATABASE_URL || process.env.DIRECT_URL,
  },
});