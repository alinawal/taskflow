import { useEffect, useState, FormEvent } from 'react';
import { api } from '../api/client';
import type { Task, Comment, ProjectMember, TaskStatus, TaskPriority } from '../types';

interface TaskModalProps {
  task: Task;
  members: ProjectMember[];
  onClose: () => void;
  onUpdated: (task: Task) => void;
  onDeleted: (taskId: string) => void;
}

export function TaskModal({ task, members, onClose, onUpdated, onDeleted }: TaskModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    api.comments.listForTask(task.id).then(setComments).catch(() => setError('Could not load comments.'));
  }, [task.id]);

  async function handleFieldChange(patch: Partial<Task>) {
    try {
      const updated = await api.tasks.update(task.id, patch);
      onUpdated(updated);
    } catch {
      setError('Could not update the task. Please try again.');
    }
  }

  async function handleAddComment(e: FormEvent) {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setIsSubmittingComment(true);
    try {
      const comment = await api.comments.create(task.id, commentBody.trim());
      setComments((prev) => [...prev, comment]);
      setCommentBody('');
    } catch {
      setError('Could not post your comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete task "${task.title}"? This cannot be undone.`)) return;
    try {
      await api.tasks.remove(task.id);
      onDeleted(task.id);
    } catch {
      setError('Could not delete the task.');
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      className="fixed inset-0 z-20 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="task-modal-title" className="font-display text-xl font-semibold text-ink">
            {task.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close task details"
            className="rounded p-1 text-muted hover:bg-paper"
          >
            ✕
          </button>
        </div>

        {task.description && <p className="mb-4 text-sm text-muted">{task.description}</p>}

        {error && (
          <p role="alert" className="mb-4 rounded bg-rust-light px-3 py-2 text-sm text-rust">
            {error}
          </p>
        )}

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-status" className="field-label">
              Status
            </label>
            <select
              id="task-status"
              className="field-input"
              value={task.status}
              onChange={(e) => handleFieldChange({ status: e.target.value as TaskStatus })}
            >
              <option value="TODO">To do</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
          <div>
            <label htmlFor="task-priority" className="field-label">
              Priority
            </label>
            <select
              id="task-priority"
              className="field-input"
              value={task.priority}
              onChange={(e) => handleFieldChange({ priority: e.target.value as TaskPriority })}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="task-assignee" className="field-label">
            Assignee
          </label>
          <select
            id="task-assignee"
            className="field-input"
            value={task.assigneeId ?? ''}
            onChange={(e) => handleFieldChange({ assigneeId: e.target.value || null })}
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.user?.name ?? m.userId}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <h3 className="mb-2 text-sm font-semibold text-ink">
            Comments <span className="font-mono text-xs text-muted">({comments.length})</span>
          </h3>
          <ul className="mb-3 max-h-48 space-y-3 overflow-y-auto">
            {comments.map((c) => (
              <li key={c.id} className="rounded border border-border p-2 text-sm">
                <p className="text-ink">{c.body}</p>
                <p className="mt-1 font-mono text-xs text-muted">
                  {c.author?.name ?? 'Unknown'} · {new Date(c.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
            {comments.length === 0 && (
              <li className="text-xs text-muted">No comments yet. Start the discussion below.</li>
            )}
          </ul>
          <form onSubmit={handleAddComment} className="flex gap-2">
            <label htmlFor="new-comment" className="sr-only">
              Write a comment
            </label>
            <input
              id="new-comment"
              className="field-input"
              placeholder="Write a comment…"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
            />
            <button type="submit" className="btn-primary" disabled={isSubmittingComment}>
              Post
            </button>
          </form>
        </div>

        <div className="flex justify-end border-t border-border pt-4">
          <button type="button" onClick={handleDelete} className="text-sm font-medium text-rust hover:underline">
            Delete task
          </button>
        </div>
      </div>
    </div>
  );
}
