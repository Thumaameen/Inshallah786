// Government API Configuration
export interface GovAPIConfig {
  baseUrl: string;
  headers: {
    'Authorization'?: string;
    'X-API-Key'?: string;
    'X-Client-ID'?: string;
    'X-API-Secret'?: string;
  };
}

export const governmentAPIConfig = {
  DHA_NPR: {
    baseUrl: 'https://api.dha.gov.za/npr/v2',
    headers: {
      'Authorization': `Bearer ${process.env.DHA_NPR_API_KEY}`,
      'X-API-Secret': process.env.DHA_NPR_SECRET,
      'X-Client-ID': process.env.CLIENT_ID
    }
  },
  DHA_ABIS: {
    baseUrl: 'https://api.dha.gov.za/abis/v2',
    headers: {
      'Authorization': `Bearer ${process.env.DHA_ABIS_API_KEY}`,
      'X-API-Secret': process.env.DHA_ABIS_SECRET,
      'X-Client-ID': process.env.CLIENT_ID
    }
  },
  SAPS_CRC: {
    baseUrl: 'https://api.saps.gov.za/crc/v1',
    headers: {
      'X-API-Key': process.env.SAPS_CRC_API_KEY,
      'X-Client-ID': process.env.CLIENT_ID
    }
  },
  ICAO_PKD: {
    baseUrl: 'https://api.icao.int/pkd/v2',
    headers: {
      'X-API-Key': process.env.ICAO_PKD_API_KEY,
      'X-Client-ID': process.env.CLIENT_ID
    }
  }
} as const;

export function getGovAPIConfig<T extends keyof typeof governmentAPIConfig>(
  service: T
): typeof governmentAPIConfig[T] {
  const config = governmentAPIConfig[service];
  if (!config) {
    throw new Error(`Configuration not found for service: ${service}`);
  }
  return config;
}

// Helper to validate required API keys on startup
export function validateGovAPIKeys(): void {
  const requiredKeys = [
    'DHA_NPR_API_KEY',
    'DHA_NPR_SECRET',
    'DHA_ABIS_API_KEY',
    'DHA_ABIS_SECRET',
    'SAPS_CRC_API_KEY',
    'ICAO_PKD_API_KEY',
    'CLIENT_ID'
  ];

  const missingKeys = requiredKeys.filter(key => !process.env[key]);
  if (missingKeys.length > 0) {
    throw new Error(`Missing required government API keys: ${missingKeys.join(', ')}`);
  }
}