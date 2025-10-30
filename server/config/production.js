export const productionConfig = {
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '10000', 10),
    cors: {
      origin: ['https://*.onrender.com'],
      credentials: true
    },
    compression: {
      level: 6,
      threshold: 1024
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 100
    }
  },
  security: {
    militaryGrade: true,
    encryptionLevel: 'AES-256-GCM',
    quantumResistant: true,
    selfHealing: true
  },
  ai: {
    defaultModel: 'claude-3-sonnet-20240229',
    maxTokens: 4096,
    temperature: 0.7,
    militaryAccess: true
  },
  monitoring: {
    enabled: true,
    interval: 60000,
    alerts: true,
    performance: true,
    security: true
  }
};