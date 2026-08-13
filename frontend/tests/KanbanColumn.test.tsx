import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KanbanColumn } from '../src/components/KanbanColumn';
import type { Task } from '../src/types';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Sample task',
    description: null,
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: null,
    projectId: 'p1',
    assigneeId: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('KanbanColumn', () => {
  it('renders the column label and task count', () => {
    render(
      <KanbanColumn
        status="IN_PROGRESS"
        tasks={[makeTask(), makeTask({ id: 'task-2' })]}
        onOpenTask={vi.fn()}
        onDropTask={vi.fn()}
      />,
    );
    expect(screen.getByText('In progress')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows an empty state when there are no tasks', () => {
    render(<KanbanColumn status="DONE" tasks={[]} onOpenTask={vi.fn()} onDropTask={vi.fn()} />);
    expect(screen.getByText(/No tasks here yet/i)).toBeInTheDocument();
  });
});
