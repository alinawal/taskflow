import { z } from 'zod';
import { TaskPriority, TaskStatus } from '../entities/Task';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Must be a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

export const loginSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(150),
  description: z.string().max(2000).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  description: z.string().max(2000).optional(),
});

export const addMemberSchema = z.object({
  email: z.string().email('Must be a valid email address'),
});

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters').max(200),
  description: z.string().max(4000).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dueDate must be YYYY-MM-DD').optional(),
  assigneeId: z.string().uuid().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(4000).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
});

export const createCommentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty').max(2000),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
