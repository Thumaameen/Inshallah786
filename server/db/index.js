import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Initialize the database connection
let client;
try {
  client = postgres(process.env.DATABASE_URL);
} catch (error) {
  console.error('Failed to initialize database:', error);
  // Use in-memory fallback
  client = postgres('postgres://localhost:5432/fallback');
}

export const db = drizzle(client);
export default db;