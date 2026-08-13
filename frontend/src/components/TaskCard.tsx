import type { Task } from '../types';

const PRIORITY_STYLES: Record<Task['priority'], string> = {
  HIGH: 'border-l-rust',
  MEDIUM: 'border-l-signal',
  LOW: 'border-l-moss',
};

const PRIORITY_LABEL: Record<Task['priority'], string> = {
  HIGH: 'High priority',
  MEDIUM: 'Medium priority',
  LOW: 'Low priority',
};

interface TaskCardProps {
  task: Task;
  onOpen: (task: Task) => void;
}

export function TaskCard({ task, onOpen }: TaskCardProps) {
  const initials = task.assignee?.name
    ? task.assignee.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : null;

  return (
    <button
      type="button"
      onClick={() => onOpen(task)}
      className={`card w-full border-l-4 ${PRIORITY_STYLES[task.priority]} p-3 text-left transition-shadow hover:shadow-md`}
      aria-label={`Open task ${task.title}, ${PRIORITY_LABEL[task.priority]}`}
    >
      <p className="text-sm font-medium text-ink">{task.title}</p>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-muted">{task.description}</p>
      )}
      <div className="mt-3 flex items-center justify-between">
        {task.dueDate ? (
          <time className="font-mono text-xs text-muted">{task.dueDate}</time>
        ) : (
          <span className="font-mono text-xs text-muted">No due date</span>
        )}
        {initials && (
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full bg-flow-light font-mono text-[10px] font-semibold text-flow-dark"
            title={task.assignee?.name}
          >
            {initials}
          </span>
        )}
      </div>
    </button>
  );
}
