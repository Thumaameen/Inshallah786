import { BlobServiceClient } from '@azure/storage-blob';
import { Storage } from '@google-cloud/storage';
// import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import type { CloudStorageConfig } from '../shared/types/cloud-config';

// Azure Configuration
export const azureConfig = {
  storageAccount: process.env.AZURE_STORAGE_ACCOUNT,
  storageKey: process.env.AZURE_STORAGE_KEY,
  containerName: process.env.AZURE_CONTAINER_NAME || 'dha-documents',
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  keyVaultName: process.env.AZURE_KEY_VAULT_NAME,
  tenantId: process.env.AZURE_TENANT_ID,
  clientId: process.env.AZURE_CLIENT_ID,
  clientSecret: process.env.AZURE_CLIENT_SECRET,
  subscriptionId: process.env.AZURE_SUBSCRIPTION_ID,
  region: process.env.AZURE_REGION || 'southafricanorth'
};

// GCP Configuration
export const gcpConfig = {
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_KEY_FILE,
  bucketName: process.env.GCP_BUCKET_NAME || 'dha-documents-secure',
  region: process.env.GCP_REGION || 'africa-south1',
  credentials: process.env.GCP_CREDENTIALS ? JSON.parse(process.env.GCP_CREDENTIALS) : undefined
};

// Initialize Azure Blob Storage Client
export const initAzureBlobStorage = (): BlobServiceClient => {
  if (!azureConfig.connectionString) {
    throw new Error('Azure Storage connection string is not configured');
  }
  return BlobServiceClient.fromConnectionString(azureConfig.connectionString);
};

// Initialize GCP Storage Client
export const initGCPStorage = (): Storage => {
  const options = {
    projectId: gcpConfig.projectId,
    keyFilename: gcpConfig.keyFilename,
    credentials: gcpConfig.credentials
  };
  return new Storage(options);
};

// Cloud Storage Provider Interface
export interface CloudStorageProvider {
  uploadFile(file: Buffer, fileName: string, contentType: string): Promise<string>;
  downloadFile(fileName: string): Promise<Buffer>;
  deleteFile(fileName: string): Promise<void>;
  generateSignedUrl(fileName: string, expiryMinutes?: number): Promise<string>;
}

// Azure implementation
export class AzureStorageProvider implements CloudStorageProvider {
  private blobServiceClient: BlobServiceClient;
  private containerName: string;

  constructor() {
    this.blobServiceClient = initAzureBlobStorage();
    this.containerName = azureConfig.containerName;
  }

  async uploadFile(file: Buffer, fileName: string, contentType: string): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.upload(file, file.length, {
      blobHTTPHeaders: { blobContentType: contentType }
    });
    return blockBlobClient.url;
  }

  async downloadFile(fileName: string): Promise<Buffer> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    const response = await blockBlobClient.download(0);
    const chunks: Buffer[] = [];
    for await (const chunk of response.readableStreamBody!) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  async deleteFile(fileName: string): Promise<void> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.delete();
  }

  async generateSignedUrl(fileName: string, expiryMinutes: number = 60): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    const startsOn = new Date();
    const expiresOn = new Date(startsOn);
    expiresOn.setMinutes(startsOn.getMinutes() + expiryMinutes);
    const sasUrl = await blockBlobClient.generateSasUrl({
      permissions: 'r',
      startsOn,
      expiresOn
    });
    return sasUrl;
  }
}

// GCP implementation
export class GCPStorageProvider implements CloudStorageProvider {
  private storage: Storage;
  private bucketName: string;

  constructor() {
    this.storage = initGCPStorage();
    this.bucketName = gcpConfig.bucketName;
  }

  async uploadFile(file: Buffer, fileName: string, contentType: string): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const blob = bucket.file(fileName);
    await blob.save(file, {
      contentType,
      metadata: {
        contentType
      }
    });
    return `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
  }

  async downloadFile(fileName: string): Promise<Buffer> {
    const bucket = this.storage.bucket(this.bucketName);
    const blob = bucket.file(fileName);
    const [fileContent] = await blob.download();
    return fileContent;
  }

  async deleteFile(fileName: string): Promise<void> {
    const bucket = this.storage.bucket(this.bucketName);
    const blob = bucket.file(fileName);
    await blob.delete();
  }

  async generateSignedUrl(fileName: string, expiryMinutes: number = 60): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const blob = bucket.file(fileName);
    const [url] = await blob.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expiryMinutes * 60 * 1000
    });
    return url;
  }
}

// Factory function to get the appropriate storage provider
export const getCloudStorageProvider = (config: CloudStorageConfig): CloudStorageProvider => {
  switch (config.provider) {
    case 'azure':
      return new AzureStorageProvider();
    case 'gcp':
      return new GCPStorageProvider();
    default:
      throw new Error(`Unsupported cloud provider: ${config.provider}`);
  }
};