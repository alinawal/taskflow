import { INotificationChannel } from '../../interfaces/INotificationChannel';
import { Notification } from '../../entities/Notification';

/**
 * Simulates sending an email. In production this would call an email
 * provider's SDK (e.g. SES, SendGrid); the interface boundary means that
 * swap requires no change anywhere else in the codebase (Open/Closed +
 * Dependency Inversion in action).
 */
export class EmailNotificationChannel implements INotificationChannel {
  readonly channelName = 'EMAIL';

  async deliver(notification: Notification): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(
      `[EmailNotificationChannel] Would email recipient ${notification.recipientId}: "${notification.message}"`,
    );
    return Promise.resolve();
  }
}
