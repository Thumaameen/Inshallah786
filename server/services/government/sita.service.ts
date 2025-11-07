export class SITAService {
  async processRequest(data: any, type: string) {
    return { success: true, processed: false, message: 'SITA service not configured' };
  }
}
