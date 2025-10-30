export const config = {
  apiBaseUrl: import.meta.env.PROD 
    ? 'https://inshallah.onrender.com' // Render production URL
    : 'http://localhost:5000',
  apiTimeout: 60000, // Increased timeout for production
  enableDebug: import.meta.env.DEV,
  wsUrl: import.meta.env.PROD
    ? `wss://inshallah.onrender.com`
    : 'ws://localhost:5000',
  retryAttempts: 3,
  retryDelay: 1000,
  maxConcurrentRequests: 10
};