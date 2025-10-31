import { config } from '../config/index.js';

export const governmentAPIConfig = {
  DHA_NPR: {
    baseUrl: 'https://api.dha.gov.za/npr/v2',
    apiKey: process.env.DHA_NPR_API_KEY,
    secret: process.env.DHA_NPR_SECRET,
    mock: false // Setting to use real API
  },
  DHA_ABIS: {
    baseUrl: 'https://api.dha.gov.za/abis/v2',
    apiKey: process.env.DHA_ABIS_API_KEY,
    secret: process.env.DHA_ABIS_SECRET,
    mock: false // Setting to use real API
  },
  SAPS_CRC: {
    baseUrl: 'https://api.saps.gov.za/crc/v1',
    apiKey: process.env.SAPS_CRC_API_KEY,
    secret: process.env.SAPS_CRC_SECRET,
    mock: false // Setting to use real API
  },
  ICAO_PKD: {
    baseUrl: 'https://api.icao.int/pkd/v2',
    apiKey: process.env.ICAO_PKD_API_KEY,
    secret: process.env.ICAO_PKD_SECRET,
    mock: false // Setting to use real API
  }
};

export const getGovAPIConfig = (service: keyof typeof governmentAPIConfig) => {
  const serviceConfig = governmentAPIConfig[service];
  
  if (!serviceConfig.apiKey || !serviceConfig.secret) {
    throw new Error(`Missing credentials for ${service}`);
  }

  return {
    ...serviceConfig,
    headers: {
      'Authorization': `Bearer ${serviceConfig.apiKey}`,
      'X-API-Secret': serviceConfig.secret,
      'X-Client-ID': config.clientId,
      'X-Transaction-ID': Date.now().toString()
    }
  };
};