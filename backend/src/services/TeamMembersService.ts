import TeamMembersRepository from '../integration/repositories/TeamMembersRepository';
import {
  TeamMemberDTO,
  CreateTeamMemberDTO,
  UpdateTeamMemberDTO,
  ListTeamMemberDTO,
} from '../models/dto/TeamMemberDTO';

export class TeamMembersService {
  private teamMembersRepository: TeamMembersRepository;

  constructor() {
    this.teamMembersRepository = new TeamMembersRepository();
  }

  async getActiveMembers(
    page: number = 1,
    limit: number = 50
  ): Promise<ListTeamMemberDTO> {
    const offset = (page - 1) * limit;
    const { members, total } = await this.teamMembersRepository.findActive(
      limit,
      offset
    );

    return {
      members: members.map(this.mapToDTO),
      total,
    };
  }

  async getAllMembers(
    page: number = 1,
    limit: number = 50
  ): Promise<ListTeamMemberDTO> {
    const offset = (page - 1) * limit;
    const { members, total } = await this.teamMembersRepository.findAllMembers(
      limit,
      offset
    );

    return {
      members: members.map(this.mapToDTO),
      total,
    };
  }

  async getMemberById(id: string): Promise<TeamMemberDTO | null> {
    const member = await this.teamMembersRepository.findById(id);
    return member ? this.mapToDTO(member) : null;
  }

  async createMember(data: CreateTeamMemberDTO): Promise<TeamMemberDTO> {
    this.validateData(data);
    const member = await this.teamMembersRepository.create(data);
    return this.mapToDTO(member);
  }

  async updateMember(id: string, data: UpdateTeamMemberDTO): Promise<TeamMemberDTO | null> {
    const existing = await this.teamMembersRepository.findById(id);
    if (!existing) return null;

    if (data.name_en || data.name_sv || data.bio_en || data.bio_sv) {
      this.validateData(data as any);
    }

    const [, updated] = await this.teamMembersRepository.update(id, data);
    return updated[0] ? this.mapToDTO(updated[0]) : null;
  }

  async deleteMember(id: string): Promise<boolean> {
    const deleted = await this.teamMembersRepository.delete(id);
    return deleted > 0;
  }

  async toggleActive(id: string): Promise<TeamMemberDTO | null> {
    const member = await this.teamMembersRepository.toggleActive(id);
    return member ? this.mapToDTO(member) : null;
  }

  private mapToDTO(member: any): TeamMemberDTO {
    return {
      id: member.id,
      name_en: member.name_en,
      name_sv: member.name_sv,
      role_en: member.role_en,
      role_sv: member.role_sv,
      bio_en: member.bio_en,
      bio_sv: member.bio_sv,
      image_url: member.image_url,
      image_file: member.image_file,
      linkedin_url: member.linkedin_url,
      sort_order: member.sort_order,
      is_active: member.is_active,
    };
  }

  private validateData(data: Partial<CreateTeamMemberDTO>): void {
    if (data.name_en && data.name_en.length < 2) {
      throw new Error('English name must be at least 2 characters');
    }
    if (data.name_sv && data.name_sv.length < 2) {
      throw new Error('Swedish name must be at least 2 characters');
    }
    if (data.bio_en && data.bio_en.length < 10) {
      throw new Error('English bio must be at least 10 characters');
    }
    if (data.bio_sv && data.bio_sv.length < 10) {
      throw new Error('Swedish bio must be at least 10 characters');
    }
  }
}

export default TeamMembersService;
