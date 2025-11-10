async sendNotification(notification: any): Promise<void> {
    try {
      if (!notification || !notification.userId || !notification.message) {
        console.warn('Invalid notification:', notification);
        return;
      }

      await this.processNotification(notification);
    } catch (error) {
      console.error('Notification error:', error);
      // Don't throw - failed notifications shouldn't break the app
    }
  }

  private async processNotification(notification: any): Promise<void> {
    console.log('Processing notification:', notification);
    // Notification processing logic
  }