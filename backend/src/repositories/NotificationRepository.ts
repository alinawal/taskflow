import { DataSource } from 'typeorm';
import { Notification } from '../entities/Notification';
import { INotificationRepository } from '../interfaces/repositories';
import { BaseTypeOrmRepository } from './BaseTypeOrmRepository';

export class NotificationRepository
  extends BaseTypeOrmRepository<Notification>
  implements INotificationRepository
{
  constructor(dataSource: DataSource) {
    super(dataSource.getRepository(Notification));
  }

  async findByRecipient(recipientId: string): Promise<Notification[]> {
    return this.ormRepository.find({
      where: { recipientId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAllRead(recipientId: string): Promise<void> {
    await this.ormRepository.update({ recipientId }, { read: true });
  }
}
