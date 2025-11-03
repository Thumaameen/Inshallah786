import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../config/environment';

// Initialize connection pool only if DATABASE_URL is configured
let pool: Pool | null = null;
let db: any = null;

if (env.DATABASE_URL && typeof env.DATABASE_URL === 'string' && env.DATABASE_URL.length > 0) {
  try {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Initialize Drizzle with the pool
    db = drizzle(pool, {
      logger: env.NODE_ENV === 'development',
    });
    
    console.log('✅ Database connection pool initialized');
    console.log('📊 Database configuration:');
    console.log('   - Max connections: 20');
    console.log('   - Idle timeout: 30s');
    console.log('   - Connection timeout: 2s');
    console.log('   - SSL enabled:', env.NODE_ENV === 'production' ? 'Yes' : 'No');
  } catch (error) {
    console.error('⚠️  Database initialization error:', error);
    console.log('📝 Application will continue without database');
  }
} else {
  console.log('⚠️  DATABASE_URL not configured - using in-memory storage');
}

export { db };

// Health check function
export const checkDatabaseConnection = async () => {
  if (!pool) {
    console.log('⚠️  Database not configured');
    return false;
  }
  
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};

// Connection management
process.on('SIGINT', async () => {
  if (pool) {
    await pool.end();
  }
  process.exit(0);
});