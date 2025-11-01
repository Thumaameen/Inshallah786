// Removed unused Web3Auth import to avoid missing module/type errors.
// If you need Web3Auth here, install '@web3auth/modal' and its types and re-add the import.
import { ethers } from 'ethers'
import { Connection } from '@solana/web3.js'
import * as forge from 'node-forge'
import axios from 'axios'

export const serviceConfig = {
  // Web3 Configuration
  web3: {
    polygon: {
      rpcUrl: process.env.POLYGON_RPC_ENDPOINT,
      apiKey: process.env.POLYGON_API_KEY,
      network: 'mainnet',
    },
    solana: {
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      apiKey: process.env.SOLANA_API_KEY,
    },
    web3auth: {
      clientId: process.env.WEB3AUTH_CLIENT_ID,
      chainConfig: {
        chainNamespace: "eip155",
        chainId: "0x89", // Polygon
      }
    }
  },

  // Government Services
  government: {
    dha: {
      npr: {
        baseUrl: process.env.DHA_NPR_BASE_URL,
        apiKey: process.env.DHA_NPR_API_KEY,
        timeout: 45000,
      },
      abis: {
        baseUrl: process.env.DHA_ABIS_BASE_URL,
        apiKey: process.env.DHA_ABIS_API_KEY,
        timeout: 60000,
      },
      visa: {
        apiKey: process.env.DHA_VISA_API_KEY,
        secret: process.env.DHA_VISA_SECRET,
      },
      mcs: {
        apiKey: process.env.DHA_MCS_API_KEY,
        secret: process.env.DHA_MCS_SECRET,
      },
      dms: {
        apiKey: process.env.DHA_DMS_API_KEY,
        secret: process.env.DHA_DMS_SECRET,
        storageKey: process.env.DHA_DMS_STORAGE_KEY,
      }
    },
    saps: {
      apiKey: process.env.SAPS_API_KEY,
      crcApiKey: process.env.SAPS_CRC_API_KEY,
      baseUrl: process.env.SAPS_CRC_BASE_URL,
    },
    sita: {
      apiKey: process.env.SITA_API_KEY,
      eservicesKey: process.env.SITA_ESERVICES_API_KEY,
      baseUrl: process.env.SITA_ESERVICES_BASE_URL,
    }
  },

  // Document Processing
  documents: {
    encryption: {
      key: process.env.DOCUMENT_ENCRYPTION_KEY,
      signingKey: process.env.DOCUMENT_SIGNING_KEY,
    },
    pki: {
      privateKey: process.env.DOC_PKI_PRIVATE_KEY,
      publicKey: process.env.DOC_PKI_PUBLIC_KEY,
      passphrase: process.env.DOC_PKI_PASSPHRASE,
    },
    storage: {
      accessKey: process.env.DOC_STORAGE_ACCESS_KEY,
      secretKey: process.env.DOC_STORAGE_SECRET_KEY,
      bucket: process.env.DOC_STORAGE_BUCKET,
      region: process.env.DOC_STORAGE_REGION,
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
    perplexity: {
      apiKey: process.env.PERPLEXITY_API_KEY,
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
    },
    mistral: {
      apiKey: process.env.MISTRAL_API_KEY,
    }
  },

  // Cloud Services
  cloud: {
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    },
    gcp: {
      apiKey: process.env.GCP_API_KEY,
      projectId: process.env.GCP_PROJECT_ID,
    },
    azure: {
      apiKey: process.env.AZURE_API_KEY,
      connectionString: process.env.AZURE_CONNECTION_STRING,
    }
  },

  // Security & Verification
  security: {
    encryption: {
      masterKey: process.env.MASTER_ENCRYPTION_KEY,
      quantumKey: process.env.QUANTUM_ENCRYPTION_KEY,
      apiKey: process.env.API_ENCRYPTION_KEY,
    },
    authentication: {
      jwtSecret: process.env.JWT_SECRET,
      sessionSecret: process.env.SESSION_SECRET,
    },
    audit: {
      encryptionKey: process.env.AUDIT_ENCRYPTION_KEY,
      signingKey: process.env.AUDIT_SIGNING_KEY,
    }
  },

  // External Services
  external: {
    workato: {
      accountId: process.env.WORKATO_ACCOUNT_ID,
      apiToken: process.env.WORKATO_API_TOKEN,
      apiHost: process.env.WORKATO_API_HOST,
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
    }
  },

  // Verification Services
  verification: {
    hanis: {
      apiKey: process.env.HANIS_API_KEY,
      secretKey: process.env.HANIS_SECRET_KEY,
    },
    niis: {
      apiKey: process.env.NIIS_API_KEY,
    },
    interpol: {
      enabled: process.env.INTERPOL_CHECK === 'enabled',
    },
    gwp: {
      apiKey: process.env.GWP_API_KEY,
      authKey: process.env.GWP_AUTH_KEY,
      endpoint: process.env.GWP_URL_ENDPOINT,
    }
  },

  // Document Processing
  ocr: {
    apiKey: process.env.OCR_API_KEY,
    secretKey: process.env.OCR_SECRET_KEY,
  }
}

// Initialize Web3 Providers
export const initializeWeb3 = () => {
  const polygonProvider = new ethers.JsonRpcProvider(serviceConfig.web3.polygon.rpcUrl)
  const solanaConnection = new Connection(serviceConfig.web3.solana.rpcUrl)
  
  return {
    polygon: polygonProvider,
    solana: solanaConnection,
  }
}

// Initialize Document Security
export const initializeDocumentSecurity = () => {
  if (!serviceConfig.documents.pki.privateKey || !serviceConfig.documents.pki.publicKey) {
    throw new Error('PKI keys are required but not configured')
  }
  const privateKey = forge.pki.privateKeyFromPem(serviceConfig.documents.pki.privateKey)
  const publicKey = forge.pki.publicKeyFromPem(serviceConfig.documents.pki.publicKey)
  
  return {
    sign: (data: string) => {
      const md = forge.md.sha256.create()
      md.update(data, 'utf8')
      return forge.util.encode64(privateKey.sign(md))
    },
    verify: (data: string, signature: string) => {
      const md = forge.md.sha256.create()
      md.update(data, 'utf8')
      return publicKey.verify(md.digest().bytes(), forge.util.decode64(signature))
    }
  }
}

// Initialize Government Services
export const initializeGovernmentServices = () => {
  const dhaClient = axios.create({
    baseURL: serviceConfig.government.dha.npr.baseUrl,
    timeout: serviceConfig.government.dha.npr.timeout,
    headers: {
      'Authorization': `Bearer ${serviceConfig.government.dha.npr.apiKey}`,
      'X-API-Key': serviceConfig.government.dha.npr.apiKey
    }
  })

  const sapsClient = axios.create({
    baseURL: serviceConfig.government.saps.baseUrl,
    timeout: 30000,
    headers: {
      'Authorization': `Bearer ${serviceConfig.government.saps.apiKey}`
    }
  })

  return {
    dha: dhaClient,
    saps: sapsClient,
  }
}

export default serviceConfig;