import { Notification } from '../entities/Notification';

/**
 * Strategy contract for delivering a notification through some channel
 * (in-app, email, ...). NotificationFactory (see src/factories) decides
 * which concrete implementation to hand back at runtime — this is what
 * lets NotificationService stay closed for modification but open for
 * extension (Open/Closed Principle) when a new channel is added later.
 */
export interface INotificationChannel {
  readonly channelName: string;
  deliver(notification: Notification): Promise<void>;
}
