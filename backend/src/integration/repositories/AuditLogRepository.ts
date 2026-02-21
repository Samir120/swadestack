import { BaseDAO } from '../dao/BaseDAO';
import AuditLog from '../../models/sequelize/AuditLog';

export class AuditLogRepository extends BaseDAO<AuditLog> {
  constructor() {
    super(AuditLog);
  }

  async findByTarget(
    targetType: string,
    targetId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const { count, rows } = await this.model.findAndCountAll({
      where: { targetType, targetId } as any,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    return { logs: rows, total: count };
  }

  async log(data: {
    adminUserId: string;
    adminUserName: string;
    action: string;
    targetType: string;
    targetId: string;
    details?: Record<string, any>;
    ipAddress?: string;
  }): Promise<AuditLog> {
    return await this.create({
      ...data,
      details: data.details ? JSON.stringify(data.details) : undefined,
    });
  }
}

export default AuditLogRepository;
