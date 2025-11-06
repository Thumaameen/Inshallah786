export interface MonitoringConfig {
  enabled: boolean;
  interval: number;
  alerts: number;
}

export interface SecurityConfig {
  corsOrigin: string[];
  rateLimiting: boolean;
  sessionTimeout: number;
  encryptionLevel: 'military-grade';
}

export interface StorageConfig {
  type: 'postgres' | 'sqlite';
  connectionTimeout: number;
  url?: string;
  maxConnections?: number;
  ssl?: boolean | { rejectUnauthorized: boolean };
}

export interface ProductionConfig {
  monitoring: MonitoringConfig;
  encryption: {
    algorithm: string;
    keyLength: number;
  };
  storage: StorageConfig;
  security: SecurityConfig;
  features: {
    documentGeneration: boolean;
    biometricSecurity: boolean;
    web3Integration: boolean;
  };
}