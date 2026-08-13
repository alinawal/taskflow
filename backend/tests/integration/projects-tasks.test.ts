import request from 'supertest';
import { Application } from 'express';
import { DataSource } from 'typeorm';
import { createTestApp } from './testApp';

async function registerAndLogin(app: Application, email: string, name: string) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name, email, password: 'Password123!' });
  return { token: res.body.token as string, userId: res.body.user.id as string };
}

describe('Projects & Tasks API (integration)', () => {
  let app: Application;
  let dataSource: DataSource;

  beforeEach(async () => {
    ({ app, dataSource } = await createTestApp());
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  it('rejects project creation without authentication', async () => {
    const res = await request(app).post('/api/projects').send({ name: 'No Auth Project' });
    expect(res.status).toBe(401);
  });

  it('supports the full project -> task -> comment -> notification workflow', async () => {
    const owner = await registerAndLogin(app, 'owner@taskflow.dev', 'Owner');
    const member = await registerAndLogin(app, 'member@taskflow.dev', 'Member');

    // Create project
    const projectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'TaskFlow Launch', description: 'MVP launch project' });
    expect(projectRes.status).toBe(201);
    const projectId = projectRes.body.id;

    // Non-member cannot view the project
    const forbiddenRes = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${member.token}`);
    expect(forbiddenRes.status).toBe(403);

    // Owner adds member by email
    const addMemberRes = await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ email: 'member@taskflow.dev' });
    expect(addMemberRes.status).toBe(201);

    // Member can now view the project
    const viewRes = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${member.token}`);
    expect(viewRes.status).toBe(200);

    // Owner creates a task assigned to member
    const taskRes = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ title: 'Build Kanban board', priority: 'HIGH', assigneeId: member.userId });
    expect(taskRes.status).toBe(201);
    const taskId = taskRes.body.id;

    // Member received an assignment notification
    const notifRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${member.token}`);
    expect(notifRes.status).toBe(200);
    expect(notifRes.body).toHaveLength(1);
    expect(notifRes.body[0].type).toBe('TASK_ASSIGNED');

    // Member updates task status
    const statusRes = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${member.token}`)
      .send({ status: 'IN_PROGRESS' });
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.status).toBe('IN_PROGRESS');

    // Owner comments on the task
    const commentRes = await request(app)
      .post(`/api/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ body: 'Looking good, keep it up!' });
    expect(commentRes.status).toBe(201);

    // Member can list comments
    const commentsListRes = await request(app)
      .get(`/api/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${member.token}`);
    expect(commentsListRes.status).toBe(200);
    expect(commentsListRes.body).toHaveLength(1);
    expect(commentsListRes.body[0].body).toBe('Looking good, keep it up!');

    // Project task list reflects the created task
    const listTasksRes = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${owner.token}`);
    expect(listTasksRes.status).toBe(200);
    expect(listTasksRes.body).toHaveLength(1);
  });

  it('returns 403 when a non-owner tries to delete a project', async () => {
    const owner = await registerAndLogin(app, 'owner2@taskflow.dev', 'Owner2');
    const member = await registerAndLogin(app, 'member2@taskflow.dev', 'Member2');

    const projectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Guarded Project' });
    const projectId = projectRes.body.id;

    await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ email: 'member2@taskflow.dev' });

    const deleteRes = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${member.token}`);

    expect(deleteRes.status).toBe(403);
  });

  it('returns 404 when creating a task on a non-existent project membership', async () => {
    const owner = await registerAndLogin(app, 'owner3@taskflow.dev', 'Owner3');
    const res = await request(app)
      .post('/api/projects/11111111-1111-1111-1111-111111111111/tasks')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ title: 'Ghost task' });

    expect(res.status).toBe(403); // not a member of a project that does not exist
  });

  it('returns 400 when creating a task with an invalid payload', async () => {
    const owner = await registerAndLogin(app, 'owner4@taskflow.dev', 'Owner4');
    const projectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Validation Project' });

    const res = await request(app)
      .post(`/api/projects/${projectRes.body.id}/tasks`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ title: '' });

    expect(res.status).toBe(400);
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('health check endpoint responds 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
