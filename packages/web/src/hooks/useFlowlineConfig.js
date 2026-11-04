import { useQuery } from '@tanstack/react-query';
import api from 'helpers/api';

export default function useFlowlineConfig() {
  const query = useQuery({
    queryKey: ['flowline', 'config'],
    queryFn: async ({ signal }) => {
      const { data } = await api.get(`/v1/flowline/config`, {
        signal,
      });

      return data;
    },
  });

  return query;
}
