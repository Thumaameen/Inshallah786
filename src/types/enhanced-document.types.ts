export interface EnhancedDocumentProcessor {
  addDocumentContent(page: any, data: any): Promise<void>;
  createDigitalSignature(doc: any, documentId: string): Promise<string>;
  addWatermark(page: any, text: string): Promise<void>;
  addQRCode(page: any, data: string): Promise<void>;
  addDigitalSignature(page: any, data: any): Promise<void>;
  addMicroprint(page: any): Promise<void>;
  addHologram(page: any): Promise<void>;
  addUVFeatures(page: any): Promise<void>;
  addGuilloche(page: any): Promise<void>;
  addNanotext(page: any): Promise<void>;
  addTaggants(page: any): Promise<void>;
}