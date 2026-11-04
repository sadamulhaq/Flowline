import actionSerializer from '@/serializers/action.js';
import appConfigSerializer from '@/serializers/app-config.js';
import appSerializer from '@/serializers/app.js';
import authSerializer from '@/serializers/auth.js';
import configSerializer from '@/serializers/config.js';
import connectionSerializer from '@/serializers/connection.js';
import executionStepSerializer from '@/serializers/execution-step.js';
import executionSerializer from '@/serializers/execution.js';
import flowSerializer from '@/serializers/flow.js';
import folderSerializer from '@/serializers/folder.js';
import oauthClientSerializer from '@/serializers/oauth-client.js';
import permissionSerializer from '@/serializers/permission.js';
import roleSerializer from '@/serializers/role.js';
import stepSerializer from '@/serializers/step.js';
import triggerSerializer from '@/serializers/trigger.js';
import userAppSerializer from '@/serializers/user-app.js';
import userSerializer from '@/serializers/user.js';

const serializers = {
  Action: actionSerializer,
  App: appSerializer,
  AppConfig: appConfigSerializer,
  Auth: authSerializer,
  Config: configSerializer,
  Connection: connectionSerializer,
  Execution: executionSerializer,
  ExecutionStep: executionStepSerializer,
  Flow: flowSerializer,
  Folder: folderSerializer,
  OAuthClient: oauthClientSerializer,
  Permission: permissionSerializer,
  Role: roleSerializer,
  Step: stepSerializer,
  Trigger: triggerSerializer,
  User: userSerializer,
  UserApp: userAppSerializer,
};

export default serializers;
