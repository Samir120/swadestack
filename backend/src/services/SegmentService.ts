import { NewsletterSegmentRepository } from '../integration/repositories/NewsletterSegmentRepository';
import { NewsletterSegmentMemberRepository } from '../integration/repositories/NewsletterSegmentMemberRepository';
import {
  SegmentListDTO,
  CreateSegmentDTO,
  UpdateSegmentDTO,
} from '../models/dto/NewsletterAdminDTO';

export class SegmentService {
  private segmentRepository: NewsletterSegmentRepository;
  private memberRepository: NewsletterSegmentMemberRepository;

  constructor() {
    this.segmentRepository = new NewsletterSegmentRepository();
    this.memberRepository = new NewsletterSegmentMemberRepository();
  }

  async getSegments(): Promise<SegmentListDTO[]> {
    const segments = await this.segmentRepository.findAllWithCounts();
    return segments.map(s => this.mapToSegmentListDTO(s));
  }

  async createSegment(data: CreateSegmentDTO): Promise<SegmentListDTO> {
    const existing = await this.segmentRepository.findByName(data.name);
    if (existing) {
      throw new Error('A segment with this name already exists');
    }

    const segment = await this.segmentRepository.create({
      name: data.name,
      description: data.description,
      type: data.type,
      rules: data.rules,
    });

    return this.mapToSegmentListDTO(segment);
  }

  async updateSegment(id: string, data: UpdateSegmentDTO): Promise<SegmentListDTO | null> {
    const segment = await this.segmentRepository.findById(id);
    if (!segment) return null;

    if (data.name && data.name !== segment.name) {
      const existing = await this.segmentRepository.findByName(data.name);
      if (existing) {
        throw new Error('A segment with this name already exists');
      }
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.rules !== undefined) updateData.rules = data.rules;

    await this.segmentRepository.update(id, updateData);
    const updated = await this.segmentRepository.findById(id);
    return this.mapToSegmentListDTO(updated!);
  }

  async deleteSegment(id: string): Promise<boolean> {
    const result = await this.segmentRepository.delete(id);
    return result > 0;
  }

  async addMembers(segmentId: string, subscriberIds: string[]): Promise<void> {
    await this.memberRepository.addMembers(segmentId, subscriberIds);
    await this.segmentRepository.updateSubscriberCount(segmentId);
  }

  async removeMembers(segmentId: string, subscriberIds: string[]): Promise<void> {
    await this.memberRepository.removeMembers(segmentId, subscriberIds);
    await this.segmentRepository.updateSubscriberCount(segmentId);
  }

  async previewAutoSegment(rules: object): Promise<number> {
    // Placeholder for auto segment preview - returns count of matching subscribers
    // In a full implementation, this would parse rules and query subscribers
    return 0;
  }

  private mapToSegmentListDTO(segment: any): SegmentListDTO {
    return {
      id: segment.id,
      name: segment.name,
      description: segment.description,
      type: segment.type,
      rules: segment.rules,
      subscriberCount: segment.subscriberCount,
      createdAt: segment.createdAt,
      updatedAt: segment.updatedAt,
    };
  }
}

export default SegmentService;
