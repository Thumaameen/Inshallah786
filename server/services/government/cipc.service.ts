export class CIPCService {
  async verifyCompany(registration: string) {
    return { success: true, verified: false, message: 'CIPC service not configured' };
  }

  async verifyBusiness(registration: string) {
    return { success: true, verified: false, message: 'CIPC service not configured' };
  }
}
