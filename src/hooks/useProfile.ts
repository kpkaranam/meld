import { useQuery } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import { useAuthContext } from '../components/auth/AuthProvider';

export function useProfile() {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => profileService.getProfile(user!.id),
    enabled: !!user,
  });
}
