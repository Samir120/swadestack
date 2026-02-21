import { BaseDAO } from '../dao/BaseDAO';
import User from '../../models/sequelize/User';
import Order from '../../models/sequelize/Order';
import { Op, fn, col, literal, WhereOptions } from 'sequelize';

export class CustomersRepository extends BaseDAO<User> {
  constructor() {
    super(User);
  }

  /**
   * Find customers with search, filter, sort, and pagination
   */
  async findCustomers(options: {
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit: number;
    offset: number;
  }): Promise<{ customers: User[]; total: number }> {
    const where: any = { role: 'user' };

    // Search across name, email, phone
    if (options.search && options.search.length >= 2) {
      const searchTerm = `%${options.search}%`;
      where[Op.or] = [
        { firstName: { [Op.iLike]: searchTerm } },
        { lastName: { [Op.iLike]: searchTerm } },
        { email: { [Op.iLike]: searchTerm } },
        { phone: { [Op.iLike]: searchTerm } },
        literal(`CONCAT("User"."firstName", ' ', "User"."lastName") ILIKE '${options.search.replace(/'/g, "''")}%'`),
      ];
    }

    // Status filter
    if (options.status) {
      const statuses = options.status.split(',').map(s => s.trim());
      const statusConditions: any[] = [];

      for (const status of statuses) {
        switch (status) {
          case 'active':
            statusConditions.push({ isEmailVerified: true });
            break;
          case 'unverified':
            statusConditions.push({ isEmailVerified: false });
            break;
        }
      }

      if (statusConditions.length > 0) {
        if (where[Op.or]) {
          where[Op.and] = [
            { [Op.or]: where[Op.or] },
            { [Op.or]: statusConditions },
          ];
          delete where[Op.or];
        } else {
          where[Op.or] = statusConditions;
        }
      }
    }

    // Determine sort order
    let order: any[] = [['createdAt', 'DESC']];
    const sortDirection = options.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    switch (options.sortBy) {
      case 'name':
        order = [['firstName', sortDirection], ['lastName', sortDirection]];
        break;
      case 'createdAt':
        order = [['createdAt', sortDirection]];
        break;
      case 'lastActive':
        order = [['updatedAt', sortDirection]];
        break;
      default:
        order = [['createdAt', 'DESC']];
    }

    const { count, rows } = await this.model.findAndCountAll({
      where,
      attributes: {
        exclude: ['password', 'emailVerificationToken', 'emailVerificationExpires', 'resetPasswordToken', 'resetPasswordExpires'],
      },
      order,
      limit: options.limit,
      offset: options.offset,
    });

    return { customers: rows, total: count };
  }

  /**
   * Find customer by ID with full profile data (excluding sensitive fields)
   */
  async findCustomerById(id: string): Promise<User | null> {
    return await this.model.findByPk(id, {
      attributes: {
        exclude: ['password', 'emailVerificationToken', 'emailVerificationExpires', 'resetPasswordToken', 'resetPasswordExpires'],
      },
    });
  }

  /**
   * Get total customer count (non-admin users)
   */
  async getCustomerCount(where?: any): Promise<number> {
    const baseWhere: any = { role: 'user' };
    return await this.model.count({ where: { ...baseWhere, ...where } });
  }

  /**
   * Get customers created within a date range
   */
  async getCustomersCreatedBetween(startDate: Date, endDate: Date): Promise<number> {
    return await this.model.count({
      where: {
        role: 'user',
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      } as any,
    });
  }

  /**
   * Update customer profile fields
   */
  async updateCustomer(id: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
  }): Promise<User | null> {
    const updateData: any = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email.toLowerCase();
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth || null;

    await this.model.update(updateData, {
      where: { id } as any,
    });

    return this.findCustomerById(id);
  }

  /**
   * Get all customer IDs matching filter criteria (for CSV export)
   */
  async findAllCustomerIds(options: {
    search?: string;
    status?: string;
  }): Promise<string[]> {
    const where: any = { role: 'user' };

    if (options.search && options.search.length >= 2) {
      const searchTerm = `%${options.search}%`;
      where[Op.or] = [
        { firstName: { [Op.iLike]: searchTerm } },
        { lastName: { [Op.iLike]: searchTerm } },
        { email: { [Op.iLike]: searchTerm } },
        { phone: { [Op.iLike]: searchTerm } },
      ];
    }

    if (options.status) {
      const statuses = options.status.split(',').map(s => s.trim());
      const statusConditions: any[] = [];

      for (const status of statuses) {
        switch (status) {
          case 'active':
            statusConditions.push({ isEmailVerified: true });
            break;
          case 'unverified':
            statusConditions.push({ isEmailVerified: false });
            break;
        }
      }

      if (statusConditions.length > 0) {
        if (where[Op.or]) {
          where[Op.and] = [
            { [Op.or]: where[Op.or] },
            { [Op.or]: statusConditions },
          ];
          delete where[Op.or];
        } else {
          where[Op.or] = statusConditions;
        }
      }
    }

    const customers = await this.model.findAll({
      where,
      attributes: ['id'],
      order: [['createdAt', 'DESC']],
    });

    return customers.map(c => c.id);
  }
}

export default CustomersRepository;
