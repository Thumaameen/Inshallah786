export class SAPSService {
  async checkBackground(request: any) {
    return { success: true, cleared: false, message: 'SAPS service not configured' };
  }
}
