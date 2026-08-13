import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from '../src/components/TaskCard';
import type { Task } from '../src/types';

const baseTask: Task = {
  id: 'task-1',
  title: 'Design database schema',
  description: 'Model users, projects and tasks.',
  status: 'TODO',
  priority: 'HIGH',
  dueDate: '2026-07-20',
  projectId: 'project-1',
  assigneeId: 'user-1',
  assignee: { id: 'user-1', name: 'Alice Njoroge', email: 'alice@taskflow.dev', role: 'MEMBER' },
  createdAt: new Date().toISOString(),
};

describe('TaskCard', () => {
  it('renders the task title, description and due date', () => {
    render(<TaskCard task={baseTask} onOpen={vi.fn()} />);
    expect(screen.getByText('Design database schema')).toBeInTheDocument();
    expect(screen.getByText(/Model users, projects/)).toBeInTheDocument();
    expect(screen.getByText('2026-07-20')).toBeInTheDocument();
  });

  it('renders assignee initials', () => {
    render(<TaskCard task={baseTask} onOpen={vi.fn()} />);
    expect(screen.getByText('AN')).toBeInTheDocument();
  });

  it('shows "No due date" when the task has none', () => {
    render(<TaskCard task={{ ...baseTask, dueDate: null }} onOpen={vi.fn()} />);
    expect(screen.getByText('No due date')).toBeInTheDocument();
  });

  it('calls onOpen with the task when clicked', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<TaskCard task={baseTask} onOpen={onOpen} />);

    await user.click(screen.getByRole('button', { name: /Design database schema/i }));
    expect(onOpen).toHaveBeenCalledWith(baseTask);
  });
});
