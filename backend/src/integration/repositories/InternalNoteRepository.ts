import { BaseDAO } from '../dao/BaseDAO';
import InternalNote from '../../models/sequelize/InternalNote';

export class InternalNoteRepository extends BaseDAO<InternalNote> {
  constructor() {
    super(InternalNote);
  }

  async findByTarget(
    targetType: 'customer' | 'order',
    targetId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ notes: InternalNote[]; total: number }> {
    const { count, rows } = await this.model.findAndCountAll({
      where: { targetType, targetId } as any,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    return { notes: rows, total: count };
  }

  async createNote(data: {
    targetType: 'customer' | 'order';
    targetId: string;
    authorId: string;
    authorName: string;
    content: string;
  }): Promise<InternalNote> {
    return await this.create(data);
  }

  async updateNote(id: string, content: string): Promise<InternalNote | null> {
    const [affectedCount, rows] = await this.update(id, { content });
    return affectedCount > 0 ? rows[0] : null;
  }

  async deleteNote(id: string): Promise<boolean> {
    const count = await this.delete(id);
    return count > 0;
  }
}

export default InternalNoteRepository;
