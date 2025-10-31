// Configuration for DHA services
export interface DHAConfig {
  clientId: string;
  apiEndpoints: {
    npr: string;
    abis: string;
    saps: string;
    icao: string;
  };
}

export const config: DHAConfig = {
  clientId: process.env.CLIENT_ID || 'default-client-id',
  apiEndpoints: {
    npr: 'https://api.dha.gov.za/npr/v2',
    abis: 'https://api.dha.gov.za/abis/v2',
    saps: 'https://api.saps.gov.za/crc/v1',
    icao: 'https://api.icao.int/pkd/v2'
  }
};