import PropTypes from 'prop-types';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as BaseThemeProvider } from '@mui/material/styles';

import useFlowlineInfo from 'hooks/useFlowlineInfo';
import { defaultTheme, mationTheme } from 'styles/theme';

const ThemeProvider = ({ children, ...props }) => {
  const { data: flowlineInfo, isPending } = useFlowlineInfo();
  const theme = flowlineInfo?.data.isMation ? mationTheme : defaultTheme;

  if (isPending) return <></>;

  return (
    <BaseThemeProvider theme={theme} {...props}>
      <CssBaseline />

      {children}
    </BaseThemeProvider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeProvider;
