// Load environment variables first
dotenv.config();

// Check environment - RENDER PRODUCTION ONLY
const isRender = Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID);
const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT);

// Force production configuration when API keys are present
const hasAllAPIKeys = !!(
  process.env.DHA_NPR_API_KEY &&
  process.env.DHA_ABIS_API_KEY &&
  process.env.SAPS_CRC_API_KEY &&
  process.env.ICAO_PKD_API_KEY
);

if (hasAllAPIKeys && process.env.NODE_ENV !== 'production') {
  console.log('🔧 All API keys detected - forcing production mode');
  process.env.NODE_ENV = 'production';
}


// Production mode detection - Always production on Render
const isDevelopment = () => {
  return false; // Never development mode
};

// Production mode detection - Always true
const isProduction = () => {
  return true; // Always production
};