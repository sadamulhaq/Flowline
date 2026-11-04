import * as React from 'react';

import CustomLogo from 'components/CustomLogo/index.ee';
import DefaultLogo from 'components/DefaultLogo';
import useFlowlineConfig from 'hooks/useFlowlineConfig';

const Logo = () => {
  const { data: configData, isLoading } = useFlowlineConfig();
  const config = configData?.data;
  const logoSvgData = config?.logoSvgData;

  if (isLoading && !logoSvgData) return <React.Fragment />;

  if (logoSvgData) return <CustomLogo />;

  return <DefaultLogo />;
};

export default Logo;
