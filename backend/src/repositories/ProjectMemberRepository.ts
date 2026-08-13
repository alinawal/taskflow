import { DataSource } from 'typeorm';
import { ProjectMember } from '../entities/ProjectMember';
import { IProjectMemberRepository } from '../interfaces/repositories';
import { BaseTypeOrmRepository } from './BaseTypeOrmRepository';

export class ProjectMemberRepository
  extends BaseTypeOrmRepository<ProjectMember>
  implements IProjectMemberRepository
{
  constructor(dataSource: DataSource) {
    super(dataSource.getRepository(ProjectMember));
  }

  async findByProjectAndUser(projectId: string, userId: string): Promise<ProjectMember | null> {
    return this.ormRepository.findOne({ where: { projectId, userId } });
  }

  async findByProject(projectId: string): Promise<ProjectMember[]> {
    return this.ormRepository.find({ where: { projectId }, relations: ['user'] });
  }

  async deleteByProjectAndUser(projectId: string, userId: string): Promise<boolean> {
    const result = await this.ormRepository.delete({ projectId, userId });
    return (result.affected ?? 0) > 0;
  }
}
