import { FormEvent, useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { KanbanColumn } from '../components/KanbanColumn';
import { TaskModal } from '../components/TaskModal';
import { CreateTaskForm } from '../components/CreateTaskForm';
import { api, ApiError } from '../api/client';
import type { Project, Task, ProjectMember, TaskStatus, TaskPriority } from '../types';

const COLUMNS: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

export function ProjectBoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAll = useCallback(async () => {
    if (!projectId) return;
    try {
      const [projectData, tasksData, membersData] = await Promise.all([
        api.projects.get(projectId),
        api.tasks.listForProject(projectId),
        api.projects.listMembers(projectId),
      ]);
      setProject(projectData);
      setTasks(tasksData);
      setMembers(membersData);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load this project.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleCreateTask(input: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    assigneeId?: string;
  }) {
    if (!projectId) return;
    const task = await api.tasks.create(projectId, input);
    setTasks((prev) => [...prev, task]);
  }

  async function handleDropTask(taskId: string, status: TaskStatus) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === status) return;
    // Optimistic update for a snappy drag-and-drop feel.
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    try {
      await api.tasks.update(taskId, { status });
    } catch {
      setError('Could not move the task. Reloading board.');
      loadAll();
    }
  }

  function handleTaskUpdated(updated: Task) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTask(updated);
  }

  function handleTaskDeleted(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTask(null);
  }

  async function handleAddMember(e: FormEvent) {
    e.preventDefault();
    if (!projectId || !memberEmail.trim()) return;
    try {
      await api.projects.addMember(projectId, memberEmail.trim());
      const membersData = await api.projects.listMembers(projectId);
      setMembers(membersData);
      setMemberEmail('');
      setShowMemberForm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add that member.');
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <p className="p-10 text-center text-sm text-muted">Loading project…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <p role="alert" className="p-10 text-center text-sm text-rust">
          {error ?? 'Project not found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Link to="/dashboard" className="mb-4 inline-block text-sm text-flow hover:underline">
          ← All projects
        </Link>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">{project.name}</h1>
            {project.description && <p className="text-sm text-muted">{project.description}</p>}
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={() => setShowMemberForm(true)}>
              + Add member
            </button>
            <button type="button" className="btn-primary" onClick={() => setShowCreateTask(true)}>
              + New task
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded bg-rust-light px-3 py-2 text-sm text-rust">
            {error}
          </p>
        )}

        <div className="mb-6 flex flex-wrap gap-2" aria-label="Project members">
          {members.map((m) => (
            <span
              key={m.id}
              className="rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs text-ink"
            >
              {m.user?.name ?? m.userId} · {m.role.toLowerCase()}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasks.filter((t) => t.status === status)}
              onOpenTask={setSelectedTask}
              onDropTask={handleDropTask}
            />
          ))}
        </div>
      </main>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          members={members}
          onClose={() => setSelectedTask(null)}
          onUpdated={handleTaskUpdated}
          onDeleted={handleTaskDeleted}
        />
      )}

      {showCreateTask && (
        <CreateTaskForm
          members={members}
          onCreate={handleCreateTask}
          onClose={() => setShowCreateTask(false)}
        />
      )}

      {showMemberForm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-member-title"
          className="fixed inset-0 z-20 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setShowMemberForm(false)}
        >
          <form
            onSubmit={handleAddMember}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded bg-surface p-6 shadow-xl"
          >
            <h2 id="add-member-title" className="mb-4 font-display text-xl font-semibold text-ink">
              Add a member
            </h2>
            <label htmlFor="member-email" className="field-label">
              Email address
            </label>
            <input
              id="member-email"
              type="email"
              className="field-input mb-5"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="teammate@taskflow.dev"
              autoFocus
              required
            />
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setShowMemberForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Add member
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
