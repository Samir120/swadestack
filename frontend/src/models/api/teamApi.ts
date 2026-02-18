import apiClient from './apiClient';
import { TeamMember } from '../types/teamTypes';

export interface TeamMemberListResponse {
  members: TeamMember[];
  total: number;
}

export const teamApi = {
  getAll: async (page = 1, limit = 50) => {
    return apiClient.get<TeamMemberListResponse>('/team', {
      page,
      limit,
    });
  },

  getById: async (id: string) => {
    return apiClient.get<TeamMember>(`/team/${id}`);
  },
};
