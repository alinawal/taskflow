import { ProjectService } from '../../src/services/ProjectService';
import {
  FakeProjectRepository,
  FakeProjectMemberRepository,
  FakeUserRepository,
} from '../fixtures/fakeRepositories';
import { AppError } from '../../src/utils/AppError';

describe('ProjectService (unit)', () => {
  let projectRepository: FakeProjectRepository;
  let memberRepository: FakeProjectMemberRepository;
  let userRepository: FakeUserRepository;
  let projectService: ProjectService;

  const OWNER_ID = 'owner-1';
  const OUTSIDER_ID = 'outsider-1';

  beforeEach(() => {
    projectRepository = new FakeProjectRepository();
    memberRepository = new FakeProjectMemberRepository();
    userRepository = new FakeUserRepository();
    projectService = new ProjectService(projectRepository, memberRepository, userRepository);
  });

  it('creates a project and automatically makes the creator the OWNER member', async () => {
    const project = await projectService.createProject(OWNER_ID, { name: 'TaskFlow Launch' });
    const members = await memberRepository.findByProject(project.id);

    expect(project.ownerId).toBe(OWNER_ID);
    expect(members).toHaveLength(1);
    expect(members[0].role).toBe('OWNER');
  });

  it('prevents a non-member from reading a project', async () => {
    const project = await projectService.createProject(OWNER_ID, { name: 'Private Project' });

    await expect(projectService.getProject(project.id, OUTSIDER_ID)).rejects.toThrow(AppError);
  });

  it('allows a member to read a project they belong to', async () => {
    const project = await projectService.createProject(OWNER_ID, { name: 'Team Project' });
    const fetched = await projectService.getProject(project.id, OWNER_ID);
    expect(fetched.id).toBe(project.id);
  });

  it('prevents a non-owner member from updating the project', async () => {
    const project = await projectService.createProject(OWNER_ID, { name: 'Team Project' });
    await memberRepository.create({ projectId: project.id, userId: 'contributor-1', role: 'CONTRIBUTOR' as any });

    await expect(
      projectService.updateProject(project.id, 'contributor-1', { name: 'Renamed' }),
    ).rejects.toThrow(AppError);
  });

  it('allows the owner to update the project', async () => {
    const project = await projectService.createProject(OWNER_ID, { name: 'Team Project' });
    const updated = await projectService.updateProject(project.id, OWNER_ID, { name: 'Renamed' });
    expect(updated.name).toBe('Renamed');
  });

  it('throws when adding a member whose email does not exist', async () => {
    const project = await projectService.createProject(OWNER_ID, { name: 'Team Project' });
    await expect(
      projectService.addMember(project.id, OWNER_ID, 'ghost@taskflow.dev'),
    ).rejects.toThrow(AppError);
  });

  it('adds an existing user as a project member by email', async () => {
    const project = await projectService.createProject(OWNER_ID, { name: 'Team Project' });
    const user = await userRepository.create({ email: 'brian@taskflow.dev', name: 'Brian' } as any);

    const member = await projectService.addMember(project.id, OWNER_ID, 'brian@taskflow.dev');
    expect(member.userId).toBe(user.id);
  });

  it('prevents removing the project owner from the project', async () => {
    const project = await projectService.createProject(OWNER_ID, { name: 'Team Project' });
    await expect(projectService.removeMember(project.id, OWNER_ID, OWNER_ID)).rejects.toThrow(
      AppError,
    );
  });
});
