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

const users: Map<string, User> = new Map();
const securityEvents: SecurityEvent[] = [];
const auditLogs: AuditLog[] = [];

export const storage = {
  async getUser(id: string): Promise<User | null> {
    return users.get(id) || null;
  },

  async getUserByUsername(username: string): Promise<User | null> {
    for (const user of users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  },

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = Date.now().toString();
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.set(id, newUser);
    return newUser;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = users.get(id);
    if (!user) return null;
    
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    users.set(id, updatedUser);
    return updatedUser;
  },

  async createSecurityEvent(event: SecurityEvent): Promise<void> {
    securityEvents.push({
      ...event,
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
    });
  },

  async createAuditLog(log: AuditLog): Promise<void> {
    auditLogs.push({
      ...log,
      timestamp: log.timestamp || new Date(),
    });
  },

  async getSecurityEvents(limit = 100): Promise<SecurityEvent[]> {
    return securityEvents.slice(-limit);
  },

  async getAuditLogs(limit = 100): Promise<AuditLog[]> {
    return auditLogs.slice(-limit);
  },

  async createErrorLog(error: any): Promise<void> {
    console.error('Error logged:', error);
  },

  async getDocument(id: string): Promise<any> {
    return null;
  },

  async getDocuments(): Promise<any[]> {
    return [];
  },
};
