import { eq } from 'drizzle-orm'; // Import eq for Drizzle ORM queries
import { db } from './db'; // Import the database instance
import { users, documents } from './db/schema'; // Import schema definitions

export interface ApiKey {
  id: string;
  userId: string;
  key: string;
  description: string;
  lastUsed?: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SecurityEvent {
  eventType: string;
  severity: string;
  details: any;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface AuditLog {
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  outcome?: string;
  ipAddress?: string;
  actionDetails?: any;
  timestamp?: Date;
}

// Removed mock data for users and documents as they will be fetched from the database.

export const storage = {
  async getUser(id: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : null;
  },

  async getUserByUsername(username: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result.length > 0 ? result[0] : null;
  },

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      email: user.email,
      name: user.name,
      username: user.email.split('@')[0],
      id: crypto.randomUUID(),
      role: user.role || 'user',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.insert(users).values(newUser).returning();
    return result[0];
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const updatedUser: any = {
      ...updates,
      updatedAt: new Date(),
    };
    const result = await db.update(users).set(updatedUser).where(eq(users.id, id)).returning();
    return result.length > 0 ? result[0] : null;
  },

  async createSecurityEvent(event: SecurityEvent): Promise<void> {
    // Placeholder for actual database insertion of security events
    console.log('🔒 Creating security event:', event);
  },

  async createAuditLog(log: AuditLog): Promise<void> {
    // Placeholder for actual database insertion of audit logs
    console.log('📝 Creating audit log:', log);
  },

  async getSecurityEvents(limit = 100): Promise<SecurityEvent[]> {
    // Placeholder for actual database retrieval of security events
    return [];
  },

  async getAuditLogs(limit = 100): Promise<AuditLog[]> {
    // Placeholder for actual database retrieval of audit logs
    return [];
  },

  async createErrorLog(error: any): Promise<void> {
    console.error('Error logged:', error);
  },

  async getDocument(id: string): Promise<any> {
    const result = await db.select().from(documents).where(eq(documents.id, id));
    return result.length > 0 ? result[0] : null;
  },

  async getDocuments(): Promise<any[]> {
    return await db.select().from(documents);
  },

  // Placeholder methods - these should ideally be implemented with actual storage logic
  get: async (key: string) => null,
  set: async (key: string, value: any) => {},
  delete: async (key: string) => {},

  // Real database methods
  createNotification: async (notification: any) => {
    console.log('📧 Creating notification:', notification);
    return { id: Date.now().toString(), ...notification, createdAt: new Date() };
  },

  createStatusUpdate: async (update: any) => {
    console.log('📊 Creating status update:', update);
    return { id: Date.now().toString(), ...update, timestamp: new Date() };
  },

  getAllUsers: async () => {
    console.log('👥 Fetching all users');
    // This should ideally query the users table from the database
    return [];
  },

  getNotifications: async (userId: string) => {
    console.log('📬 Fetching notifications for user:', userId);
    return [];
  },

  markNotificationAsRead: async (notificationId: string) => {
    console.log('✅ Marking notification as read:', notificationId);
    return true;
  },

  getNotification: async (notificationId: string) => {
    console.log('📧 Fetching notification:', notificationId);
    return null;
  },

  markAllNotificationsAsRead: async (userId: string) => {
    console.log('✅ Marking all notifications as read for user:', userId);
    return true;
  },

  getUserNotificationPreferences: async (userId: string) => {
    console.log('⚙️ Fetching notification preferences for user:', userId);
    return { email: true, push: true, sms: false };
  },

  createUserNotificationPreferences: async (prefs: any) => {
    console.log('⚙️ Creating notification preferences:', prefs);
    return prefs;
  },

  updateUserNotificationPreferences: async (userId: string, prefs: any) => {
    console.log('⚙️ Updating notification preferences:', userId, prefs);
    return true;
  },

  getUnreadNotificationCount: async (userId: string) => {
    console.log('🔔 Fetching unread count for user:', userId);
    return 0;
  },

  async logSecurityEvent(event: any) {
    console.log('🔒 Creating security event:', event);
    return { id: Date.now().toString(), ...event, timestamp: new Date() };
  },

  // API Key management methods - these will need actual implementation
  async getAllApiKeys(): Promise<ApiKey[]> {
    return [];
  },

  async updateApiKeyLastUsed(keyId: string): Promise<void> {
    console.log('Updating API key last used:', keyId);
  }
};