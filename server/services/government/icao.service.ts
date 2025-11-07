export class ICAOService {
  async validatePassport(passportData: any) {
    return { success: true, valid: false, message: 'ICAO service not configured' };
  }
}
