export class DELService {
  async checkEmployment(data: any) {
    return { success: true, employed: false, message: 'DEL service not configured' };
  }

  async verifyEmployment(idNumber: string) {
    return { success: true, employed: false, message: 'DEL service not configured' };
  }
}
