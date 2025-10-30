export const config = {
  apiBaseUrl: import.meta.env.PROD 
    ? '' // Use relative URLs in production
    : 'http://localhost:5000',
  apiTimeout: 30000,
  enableDebug: import.meta.env.DEV,
  wsUrl: import.meta.env.PROD
    ? `wss://${window.location.host}`
    : 'ws://localhost:5000'
};