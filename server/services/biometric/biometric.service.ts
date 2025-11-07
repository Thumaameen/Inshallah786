export class BiometricService {
  async verifyBiometric(data: any) {
    return { success: true, verified: false, message: 'Biometric service not configured' };
  }

  async storeBiometric(data: any) {
    return { success: true, stored: false, message: 'Biometric service not configured' };
  }
}
