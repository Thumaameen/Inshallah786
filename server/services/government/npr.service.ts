export class NPRService {
  async verifyIdentity(id: string) {
    return { success: true, verified: false, message: 'NPR service not configured' };
  }
}
