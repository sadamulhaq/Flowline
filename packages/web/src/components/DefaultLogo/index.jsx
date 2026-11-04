import Typography from '@mui/material/Typography';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import MationLogo from 'components/MationLogo';
import useFlowlineInfo from 'hooks/useFlowlineInfo';

const DefaultLogo = () => {
  const { data: flowlineInfo, isPending } = useFlowlineInfo();
  const isMation = flowlineInfo?.data.isMation;

  if (isPending) return <React.Fragment />;
  if (isMation) return <MationLogo />;

  return (
    <Typography variant="h6" component="h1" data-test="typography-logo" noWrap>
      <FormattedMessage id="brandText" />
    </Typography>
  );
};

export default DefaultLogo;
