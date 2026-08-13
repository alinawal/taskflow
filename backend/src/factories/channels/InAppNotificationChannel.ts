import { INotificationChannel } from '../../interfaces/INotificationChannel';
import { Notification } from '../../entities/Notification';

/**
 * Delivers a notification by persisting it for retrieval through the app's
 * notification inbox (the notification is already saved by the service
 * layer before delivery; here we simply simulate the "push" side-effect,
 * e.g. what would become a WebSocket emit in a real-time deployment).
 */
export class InAppNotificationChannel implements INotificationChannel {
  readonly channelName = 'IN_APP';

  async deliver(notification: Notification): Promise<void> {
    // In a browser-connected deployment this would emit over a WebSocket.
    // For this system, in-app notifications are delivered by simply being
    // readable via GET /notifications, so delivery is a no-op side effect.
    void notification;
    return Promise.resolve();
  }
}
