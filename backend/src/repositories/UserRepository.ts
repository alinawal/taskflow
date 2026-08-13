import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { IUserRepository } from '../interfaces/repositories';
import { BaseTypeOrmRepository } from './BaseTypeOrmRepository';

export class UserRepository extends BaseTypeOrmRepository<User> implements IUserRepository {
  constructor(dataSource: DataSource) {
    super(dataSource.getRepository(User));
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.ormRepository.findOne({ where: { email } });
  }
}
