export class GlobalDocumentVerificationService {
  async verifyDocument(document: any, type: string) {
    return { success: true, verified: false, message: 'Document verification service not configured' };
  }
}
