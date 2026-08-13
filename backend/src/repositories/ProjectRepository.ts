import { DataSource } from 'typeorm';
import { Project } from '../entities/Project';
import { ProjectMember } from '../entities/ProjectMember';
import { IProjectRepository } from '../interfaces/repositories';
import { BaseTypeOrmRepository } from './BaseTypeOrmRepository';

export class ProjectRepository
  extends BaseTypeOrmRepository<Project>
  implements IProjectRepository
{
  private readonly memberRepo;

  constructor(private readonly dataSource: DataSource) {
    super(dataSource.getRepository(Project));
    this.memberRepo = dataSource.getRepository(ProjectMember);
  }

  async findByOwner(ownerId: string): Promise<Project[]> {
    return this.ormRepository.find({ where: { ownerId } });
  }

  async findForUser(userId: string): Promise<Project[]> {
    const memberships = await this.memberRepo.find({ where: { userId }, relations: ['project'] });
    return memberships.map((m) => m.project);
  }
}
