export interface EnhancedDocumentProcessor {
  addDocumentContent: (content: string) => Promise<void>;
  createDigitalSignature: (data: string) => Promise<string>;
  addWatermark: (text: string) => Promise<void>;
  addQRCode: (data: string) => Promise<void>;
  addDigitalSignature: (signature: string) => Promise<void>;
  addMicroprint: (text: string) => Promise<void>;
  addHologram: () => Promise<void>;
  addUVFeatures: () => Promise<void>;
  addGuilloche: () => Promise<void>;
  addNanotext: (text: string) => Promise<void>;
  addTaggants: () => Promise<void>;
}