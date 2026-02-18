import { BaseDAO } from '../dao/BaseDAO';
import ContactMessage, { ContactMessageAttributes } from '../../models/sequelize/ContactMessage';
import { Op } from 'sequelize';
import User from '../../models/sequelize/User';

export class ContactMessageRepository extends BaseDAO<ContactMessage> {
  constructor() {
    super(ContactMessage);
  }

  /**
   * Override findById to include admin association
   */
  async findById(id: string): Promise<ContactMessage | null> {
    return await this.model.findByPk(id, {
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false,
        },
      ],
    });
  }

  /**
   * Find all contact messages with pagination and filtering
   */
  async findAllWithFilters(options: {
    limit?: number;
    offset?: number;
    status?: 'new' | 'read' | 'replied' | 'archived';
    isRead?: boolean;
  }): Promise<{ messages: ContactMessage[]; total: number }> {
    const where: any = {};

    if (options.status) {
      where.status = options.status;
    }

    if (options.isRead !== undefined) {
      where.isRead = options.isRead;
    }

    const { count, rows } = await this.model.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: options.limit || 50,
      offset: options.offset || 0,
    });

    return { messages: rows, total: count };
  }

  /**
   * Find unread messages
   */
  async findUnread(): Promise<ContactMessage[]> {
    return await this.model.findAll({
      where: { isRead: false },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Find messages by status
   */
  async findByStatus(status: 'new' | 'read' | 'replied' | 'archived'): Promise<ContactMessage[]> {
    return await this.model.findAll({
      where: { status },
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Mark message as read
   */
  async markAsRead(id: string): Promise<ContactMessage | null> {
    const message = await this.findById(id);
    if (!message) return null;

    await message.update({
      isRead: true,
      status: message.status === 'new' ? 'read' : message.status,
    });

    // Reload to get fresh data with associations
    return await this.findById(id);
  }

  /**
   * Mark message as replied
   */
  async markAsReplied(id: string, adminId: string): Promise<ContactMessage | null> {
    const message = await this.findById(id);
    if (!message) return null;

    await message.update({
      status: 'replied',
      isRead: true,
      repliedAt: new Date(),
      repliedBy: adminId,
    });

    // Reload to get fresh data with associations
    return await this.findById(id);
  }

  /**
   * Update message status
   */
  async updateStatus(
    id: string,
    status: 'new' | 'read' | 'replied' | 'archived'
  ): Promise<ContactMessage | null> {
    const message = await this.findById(id);
    if (!message) return null;

    await message.update({ status });
    // Reload to get fresh data with associations
    return await this.findById(id);
  }

  /**
   * Add admin notes
   */
  async addAdminNotes(id: string, notes: string): Promise<ContactMessage | null> {
    const message = await this.findById(id);
    if (!message) return null;

    await message.update({ adminNotes: notes });
    // Reload to get fresh data with associations
    return await this.findById(id);
  }

  /**
   * Get message statistics
   */
  async getStatistics(): Promise<{
    total: number;
    new: number;
    read: number;
    replied: number;
    archived: number;
    unread: number;
  }> {
    const [total, newCount, readCount, repliedCount, archivedCount, unreadCount] = await Promise.all([
      this.model.count(),
      this.model.count({ where: { status: 'new' } }),
      this.model.count({ where: { status: 'read' } }),
      this.model.count({ where: { status: 'replied' } }),
      this.model.count({ where: { status: 'archived' } }),
      this.model.count({ where: { isRead: false } }),
    ]);

    return {
      total,
      new: newCount,
      read: readCount,
      replied: repliedCount,
      archived: archivedCount,
      unread: unreadCount,
    };
  }

  /**
   * Search messages by keyword
   */
  async search(keyword: string): Promise<ContactMessage[]> {
    return await this.model.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${keyword}%` } },
          { email: { [Op.iLike]: `%${keyword}%` } },
          { subject: { [Op.iLike]: `%${keyword}%` } },
          { message: { [Op.iLike]: `%${keyword}%` } },
        ],
      },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Delete old archived messages
   */
  async deleteOldArchived(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.model.destroy({
      where: {
        status: 'archived',
        createdAt: {
          [Op.lt]: cutoffDate,
        },
      },
    });

    return result;
  }
}

export default ContactMessageRepository;
