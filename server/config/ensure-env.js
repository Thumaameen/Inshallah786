export const environmentConfig = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  NODE_VERSION: process.env.NODE_VERSION,
  PORT: process.env.PORT || 10000,
  DATABASE_URL: process.env.DATABASE_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  DHA_ABIS_API_KEY: process.env.DHA_ABIS_API_KEY,
  SAPS_API_KEY: process.env.SAPS_API_KEY,
  DHA_API_KEY: process.env.DHA_API_KEY,
  DHA_NPR_API_KEY: process.env.DHA_NPR_API_KEY,
  ICAO_PKD_KEY: process.env.ICAO_PKD_KEY
};