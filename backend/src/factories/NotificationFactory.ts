import { INotificationChannel } from '../interfaces/INotificationChannel';
import { InAppNotificationChannel } from './channels/InAppNotificationChannel';
import { EmailNotificationChannel } from './channels/EmailNotificationChannel';

export type NotificationChannelType = 'IN_APP' | 'EMAIL';

/**
 * Factory Pattern: centralizes the decision of *which* concrete
 * INotificationChannel to construct, so callers (NotificationService) never
 * need to know the concrete classes. Adding a new channel (e.g. SMS, Slack)
 * only requires a new class + one new case here — NotificationService itself
 * never changes (Open/Closed Principle).
 */
export class NotificationFactory {
  private static readonly registry = new Map<NotificationChannelType, INotificationChannel>([
    ['IN_APP', new InAppNotificationChannel()],
    ['EMAIL', new EmailNotificationChannel()],
  ]);

  static getChannel(type: NotificationChannelType): INotificationChannel {
    const channel = this.registry.get(type);
    if (!channel) {
      throw new Error(`Unsupported notification channel: ${type}`);
    }
    return channel;
  }

  /** All channels a notification should be broadcast through by default. */
  static getDefaultChannels(): INotificationChannel[] {
    return [this.getChannel('IN_APP'), this.getChannel('EMAIL')];
  }
}
