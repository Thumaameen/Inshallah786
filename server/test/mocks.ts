export const mockServices = {
  database: {
    checkConnection: async () => true
  },
  ai: {
    testConnection: async () => true
  },
  monitoring: {
    getMetrics: () => ({
      current: {
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        uptime: process.uptime(),
      },
      totalRequests: 0,
      totalErrors: 0,
      aiProcessing: 0
    })
  }
};