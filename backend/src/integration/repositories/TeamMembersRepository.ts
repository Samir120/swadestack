import { BaseDAO } from '../dao/BaseDAO';
import TeamMember from '../../models/sequelize/TeamMember';

export class TeamMembersRepository extends BaseDAO<TeamMember> {
  constructor() {
    super(TeamMember);
  }

  async findActive(
    limit?: number,
    offset?: number,
  ): Promise<{ members: TeamMember[]; total: number }> {
    const { count, rows } = await this.model.findAndCountAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC'], ['createdAt', 'DESC']],
      limit: limit || 50,
      offset: offset || 0,
    });

    return { members: rows, total: count };
  }

  async findAllMembers(
    limit?: number,
    offset?: number,
  ): Promise<{ members: TeamMember[]; total: number }> {
    const { count, rows } = await this.model.findAndCountAll({
      order: [['sort_order', 'ASC'], ['createdAt', 'DESC']],
      limit: limit || 50,
      offset: offset || 0,
    });

    return { members: rows, total: count };
  }

  async findActiveById(id: string): Promise<TeamMember | null> {
    return await this.model.findOne({
      where: { id, is_active: true },
    });
  }

  async toggleActive(id: string): Promise<TeamMember | null> {
    const member = await this.findById(id);
    if (!member) return null;

    member.is_active = !member.is_active;
    await member.save();
    return member;
  }
}

export default TeamMembersRepository;
