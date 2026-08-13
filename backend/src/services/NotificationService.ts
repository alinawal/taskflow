import { INotificationRepository } from '../interfaces/repositories';
import { NotificationFactory } from '../factories/NotificationFactory';
import { NotificationType, Notification } from '../entities/Notification';

/**
 * NotificationService persists a notification, then hands delivery off to
 * every channel NotificationFactory provides. It never instantiates a
 * concrete channel class itself (Factory Pattern + Open/Closed Principle):
 * adding a new delivery channel never requires touching this file.
 */
export class NotificationService {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async notify(recipientId: string, type: NotificationType, message: string): Promise<Notification> {
    const notification = await this.notificationRepository.create({
      recipientId,
      type,
      message,
      read: false,
    });

    const channels = NotificationFactory.getDefaultChannels();
    await Promise.all(channels.map((channel) => channel.deliver(notification)));

    return notification;
  }

  async listForUser(userId: string): Promise<Notification[]> {
    return this.notificationRepository.findByRecipient(userId);
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllRead(userId);
  }
}
