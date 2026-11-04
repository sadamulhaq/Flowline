import { useQuery } from '@tanstack/react-query';
import api from 'helpers/api';

export default function useFlowlineNotifications() {
  const query = useQuery({
    queryKey: ['flowline', 'notifications'],
    queryFn: async ({ signal }) => {
      const { data } = await api.get(`/v1/flowline/notifications`, {
        signal,
      });
      return data;
    },
  });

  return query;
}
