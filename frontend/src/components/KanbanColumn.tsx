import type { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';

const COLUMN_META: Record<TaskStatus, { label: string; accent: string }> = {
  TODO: { label: 'To do', accent: 'bg-muted' },
  IN_PROGRESS: { label: 'In progress', accent: 'bg-signal' },
  DONE: { label: 'Done', accent: 'bg-moss' },
};

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onOpenTask: (task: Task) => void;
  onDropTask: (taskId: string, status: TaskStatus) => void;
}

export function KanbanColumn({ status, tasks, onOpenTask, onDropTask }: KanbanColumnProps) {
  const meta = COLUMN_META[status];

  return (
    <section
      aria-label={`${meta.label} column, ${tasks.length} task${tasks.length === 1 ? '' : 's'}`}
      className="flex min-w-[280px] flex-1 flex-col rounded border border-border bg-paper"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const taskId = e.dataTransfer.getData('text/task-id');
        if (taskId) onDropTask(taskId, status);
      }}
    >
      <div className="relative flex items-center gap-2 rounded-t border-b border-border bg-surface px-4 py-3">
        <span className={`h-2 w-2 rounded-full ${meta.accent}`} aria-hidden="true" />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">{meta.label}</h3>
        <span className="ml-auto font-mono text-xs text-muted">{tasks.length}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        {tasks.length === 0 && (
          <p className="rounded border border-dashed border-border p-4 text-center text-xs text-muted">
            No tasks here yet.
          </p>
        )}
        {tasks.map((task) => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/task-id', task.id)}
          >
            <TaskCard task={task} onOpen={onOpenTask} />
          </div>
        ))}
      </div>
    </section>
  );
}
