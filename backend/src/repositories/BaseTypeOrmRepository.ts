import { Repository, ObjectLiteral } from 'typeorm';

/**
 * Base class implementing the boilerplate CRUD operations shared by every
 * concrete repository. Concrete repositories extend this and add
 * entity-specific query methods, avoiding duplicated code across the
 * Repository layer (DRY) while each subclass still owns a single,
 * well-defined responsibility (SRP).
 */
export abstract class BaseTypeOrmRepository<T extends ObjectLiteral> {
  protected constructor(protected readonly ormRepository: Repository<T>) {}

  async findById(id: string): Promise<T | null> {
    return this.ormRepository.findOne({ where: { id } as any });
  }

  async findAll(): Promise<T[]> {
    return this.ormRepository.find();
  }

  async create(data: Partial<T>): Promise<T> {
    const entity = this.ormRepository.create(data as T);
    return this.ormRepository.save(entity);
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    await this.ormRepository.update(id, data as any);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.ormRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
