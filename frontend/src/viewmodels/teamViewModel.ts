import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTeamMembers } from '../store/slices/teamSlice';
import { TeamMember } from '../models/types/teamTypes';

export const useTeamViewModel = () => {
  const dispatch = useAppDispatch();
  const { members, total, isLoading, error } =
    useAppSelector((state) => state.team);

  const loadMembers = (page = 1, limit = 50) => {
    dispatch(fetchTeamMembers({ page, limit }));
  };

  useEffect(() => {
    if (members.length === 0) {
      loadMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getMemberName = (member: TeamMember, language: 'en' | 'sv'): string => {
    return language === 'en' ? member.name_en : member.name_sv;
  };

  const getMemberRole = (member: TeamMember, language: 'en' | 'sv'): string => {
    return language === 'en' ? member.role_en : member.role_sv;
  };

  const getMemberBio = (member: TeamMember, language: 'en' | 'sv'): string => {
    return language === 'en' ? member.bio_en : member.bio_sv;
  };

  return {
    members,
    total,
    isLoading,
    error,
    loadMembers,
    getMemberName,
    getMemberRole,
    getMemberBio,
  };
};

export default useTeamViewModel;
