// Integration Flags - PRODUCTION ONLY - NO MOCKS
    ENABLE_REAL_CERTIFICATES: true,
    ENABLE_BIOMETRIC_VALIDATION: true,
    ENABLE_GOVERNMENT_INTEGRATION: true,
    USE_MOCK_DATA: false,
    FORCE_REAL_APIS: true,
    BYPASS_MODE: false,

// Production mode enforced - no development overrides
  // All Replit deployments run in production mode with real APIs
  return env.NODE_ENV !== 'production';

// PRODUCTION: Always validate in production mode
  console.log('🔒 [CONFIG] Running production validation...');