import { hashPassword, comparePassword } from '../../src/utils/password';
import { signToken, verifyToken } from '../../src/utils/jwt';
import { UserRole } from '../../src/entities/User';
import { registerSchema, createTaskSchema } from '../../src/dto/schemas';

describe('password utils (unit)', () => {
  it('hashes a password to a different string', async () => {
    const hash = await hashPassword('Password123!');
    expect(hash).not.toBe('Password123!');
  });

  it('validates a correct password against its hash', async () => {
    const hash = await hashPassword('Password123!');
    await expect(comparePassword('Password123!', hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password against a hash', async () => {
    const hash = await hashPassword('Password123!');
    await expect(comparePassword('WrongPassword', hash)).resolves.toBe(false);
  });
});

describe('jwt utils (unit)', () => {
  it('signs and verifies a round-trip token', () => {
    const token = signToken({ sub: 'user-1', email: 'a@b.com', role: UserRole.MEMBER });
    const payload = verifyToken(token);
    expect(payload.sub).toBe('user-1');
    expect(payload.role).toBe(UserRole.MEMBER);
  });

  it('throws when verifying a tampered token', () => {
    const token = signToken({ sub: 'user-1', email: 'a@b.com', role: UserRole.MEMBER });
    expect(() => verifyToken(token + 'tampered')).toThrow();
  });
});

describe('validation schemas (unit)', () => {
  it('accepts a valid registration payload', () => {
    const result = registerSchema.safeParse({
      name: 'Alice',
      email: 'alice@taskflow.dev',
      password: 'Password123!',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a registration payload with a weak password', () => {
    const result = registerSchema.safeParse({
      name: 'Alice',
      email: 'alice@taskflow.dev',
      password: 'weak',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a registration payload with an invalid email', () => {
    const result = registerSchema.safeParse({
      name: 'Alice',
      email: 'not-an-email',
      password: 'Password123!',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a task payload with an empty title', () => {
    const result = createTaskSchema.safeParse({ title: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects a task payload with a malformed due date', () => {
    const result = createTaskSchema.safeParse({ title: 'Valid title', dueDate: '20-07-2026' });
    expect(result.success).toBe(false);
  });
});
