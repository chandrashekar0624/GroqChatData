import pkg from "pg";
const { Pool } = pkg;
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

// ✅ Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// ✅ Connect to PostgreSQL using Pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ✅ Initialize Drizzle ORM
export const db = drizzle(pool, { schema });
