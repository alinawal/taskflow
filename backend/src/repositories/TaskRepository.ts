import { DataSource } from 'typeorm';
import { Task } from '../entities/Task';
import { ITaskRepository } from '../interfaces/repositories';
import { BaseTypeOrmRepository } from './BaseTypeOrmRepository';

export class TaskRepository extends BaseTypeOrmRepository<Task> implements ITaskRepository {
  constructor(dataSource: DataSource) {
    super(dataSource.getRepository(Task));
  }

  async findByProject(projectId: string): Promise<Task[]> {
    return this.ormRepository.find({ where: { projectId }, relations: ['assignee'] });
  }

  async findByAssignee(assigneeId: string): Promise<Task[]> {
    return this.ormRepository.find({ where: { assigneeId }, relations: ['project'] });
  }
}
