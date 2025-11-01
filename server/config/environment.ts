// Integration Flags - PRODUCTION READY
    ENABLE_REAL_CERTIFICATES: true,
    ENABLE_BIOMETRIC_VALIDATION: true,
    ENABLE_GOVERNMENT_INTEGRATION: true,
    USE_MOCK_DATA: false,
    FORCE_REAL_APIS: true,
    BYPASS_MODE: false,
    
    // All AI Provider Keys
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || '',
    GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '',
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY || '',
    XAI_API_KEY: process.env.XAI_API_KEY || '',
    
    // Government API Keys
    DHA_NPR_API_KEY: process.env.DHA_NPR_API_KEY || process.env.DHA_NPR_API_KEY1 || '',
    DHA_ABIS_API_KEY: process.env.DHA_ABIS_API_KEY || process.env.DHA_ABIS_API_KEYs || '',
    SAPS_CRC_API_KEY: process.env.SAPS_CRC_API_KEY || '',
    ICAO_PKD_API_KEY: process.env.ICAO_PKD_API_KEY || '',
    DHA_API_KEY: process.env.DHA_API_KEY || '',
    DHA_TOKEN: process.env.DHA_TOKEN || '',
    
    // Blockchain Keys
    ETHEREUM_RPC_URL: process.env.ETHEREUM_RPC_URL || '',
    POLYGON_RPC_ENDPOINT: process.env.POLYGON_RPC_ENDPOINT || process.env.POLYGON_RPC_URL || '',
    SOLANA_RPC_URL: process.env.SOLANA_RPC_URL || '',
    WEB3_PRIVATE_KEY: process.env.WEB3_PRIVATE_KEY || '',
    
    // External Services
    GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
    
    // Cloud Services
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
    AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID || '',
    AZURE_CLIENT_SECRET: process.env.AZURE_CLIENT_SECRET || '',
    GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT || '',

// Production mode detection - works for both Replit and Render
  const isRender = !!process.env.RENDER;
  const isRailway = !!process.env.RAILWAY_ENVIRONMENT;
  const isReplit = !!process.env.REPL_ID;
  
  // Force production mode on Render and Railway
  if (isRender || isRailway) {
    return false; // Not development
  }
  
  // Replit runs in development mode for testing
  return env.NODE_ENV !== 'production' || isReplit;

// PRODUCTION: Validate on Render and Railway
  const isProduction = process.env.RENDER || process.env.RAILWAY_ENVIRONMENT;
  if (isProduction) {
    console.log('🔒 [CONFIG] Running production validation for Render/Railway...');
  }