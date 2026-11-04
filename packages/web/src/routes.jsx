import { useEffect } from 'react';
import {
  Navigate,
  Routes as ReactRouterRoutes,
  Route,
  useNavigate,
} from 'react-router-dom';

import * as URLS from 'config/urls';
import Application from 'pages/Application';
import Applications from 'pages/Applications';
import EditorRoutes from 'pages/Editor/routes';
import Execution from 'pages/Execution';
import Executions from 'pages/Executions';
import Flows from 'pages/Flows';
import Installation from 'pages/Installation';
import Layout from 'components/Layout';
import Login from 'pages/Login';
import NoResultFound from 'components/NotFound';
import Notifications from 'pages/Notifications';
import PublicLayout from 'components/PublicLayout';
import settingsRoutes from './settingsRoutes';
import useAuthentication from 'hooks/useAuthentication';
import useFlowlineInfo from 'hooks/useFlowlineInfo';

function Routes() {
  const navigate = useNavigate();
  const { data: flowlineInfo, isSuccess } = useFlowlineInfo();
  const { isAuthenticated } = useAuthentication();

  const installed = isSuccess
    ? flowlineInfo.data.installationCompleted
    : true;

  useEffect(() => {
    if (!installed) {
      navigate(URLS.INSTALLATION, { replace: true });
    }
  }, []);

  return (
    <ReactRouterRoutes>
      <Route
        path={URLS.EXECUTIONS}
        element={
          <Layout>
            <Executions />
          </Layout>
        }
      />

      <Route
        path={URLS.EXECUTION_PATTERN}
        element={
          <Layout>
            <Execution />
          </Layout>
        }
      />

      <Route
        path={`${URLS.FLOWS}/*`}
        element={
          <Layout>
            <Flows />
          </Layout>
        }
      />

      <Route
        path={`${URLS.APPS}/*`}
        element={
          <Layout>
            <Applications />
          </Layout>
        }
      />

      <Route
        path={`${URLS.APP_PATTERN}/*`}
        element={
          <Layout>
            <Application />
          </Layout>
        }
      />

      <Route path={`${URLS.EDITOR}/*`} element={<EditorRoutes />} />

      <Route
        path={URLS.LOGIN}
        element={
          <PublicLayout>
            <Login />
          </PublicLayout>
        }
      />

      {!installed && (
        <Route
          path={URLS.INSTALLATION}
          element={
            <PublicLayout>
              <Installation />
            </PublicLayout>
          }
        />
      )}

      <Route
        path={URLS.UPDATES}
        element={
          <Layout>
            <Notifications />
          </Layout>
        }
      />

      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? URLS.FLOWS : URLS.LOGIN} replace />
        }
      />

      <Route path={URLS.SETTINGS}>{settingsRoutes}</Route>

      <Route path="*" element={<NoResultFound />} />
    </ReactRouterRoutes>
  );
}

export default <Routes />;
