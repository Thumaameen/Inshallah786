export class ABISService {
  async verifyBiometric(data: any) {
    return { success: true, verified: false, message: 'ABIS service not configured' };
  }
}
