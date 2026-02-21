import AuditLogRepository from '../integration/repositories/AuditLogRepository';

export class AuditLogService {
  private auditLogRepository: AuditLogRepository;

  constructor() {
    this.auditLogRepository = new AuditLogRepository();
  }

  async log(data: {
    adminUserId: string;
    adminUserName: string;
    action: string;
    targetType: string;
    targetId: string;
    details?: Record<string, any>;
    ipAddress?: string;
  }): Promise<void> {
    await this.auditLogRepository.log(data);
  }

  async getLogsForTarget(
    targetType: string,
    targetId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ logs: any[]; total: number; page: number; pageSize: number }> {
    const offset = (page - 1) * pageSize;
    const { logs, total } = await this.auditLogRepository.findByTarget(
      targetType, targetId, pageSize, offset
    );

    return {
      logs: logs.map(log => ({
        id: log.id,
        adminUserId: log.adminUserId,
        adminUserName: log.adminUserName,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        details: log.details ? JSON.parse(log.details) : null,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
      })),
      total,
      page,
      pageSize,
    };
  }
}

export default AuditLogService;
