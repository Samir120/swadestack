import { Model, ModelStatic, FindOptions, WhereOptions } from 'sequelize';

/**
 * Base Data Access Object providing CRUD operations
 */
export class BaseDAO<T extends Model> {
  protected model: ModelStatic<T>;

  constructor(model: ModelStatic<T>) {
    this.model = model;
  }

  /**
   * Find all records with optional filtering and pagination
   */
  async findAll(options?: FindOptions<T>): Promise<T[]> {
    return await this.model.findAll(options);
  }

  /**
   * Find a single record by primary key
   */
  async findById(id: string, options?: FindOptions<T>): Promise<T | null> {
    return await this.model.findByPk(id, options);
  }

  /**
   * Find a single record by criteria
   */
  async findOne(where: WhereOptions<T>, options?: FindOptions<T>): Promise<T | null> {
    return await this.model.findOne({ where, ...options });
  }

  /**
   * Count records matching criteria
   */
  async count(where?: WhereOptions<T>): Promise<number> {
    return await this.model.count({ where });
  }

  /**
   * Create a new record
   */
  async create(data: any): Promise<T> {
    return await this.model.create(data);
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: any): Promise<[number, T[]]> {
    return await this.model.update(data, {
      where: { id } as any,
      returning: true,
    });
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<number> {
    return await this.model.destroy({
      where: { id } as any,
    });
  }

  /**
   * Check if a record exists
   */
  async exists(where: WhereOptions<T>): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  /**
   * Find or create a record
   */
  async findOrCreate(where: WhereOptions<T>, defaults: any): Promise<[T, boolean]> {
    return await this.model.findOrCreate({ where, defaults });
  }

  /**
   * Bulk create records
   */
  async bulkCreate(data: any[]): Promise<T[]> {
    return await this.model.bulkCreate(data);
  }
}
