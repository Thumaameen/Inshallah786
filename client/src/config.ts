export const config = {
  apiBaseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://dha-thisone.onrender.com'
    : 'http://localhost:3000',
  apiTimeout: 30000,
  enableDebug: process.env.NODE_ENV === 'development',
};