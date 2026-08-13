import { IUserRepository } from '../interfaces/repositories';
import { RegisterInput, LoginInput } from '../dto/schemas';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { User, UserRole } from '../entities/User';

export interface AuthResult {
  token: string;
  user: Omit<User, 'passwordHash'>;
}

/**
 * AuthService owns all authentication business rules. It depends only on
 * the IUserRepository abstraction (constructor injection), not on any
 * concrete ORM class — this is the Dependency Inversion Principle in
 * practice, and it is what makes AuthServiceTest able to run fully
 * in-memory with a fake repository (see tests/unit/AuthService.test.ts).
 */
export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw AppError.conflict('An account with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: UserRole.MEMBER,
    });

    return this.buildAuthResult(user);
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const passwordValid = await comparePassword(input.password, user.passwordHash);
    if (!passwordValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    return this.buildAuthResult(user);
  }

  async getProfile(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw AppError.notFound('User not found');
    return this.sanitize(user);
  }

  private buildAuthResult(user: User): AuthResult {
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    return { token, user: this.sanitize(user) };
  }

  private sanitize(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash: _passwordHash, ...rest } = user;
    return rest;
  }
}
