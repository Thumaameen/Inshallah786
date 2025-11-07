export class BlockchainService {
  async storeOnBlockchain(data: any) {
    return { success: true, hash: null, message: 'Blockchain service not configured' };
  }

  async verifyOnBlockchain(hash: string) {
    return { success: true, verified: false, message: 'Blockchain service not configured' };
  }

  async verifyDocument(hash: string) {
    return { success: true, verified: false, message: 'Blockchain service not configured' };
  }
}
