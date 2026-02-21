import { Op } from 'sequelize';
import { BaseDAO } from '../dao/BaseDAO';
import LoginAttempt from '../../models/sequelize/LoginAttempt';

export class LoginAttemptRepository extends BaseDAO<LoginAttempt> {
  constructor() {
    super(LoginAttempt);
  }

  async findByUserId(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ attempts: LoginAttempt[]; total: number }> {
    const { count, rows } = await this.model.findAndCountAll({
      where: { userId } as any,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    return { attempts: rows, total: count };
  }

  async getRecentFailedCount(userId: string, sinceHours: number = 24): Promise<number> {
    const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000);
    return await this.count({
      userId,
      success: false,
      createdAt: { [Op.gte]: since },
    } as any);
  }
}

export default LoginAttemptRepository;
