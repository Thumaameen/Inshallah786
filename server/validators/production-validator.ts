
export class ProductionValidator {
  static validate() {
    console.log('\n🔍 PRODUCTION MODE VALIDATION...\n');

    // Force production environment
    if (process.env.NODE_ENV !== 'production') {
      throw new Error('FATAL: NODE_ENV must be set to "production" for deployment');
    }

    const criticalKeys = {
      'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
      'DATABASE_URL': process.env.DATABASE_URL,
      'SESSION_SECRET': process.env.SESSION_SECRET,
      'JWT_SECRET': process.env.JWT_SECRET,
      'ENCRYPTION_KEY': process.env.ENCRYPTION_KEY
    };

    Object.entries(criticalKeys).forEach(([key, value]) => {
      if (!value) {
        throw new Error(`PRODUCTION ERROR: ${key} is required. Configure in Render environment variables.`);
      }
      if (value.includes('mock') || value.includes('test') || value.includes('fake') || value.includes('sample') || value.includes('dev')) {
        throw new Error(`PRODUCTION ERROR: ${key} contains invalid value. Use real production credentials only.`);
      }
      console.log(`✅ ${key} validated for production.`);
    });

    // Validate production platform
    const isRender = process.env.RENDER === 'true' || process.env.RENDER_SERVICE_ID;
    if (!isRender) {
      console.warn('⚠️ Not running on Render - ensure production configuration is correct');
    }

    return {
      isProduction: true,
      hasRealAPIs: true,
      platform: isRender ? 'render' : 'unknown',
      validated: true
    };
  }
}
