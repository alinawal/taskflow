import {
  IProjectRepository,
  IProjectMemberRepository,
  IUserRepository,
} from '../interfaces/repositories';
import { CreateProjectInput, UpdateProjectInput } from '../dto/schemas';
import { AppError } from '../utils/AppError';
import { Project } from '../entities/Project';
import { ProjectMember, ProjectRole } from '../entities/ProjectMember';

/**
 * ProjectService owns project lifecycle and membership rules. It depends
 * on three repository abstractions injected via the constructor — each
 * repository has a single, focused responsibility (SRP + ISP), and
 * ProjectService orchestrates them without knowing how they persist data.
 */
export class ProjectService {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly memberRepository: IProjectMemberRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async createProject(ownerId: string, input: CreateProjectInput): Promise<Project> {
    const project = await this.projectRepository.create({
      name: input.name,
      description: input.description ?? null,
      ownerId,
    });
    await this.memberRepository.create({
      projectId: project.id,
      userId: ownerId,
      role: ProjectRole.OWNER,
    });
    return project;
  }

  async listProjectsForUser(userId: string): Promise<Project[]> {
    return this.projectRepository.findForUser(userId);
  }

  async getProject(projectId: string, requesterId: string): Promise<Project> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw AppError.notFound('Project not found');
    await this.assertIsMember(projectId, requesterId);
    return project;
  }

  async updateProject(
    projectId: string,
    requesterId: string,
    input: UpdateProjectInput,
  ): Promise<Project> {
    await this.assertIsOwner(projectId, requesterId);
    const updated = await this.projectRepository.update(projectId, input);
    if (!updated) throw AppError.notFound('Project not found');
    return updated;
  }

  async deleteProject(projectId: string, requesterId: string): Promise<void> {
    await this.assertIsOwner(projectId, requesterId);
    const deleted = await this.projectRepository.delete(projectId);
    if (!deleted) throw AppError.notFound('Project not found');
  }

  async addMember(projectId: string, requesterId: string, email: string): Promise<ProjectMember> {
    await this.assertIsOwner(projectId, requesterId);

    const user = await this.userRepository.findByEmail(email);
    if (!user) throw AppError.notFound(`No user found with email ${email}`);

    const existing = await this.memberRepository.findByProjectAndUser(projectId, user.id);
    if (existing) throw AppError.conflict('User is already a member of this project');

    return this.memberRepository.create({
      projectId,
      userId: user.id,
      role: ProjectRole.CONTRIBUTOR,
    });
  }

  async removeMember(projectId: string, requesterId: string, userId: string): Promise<void> {
    await this.assertIsOwner(projectId, requesterId);
    const project = await this.projectRepository.findById(projectId);
    if (project?.ownerId === userId) {
      throw AppError.badRequest('Cannot remove the project owner');
    }
    const deleted = await this.memberRepository.deleteByProjectAndUser(projectId, userId);
    if (!deleted) throw AppError.notFound('Membership not found');
  }

  async listMembers(projectId: string, requesterId: string): Promise<ProjectMember[]> {
    await this.assertIsMember(projectId, requesterId);
    return this.memberRepository.findByProject(projectId);
  }

  async assertIsMember(projectId: string, userId: string): Promise<ProjectMember> {
    const membership = await this.memberRepository.findByProjectAndUser(projectId, userId);
    if (!membership) {
      throw AppError.forbidden('You are not a member of this project');
    }
    return membership;
  }

  private async assertIsOwner(projectId: string, userId: string): Promise<void> {
    const membership = await this.assertIsMember(projectId, userId);
    if (membership.role !== ProjectRole.OWNER) {
      throw AppError.forbidden('Only the project owner can perform this action');
    }
  }
}
