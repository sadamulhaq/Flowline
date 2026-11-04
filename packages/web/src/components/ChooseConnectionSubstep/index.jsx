import PropTypes from 'prop-types';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import * as React from 'react';

import AddAppConnection from 'components/AddAppConnection';
import FlowSubstepTitle from 'components/FlowSubstepTitle';
import { EditorContext } from 'contexts/Editor';
import useFormatMessage from 'hooks/useFormatMessage';
import {
  AppPropType,
  StepPropType,
  SubstepPropType,
} from 'propTypes/propTypes';
import useStepConnection from 'hooks/useStepConnection';
import { useQueryClient } from '@tanstack/react-query';
import useAppConnections from 'hooks/useAppConnections';
import useTestConnection from 'hooks/useTestConnection';

const ADD_CONNECTION_VALUE = 'ADD_CONNECTION';

const optionGenerator = (connection) => ({
  label: connection?.formattedData?.screenName ?? 'Unnamed',
  value: connection?.id,
});

const getOption = (options, connectionId) =>
  options.find((connection) => connection.value === connectionId) || '';

function ChooseConnectionSubstep(props) {
  const {
    substep,
    expanded = false,
    onExpand,
    onCollapse,
    step,
    onSubmit,
    onChange,
    application,
  } = props;
  const { appKey } = step;
  const formatMessage = useFormatMessage();

  const editorContext = React.useContext(EditorContext);
  const [showAddConnectionDialog, setShowAddConnectionDialog] =
    React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const queryClient = useQueryClient();

  const {
    data: appConnectionsData,
    isLoading: isAppConnectionsLoading,
    refetch: refetchAppConnections,
  } = useAppConnections(appKey);

  const { data: stepConnectionData } = useStepConnection(step.id);
  const stepConnection = stepConnectionData?.data;

  // TODO: show detailed error when connection test/verification fails
  const { mutate: testConnection, isPending: isTestConnectionPending } =
    useTestConnection({
      connectionId: stepConnection?.id,
    });

  React.useEffect(() => {
    if (stepConnection?.id) {
      testConnection({
        variables: {
          id: stepConnection.id,
        },
      });
    }
    // intentionally no dependencies for initial test
  }, []);

  const connectionOptions = React.useMemo(() => {
    const appWithConnections = appConnectionsData?.data;
    const options =
      appWithConnections?.map((connection) => optionGenerator(connection)) ||
      [];

    return options.concat([
      {
        label: formatMessage('chooseConnectionSubstep.addNewConnection'),
        value: ADD_CONNECTION_VALUE,
      },
    ]);
  }, [appConnectionsData, formatMessage]);

  const { name } = substep;

  const handleAddConnectionClose = React.useCallback(
    async (response) => {
      setSubmitting(true);
      setShowAddConnectionDialog(false);
      const connectionId = response?.createConnection?.id;
      if (connectionId) {
        await refetchAppConnections();
        await onChange({
          step: {
            ...step,
            connection: {
              id: connectionId,
            },
          },
        });
      }
      setSubmitting(false);
    },
    [onChange, refetchAppConnections, step],
  );

  const handleChange = React.useCallback(
    async (event, selectedOption) => {
      if (typeof selectedOption === 'object') {
        setSubmitting(true);
        const connectionId = selectedOption?.value;

        if (connectionId === ADD_CONNECTION_VALUE) {
          setShowAddConnectionDialog(true);
        } else if (connectionId !== stepConnection?.id) {
          await onChange({
            step: {
              ...step,
              connection: {
                id: connectionId,
              },
            },
          });

          await queryClient.invalidateQueries({
            queryKey: ['steps', step.id, 'connection'],
          });
        }
        setSubmitting(false);
      }
    },
    [stepConnection?.id, onChange, step, queryClient],
  );

  React.useEffect(() => {
    if (stepConnection?.id) {
      testConnection({
        id: stepConnection?.id,
      });
    }
  }, [stepConnection?.id, testConnection]);

  const onToggle = expanded ? onCollapse : onExpand;

  return (
    <React.Fragment>
      <FlowSubstepTitle
        expanded={expanded}
        onClick={onToggle}
        title={name}
        valid={isTestConnectionPending ? null : stepConnection?.verified}
      />
      <Collapse
        in={expanded}
        timeout={0}
        unmountOnExit
      >
        <ListItem
          sx={{
            pt: 2,
            pb: 3,
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <Autocomplete
            fullWidth
            disablePortal
            disableClearable
            disabled={
              editorContext.readOnly || isTestConnectionPending || submitting
            }
            options={connectionOptions}
            renderInput={(params) => (
              <TextField
                {...params}
                label={formatMessage(
                  'chooseConnectionSubstep.chooseConnection',
                )}
                required
              />
            )}
            value={getOption(connectionOptions, stepConnection?.id)}
            onChange={handleChange}
            loading={isAppConnectionsLoading}
            data-test="choose-connection-autocomplete"
            componentsProps={{ popper: { className: 'nowheel' } }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={onSubmit}
            sx={{ mt: 2 }}
            disabled={
              submitting ||
              isTestConnectionPending ||
              !stepConnection?.verified ||
              editorContext.readOnly
            }
            data-test="flow-substep-continue-button"
          >
            {formatMessage('chooseConnectionSubstep.continue')}
          </Button>
        </ListItem>
      </Collapse>

      {application && showAddConnectionDialog && (
        <AddAppConnection
          onClose={handleAddConnectionClose}
          application={application}
        />
      )}
    </React.Fragment>
  );
}

ChooseConnectionSubstep.propTypes = {
  application: AppPropType.isRequired,
  substep: SubstepPropType.isRequired,
  expanded: PropTypes.bool,
  onExpand: PropTypes.func.isRequired,
  onCollapse: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  step: StepPropType.isRequired,
};

export default ChooseConnectionSubstep;
