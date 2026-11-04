import useFlowlineInfo from 'hooks/useFlowlineInfo';
import useIsCurrentUserAdmin from './useIsCurrentUserAdmin';

export default function useIsCurrentUserEnterpriseAdmin() {
  const isCurrentUserAdmin = useIsCurrentUserAdmin();
  const { data: flowlineInfoData, isFlowlineInfoLoading } =
    useFlowlineInfo();

  const isEnterprise = flowlineInfoData?.data.isEnterprise === true;

  // If the data is still loading, we return undefined to indicate that we don't have the information yet.
  if (isFlowlineInfoLoading) return undefined;
  if (isCurrentUserAdmin === undefined) return undefined;

  return isCurrentUserAdmin && isEnterprise;
}
