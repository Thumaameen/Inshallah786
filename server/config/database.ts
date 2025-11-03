import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

// Database connection string
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';

// SQL client for migrations
const migrationClient = postgres(DATABASE_URL, { max: 1 });

// Connection pool for queries
const queryClient = postgres(DATABASE_URL, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10
});

class DatabaseService {
  private db = drizzle(queryClient);
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    console.log('🔌 Initializing database connection...');

    try {
      // Run migrations
      await migrate(drizzle(migrationClient), {
        migrationsFolder: './migrations'
      });

      // Test connection
      await this.testConnection();

      this.isInitialized = true;
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  private async testConnection() {
    try {
      await this.db.execute(sql`SELECT 1`);
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  async healthCheck() {
    const status = {
      initialized: this.isInitialized,
      connected: false,
      migrations: false,
      error: null as string | null
    };

    try {
      // Check connection
      status.connected = await this.testConnection();

      // Check migrations
      const result = await this.db.execute(
        sql`SELECT COUNT(*) FROM drizzle.migrations`
      );
      status.migrations = true;

      return status;
    } catch (error) {
      status.error = error instanceof Error ? error.message : 'Unknown error';
      return status;
    }
  }

  getClient() {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  async cleanup() {
    await queryClient.end();
    await migrationClient.end();
  }
}

// Export singleton instance
export const database = new DatabaseService();

// Initialize database when imported
database.initialize().catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});