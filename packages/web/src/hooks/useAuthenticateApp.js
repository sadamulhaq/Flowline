import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import {
  processOpenWithPopup,
  processPopupMessage,
} from 'helpers/authenticationSteps';
import computeAuthStepVariables from 'helpers/computeAuthStepVariables';
import useAppAuth from 'hooks/useAppAuth';
import useCreateConnection from 'hooks/useCreateConnection';
import useCreateConnectionAuthUrl from 'hooks/useCreateConnectionAuthUrl';
import useFormatMessage from 'hooks/useFormatMessage';
import useResetConnection from 'hooks/useResetConnection';
import useUpdateConnection from 'hooks/useUpdateConnection';
import useVerifyConnection from 'hooks/useVerifyConnection';

export default function useAuthenticateApp({ appKey, connectionId }) {
  const { data: auth } = useAppAuth(appKey);
  const queryClient = useQueryClient();
  const formatMessage = useFormatMessage();
  const [inProgress, setInProgress] = React.useState(false);

  const { mutateAsync: createConnection } = useCreateConnection(appKey);
  const { mutateAsync: createAuthUrl } = useCreateConnectionAuthUrl();
  const { mutateAsync: updateConnection } = useUpdateConnection();
  const { mutateAsync: resetConnection } = useResetConnection();
  const { mutateAsync: verifyConnection } = useVerifyConnection();

  const steps = connectionId
    ? auth?.data?.reconnectionSteps
    : auth?.data?.authenticationSteps;

  const mutations = {
    createConnection,
    generateAuthUrl: (variables) => createAuthUrl(variables.connectionId),
    updateConnection,
    resetConnection: (variables) => resetConnection(variables.connectionId),
    verifyConnection: (variables) => verifyConnection(variables.connectionId),
  };

  const authenticate = async ({ fields } = {}) => {
    const context = { key: appKey, connectionId, fields };

    setInProgress(true);

    try {
      for (const step of steps) {
        const variables = computeAuthStepVariables(step.arguments, context);

        if (step.type === 'openWithPopup') {
          const popup = processOpenWithPopup(variables.url);

          if (!popup) {
            throw new Error(formatMessage('addAppConnection.popupReminder'));
          }

          context[step.name] = await processPopupMessage(popup);
        } else {
          const { data } = await mutations[step.name]({
            ...variables,
            connectionId: variables.connectionId || context.connectionId,
          });

          context[step.name] = data;
          context.connectionId = context.connectionId || data?.id;
        }
      }

      return context;
    } finally {
      await queryClient.invalidateQueries({
        queryKey: ['apps', appKey, 'connections'],
      });

      setInProgress(false);
    }
  };

  return { authenticate: steps?.length ? authenticate : undefined, inProgress };
}
