import { useNavigate } from 'react-router-dom';

import useFlowlineInfo from './useFlowlineInfo';

export default function useCloud(options) {
  const redirect = options?.redirect || false;
  const navigate = useNavigate();
  const { data: flowlineInfo } = useFlowlineInfo();

  const isCloud = flowlineInfo?.data.isCloud;

  if (isCloud === false && redirect) {
    navigate('/');
  }

  return isCloud;
}
