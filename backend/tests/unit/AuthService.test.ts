import { AuthService } from '../../src/services/AuthService';
import { FakeUserRepository } from '../fixtures/fakeRepositories';
import { AppError } from '../../src/utils/AppError';

describe('AuthService (unit)', () => {
  let userRepository: FakeUserRepository;
  let authService: AuthService;

  beforeEach(() => {
    userRepository = new FakeUserRepository();
    authService = new AuthService(userRepository);
  });

  describe('register', () => {
    it('creates a new user and returns a signed token', async () => {
      const result = await authService.register({
        name: 'Alice Njoroge',
        email: 'alice@taskflow.dev',
        password: 'Password123!',
      });

      expect(result.token).toEqual(expect.any(String));
      expect(result.user.email).toBe('alice@taskflow.dev');
      expect((result.user as any).passwordHash).toBeUndefined();
    });

    it('hashes the password rather than storing it in plain text', async () => {
      await authService.register({
        name: 'Alice Njoroge',
        email: 'alice@taskflow.dev',
        password: 'Password123!',
      });
      const stored = await userRepository.findByEmail('alice@taskflow.dev');
      expect(stored?.passwordHash).not.toBe('Password123!');
      expect(stored?.passwordHash.length).toBeGreaterThan(20);
    });

    it('rejects registration with a duplicate email', async () => {
      await authService.register({
        name: 'Alice Njoroge',
        email: 'alice@taskflow.dev',
        password: 'Password123!',
      });

      await expect(
        authService.register({
          name: 'Alice Clone',
          email: 'alice@taskflow.dev',
          password: 'AnotherPass1',
        }),
      ).rejects.toThrow(AppError);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.register({
        name: 'Alice Njoroge',
        email: 'alice@taskflow.dev',
        password: 'Password123!',
      });
    });

    it('logs in a user with correct credentials', async () => {
      const result = await authService.login({
        email: 'alice@taskflow.dev',
        password: 'Password123!',
      });
      expect(result.token).toEqual(expect.any(String));
      expect(result.user.email).toBe('alice@taskflow.dev');
    });

    it('rejects login with a wrong password', async () => {
      await expect(
        authService.login({ email: 'alice@taskflow.dev', password: 'WrongPass1' }),
      ).rejects.toThrow(AppError);
    });

    it('rejects login for an email that does not exist', async () => {
      await expect(
        authService.login({ email: 'ghost@taskflow.dev', password: 'Password123!' }),
      ).rejects.toThrow(AppError);
    });
  });
});
