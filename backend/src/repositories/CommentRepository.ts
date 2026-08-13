import { DataSource } from 'typeorm';
import { Comment } from '../entities/Comment';
import { ICommentRepository } from '../interfaces/repositories';
import { BaseTypeOrmRepository } from './BaseTypeOrmRepository';

export class CommentRepository
  extends BaseTypeOrmRepository<Comment>
  implements ICommentRepository
{
  constructor(dataSource: DataSource) {
    super(dataSource.getRepository(Comment));
  }

  async findByTask(taskId: string): Promise<Comment[]> {
    return this.ormRepository.find({
      where: { taskId },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
  }
}
