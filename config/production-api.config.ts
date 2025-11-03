import { config } from 'dotenv';
config();

export const apiConfig = {
  // Web3 Configuration
  web3: {
    polygon: {
      rpcEndpoint: process.env.POLYGON_RPC_ENDPOINT || 
                   process.env.POLYGON_RPC_URL || 
                   process.env.MATIC_RPC_URL ||
                   (process.env.POLYGON_API_KEY ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.POLYGON_API_KEY}` : '') ||
                   (process.env.ALCHEMY_API_KEY ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}` : ''),
      apiKey: process.env.POLYGON_API_KEY || process.env.ALCHEMY_API_KEY,
    },
    solana: {
      apiKey: process.env.SOLANA_API_KEY,
      endpoint: process.env.SOLANA_RPC_URL || 
                process.env.SOLANA_RPC ||
                process.env.SOL_RPC_URL ||
                (process.env.SOLANA_API_KEY ? `https://solana-mainnet.g.alchemy.com/v2/${process.env.SOLANA_API_KEY}` : '') ||
                'https://api.mainnet-beta.solana.com',
    },
    web3auth: {
      clientId: process.env.WEB3AUTH_CLIENT_ID,
      clientSecret: process.env.WEB3AUTH_CLIENT_SECRET,
      environment: process.env.WEB3AUTH_ENVIRONMENT,
    }
  },

  // Government Services
  government: {
    dha: {
      abis: {
        apiKey: process.env.DHA_ABIS_API_KEY,
        baseUrl: process.env.DHA_ABIS_BASE_URL,
        timeout: 60000,
      },
      npr: {
        apiKey: process.env.DHA_NPR_API_KEY,
        baseUrl: process.env.DHA_NPR_BASE_URL,
        certKey: process.env.DHA_NPR_CERT_KEY,
      },
      mcs: {
        apiKey: process.env.DHA_MCS_API_KEY,
        secret: process.env.DHA_MCS_SECRET,
      },
      dms: {
        apiKey: process.env.DHA_DMS_API_KEY,
        secret: process.env.DHA_DMS_SECRET,
        storageKey: process.env.DHA_DMS_STORAGE_KEY,
      },
      visa: {
        apiKey: process.env.DHA_VISA_API_KEY,
        secret: process.env.DHA_VISA_SECRET,
      }
    },
    sita: {
      apiKey: process.env.SITA_API_KEY,
      eservicesKey: process.env.SITA_ESERVICES_API_KEY,
      secret: process.env.SITA_SECRET_KEY,
    },
    saps: {
      apiKey: process.env.SAPS_API_KEY,
      crcKey: process.env.SAPS_CRC_API_KEY,
      baseUrl: process.env.SAPS_CRC_BASE_URL,
    },
    hanis: {
      apiKey: process.env.HANIS_API_KEY,
      secretKey: process.env.HANIS_SECRET_KEY,
    },
    niis: {
      apiKey: process.env.NIIS_API_KEY,
    }
  },

  // Cloud Services
  cloud: {
    aws: {
      accessKey: process.env.AWS_ACCESS_KEY_ID,
      secretKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    },
    gcp: {
      apiKey: process.env.GCP_API_KEY,
      projectId: process.env.GCP_PROJECT_ID,
    },
    azure: {
      apiKey: process.env.AZURE_API_KEY,
      connectionString: process.env.AZURE_AZURE_CONNECTION_STRING,
    }
  },

  // AI Services
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      orgId: process.env.OPENAI_ORG_ID,
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
    },
    gemini: {
      apiKey: process.env.GOOGLE_AI_API_KEY,
    },
    mistral: {
      apiKey: process.env.MISTRAL_API_KEY,
    },
    perplexity: {
      apiKey: process.env.PERPLEXITY_API_KEY,
    }
  },

  // Document Processing
  documents: {
    encryption: process.env.DOCUMENT_ENCRYPTION_KEY,
    signing: process.env.DOCUMENT_SIGNING_KEY,
    storage: process.env.DOC_STORAGE_ACCESS_KEY,
    pki: {
      privateKey: process.env.DOC_PKI_PRIVATE_KEY,
      publicKey: process.env.DOC_PKI_PUBLIC_KEY,
      passphrase: process.env.DOC_PKI_PASSPHRASE,
    }
  },

  // Security & Authentication
  security: {
    jwt: process.env.JWT_SECRET,
    session: process.env.SESSION_SECRET,
    master: process.env.MASTER_ENCRYPTION_KEY,
    quantum: process.env.QUANTUM_ENCRYPTION_KEY,
    biometric: process.env.BIOMETRIC_ENCRYPTION_KEY,
  },

  // Integration Services
  services: {
    workato: {
      accountId: process.env.WORKATO_ACCOUNT_ID,
      apiToken: process.env.WORKATO_API_TOKEN,
      apiHost: process.env.WORKATO_API_HOST,
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
    },
    ocr: {
      apiKey: process.env.OCR_API_KEY,
      secretKey: process.env.OCR_SECRET_KEY,
    },
    interpol: {
      enabled: process.env.INTERPOL_CHECK === 'enabled',
    },
    gwp: {
      apiKey: process.env.GWP_API_KEY,
      authKey: process.env.GWP_AUTH_KEY,
      endpoint: process.env.GWP_URL_ENDPOINT,
    },
    arya: {
      apiKey: process.env.ARYA_API_KEY,
      baseUrl: process.env.ARYA_BASE,
    }
  },

  // Feature Flags
  features: {
    realCertificates: process.env.ENABLE_REAL_CERTIFICATES === 'true',
    governmentIntegration: process.env.ENABLE_GOVERNMENT_INTEGRATION === 'true',
    militaryIntegration: process.env.MILITARY_INTEGRATION_ENABLED === 'true',
    classifiedDocs: process.env.CLASSIFIED_DOCUMENT_SUPPORT === 'true',
    globalAccess: process.env.GLOBAL_PORTAL_ACCESS === 'true',
  },

  // Performance & Reliability
  performance: {
    maxChunkSize: parseInt(process.env.MAX_CHUNK_SIZE || '16777216'),
    maxPayloadSize: parseInt(process.env.MAX_PAYLOAD_SIZE || '20971520'),
    apiTimeout: parseInt(process.env.API_TIMEOUT || '60000'),
    retryDelay: parseInt(process.env.RETRY_DELAY || '3000'),
    maxRetryAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3'),
    cacheStrategy: 'aggressive',
    compressionLevel: 9,
  }
};

export const validateConfig = () => {
  const requiredKeys = [
    'JWT_SECRET',
    'SESSION_SECRET',
    'MASTER_ENCRYPTION_KEY',
    'DOCUMENT_ENCRYPTION_KEY',
    'DOCUMENT_SIGNING_KEY',
  ];

  const missingKeys = requiredKeys.filter(key => !process.env[key]);
  if (missingKeys.length > 0) {
    throw new Error(`Missing required environment variables: ${missingKeys.join(', ')}`);
  }

  return true;
};