// Check environment - RENDER PRODUCTION ONLY
const isRender = Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID);
const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT);

// Production mode detection - Always production on Render
const isDevelopment = () => {
  return false; // Never development mode
};

// Production mode detection - Always true
const isProduction = () => {
  return true; // Always production
};