import * as React from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Stack from '@mui/material/Stack';
import AppsIcon from '@mui/icons-material/Apps';
import SwapCallsIcon from '@mui/icons-material/SwapCalls';
import HistoryIcon from '@mui/icons-material/History';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PropTypes from 'prop-types';

import * as URLS from 'config/urls';
import useFormatMessage from 'hooks/useFormatMessage';
import useVersion from 'hooks/useVersion';
import AppBar from 'components/AppBar';
import Drawer from 'components/Drawer';

const drawerLinks = [
  {
    Icon: SwapCallsIcon,
    primary: 'drawer.flows',
    to: URLS.FLOWS,
    dataTest: 'flows-page-drawer-link',
  },
  {
    Icon: AppsIcon,
    primary: 'drawer.apps',
    to: URLS.APPS,
    dataTest: 'apps-page-drawer-link',
  },
  {
    Icon: HistoryIcon,
    primary: 'drawer.executions',
    to: URLS.EXECUTIONS,
    dataTest: 'executions-page-drawer-link',
  },
];

function PublicLayout({ children }) {
  const version = useVersion();

  const theme = useTheme();
  const formatMessage = useFormatMessage();
  const matchSmallScreens = useMediaQuery(theme.breakpoints.down('lg'));
  const [isDrawerOpen, setDrawerOpen] = React.useState(!matchSmallScreens);
  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const bottomLinks = [
    {
      Icon: NotificationsIcon,
      primary: formatMessage('settingsDrawer.notifications'),
      to: URLS.UPDATES,
      badgeContent: version.newVersionCount,
    },
  ];

  return (
    <>
      <AppBar
        drawerOpen={isDrawerOpen}
        onDrawerOpen={openDrawer}
        onDrawerClose={closeDrawer}
      />

      <Box
        sx={{
          display: 'flex',
          flex: 1,
        }}
      >
        <Drawer
          links={drawerLinks}
          bottomLinks={bottomLinks}
          open={isDrawerOpen}
          onOpen={openDrawer}
          onClose={closeDrawer}
        />

        <Stack flex={1}>
          <Toolbar />

          {children}
        </Stack>
      </Box>
    </>
  );
}

PublicLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PublicLayout;
