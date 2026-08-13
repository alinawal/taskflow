import { FormEvent, useState } from 'react';
import type { ProjectMember, TaskPriority } from '../types';

interface CreateTaskFormProps {
  members: ProjectMember[];
  onCreate: (input: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    assigneeId?: string;
  }) => Promise<void>;
  onClose: () => void;
}

export function CreateTaskForm({ members, onCreate, onClose }: CreateTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assigneeId, setAssigneeId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (title.trim().length < 2) {
      setError('Task title must be at least 2 characters.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        assigneeId: assigneeId || undefined,
      });
      onClose();
    } catch {
      setError('Could not create the task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-task-title"
      className="fixed inset-0 z-20 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded bg-surface p-6 shadow-xl"
      >
        <h2 id="create-task-title" className="mb-4 font-display text-xl font-semibold text-ink">
          New task
        </h2>

        {error && (
          <p role="alert" className="mb-4 rounded bg-rust-light px-3 py-2 text-sm text-rust">
            {error}
          </p>
        )}

        <div className="mb-3">
          <label htmlFor="new-task-title" className="field-label">
            Title
          </label>
          <input
            id="new-task-title"
            className="field-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="new-task-description" className="field-label">
            Description
          </label>
          <textarea
            id="new-task-description"
            className="field-input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="new-task-priority" className="field-label">
              Priority
            </label>
            <select
              id="new-task-priority"
              className="field-input"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div>
            <label htmlFor="new-task-assignee" className="field-label">
              Assignee
            </label>
            <select
              id="new-task-assignee"
              className="field-input"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user?.name ?? m.userId}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create task'}
          </button>
        </div>
      </form>
    </div>
  );
}
