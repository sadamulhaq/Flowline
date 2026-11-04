import { useQuery } from '@tanstack/react-query';
import api from 'helpers/api';

export default function useFlowlineInfo() {
  const query = useQuery({
    /**
     * The data doesn't change by user actions, but only by server deployments.
     * So we can set the `staleTime` to Infinity
     **/
    staleTime: Infinity,
    queryKey: ['flowline', 'info'],
    queryFn: async ({ signal }) => {
      const { data } = await api.get('/v1/flowline/info', { signal });

      return data;
    },
  });

  return query;
}
