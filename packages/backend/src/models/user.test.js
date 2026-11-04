import { beforeEach, describe, it, expect, vi } from 'vitest';
import Crypto from 'crypto';
import Base from '@/models/base.js';
import AccessToken from '@/models/access-token.js';
import Config from '@/models/config.js';
import Connection from '@/models/connection.js';
import Execution from '@/models/execution.js';
import Flow from '@/models/flow.js';
import Folder from '@/models/folder.js';
import Permission from '@/models/permission.js';
import Role from '@/models/role.js';
import Step from '@/models/step.js';
import User from '@/models/user.js';
import * as userAbilityModule from '@/helpers/user-ability.js';
import { createUser } from '@/factories/user.js';
import { createConnection } from '@/factories/connection.js';
import { createRole } from '@/factories/role.js';
import { createPermission } from '@/factories/permission.js';
import { createFlow } from '@/factories/flow.js';
import { createStep } from '@/factories/step.js';
import { createExecution } from '@/factories/execution.js';
import { createFolder } from '@/factories/folder.js';

describe('User model', () => {
  it('tableName should return correct name', () => {
    expect(User.tableName).toBe('users');
  });

  it('jsonSchema should have correct validations', () => {
    expect(User.jsonSchema).toMatchSnapshot();
  });

  describe('relationMappings', () => {
    it('should return correct associations', () => {
      const relationMappings = User.relationMappings();

      const expectedRelations = {
        accessTokens: {
          relation: Base.HasManyRelation,
          modelClass: AccessToken,
          join: {
            from: 'users.id',
            to: 'access_tokens.user_id',
          },
        },
        connections: {
          relation: Base.HasManyRelation,
          modelClass: Connection,
          join: {
            from: 'users.id',
            to: 'connections.user_id',
          },
        },
        flows: {
          relation: Base.HasManyRelation,
          modelClass: Flow,
          join: {
            from: 'users.id',
            to: 'flows.user_id',
          },
        },
        steps: {
          relation: Base.ManyToManyRelation,
          modelClass: Step,
          join: {
            from: 'users.id',
            through: {
              from: 'flows.user_id',
              to: 'flows.id',
            },
            to: 'steps.flow_id',
          },
        },
        executions: {
          relation: Base.ManyToManyRelation,
          modelClass: Execution,
          join: {
            from: 'users.id',
            through: {
              from: 'flows.user_id',
              to: 'flows.id',
            },
            to: 'executions.flow_id',
          },
        },
        role: {
          relation: Base.HasOneRelation,
          modelClass: Role,
          join: {
            from: 'roles.id',
            to: 'users.role_id',
          },
        },
        permissions: {
          relation: Base.HasManyRelation,
          modelClass: Permission,
          join: {
            from: 'users.role_id',
            to: 'permissions.role_id',
          },
        },
        folders: {
          relation: Base.HasManyRelation,
          modelClass: Folder,
          join: {
            from: 'users.id',
            to: 'folders.user_id',
          },
        },
      };

      expect(relationMappings).toStrictEqual(expectedRelations);
    });
  });

  describe('readableFlows', () => {
    it('should return user flows with isCreator condition', async () => {
      const userRole = await createRole({ name: 'User' });

      await createPermission({
        roleId: userRole.id,
        subject: 'Flow',
        action: 'read',
        conditions: ['isCreator'],
      });

      const user = await createUser({ roleId: userRole.id });

      const userWithRoleAndPermissions = await user
        .$query()
        .withGraphFetched({ role: true, permissions: true });

      const userFlow = await createFlow({ userId: user.id });
      await createFlow();

      expect(await userWithRoleAndPermissions.readableFlows).toStrictEqual([
        userFlow,
      ]);
    });

    it('should return all flows without isCreator condition', async () => {
      const userRole = await createRole({ name: 'User' });

      await createPermission({
        roleId: userRole.id,
        subject: 'Flow',
        action: 'read',
        conditions: [],
      });

      const user = await createUser({ roleId: userRole.id });

      const userWithRoleAndPermissions = await user
        .$query()
        .withGraphFetched({ role: true, permissions: true });

      const userFlow = await createFlow({ userId: user.id });
      const anotherUserFlow = await createFlow();

      expect(await userWithRoleAndPermissions.readableFlows).toStrictEqual([
        userFlow,
        anotherUserFlow,
      ]);
    });

    it('should throw an authorization error without Flow read permission', async () => {
      const user = new User();

      expect(() => user.readableFlows).toThrowError(
        'The user is not authorized!'
      );
    });
  });

  describe('readableSteps', () => {
    it('should return user steps with isCreator condition', async () => {
      const userRole = await createRole({ name: 'User' });

      await createPermission({
        roleId: userRole.id,
        subject: 'Flow',
        action: 'read',
        conditions: ['isCreator'],
      });

      const user = await createUser({ roleId: userRole.id });

      const userWithRoleAndPermissions = await user
        .$query()
        .withGraphFetched({ role: true, permissions: true });

      const userFlow = await createFlow({ userId: user.id });
      const userFlowStep = await createStep({ flowId: userFlow.id });
      const anotherUserFlow = await createFlow();
      await createStep({ flowId: anotherUserFlow.id });

      expect(await userWithRoleAndPermissions.readableSteps).toStrictEqual([
        userFlowStep,
      ]);
    });

    it('should return all steps without isCreator condition', async () => {
      const userRole = await createRole({ name: 'User' });

      await createPermission({
        roleId: userRole.id,
        subject: 'Flow',
        action: 'read',
        conditions: [],
      });

      const user = await createUser({ roleId: userRole.id });

      const userWithRoleAndPermissions = await user
        .$query()
        .withGraphFetched({ role: true, permissions: true });

      const userFlow = await createFlow({ userId: user.id });
      const userFlowStep = await createStep({ flowId: userFlow.id });
      const anotherUserFlow = await createFlow();
      const anotherUserFlowStep = await createStep({
        flowId: anotherUserFlow.id,
      });

      expect(await userWithRoleAndPermissions.readableSteps).toStrictEqual([
        userFlowStep,
        anotherUserFlowStep,
      ]);
    });

    it('should throw an authorization error without Flow read permission', async () => {
      const user = new User();

      expect(() => user.readableSteps).toThrowError(
        'The user is not authorized!'
      );
    });
  });

  describe('readableConnections', () => {
    it('should return user connections with isCreator condition', async () => {
      const userRole = await createRole({ name: 'User' });

      await createPermission({
        roleId: userRole.id,
        subject: 'Connection',
        action: 'read',
        conditions: ['isCreator'],
      });

      const user = await createUser({ roleId: userRole.id });

      const userWithRoleAndPermissions = await user
        .$query()
        .withGraphFetched({ role: true, permissions: true });

      const userConnection = await createConnection({ userId: user.id });
      await createConnection();

      expect(
        await userWithRoleAndPermissions.readableConnections
      ).toStrictEqual([userConnection]);
    });

    it('should return all connections without isCreator condition', async () => {
      const userRole = await createRole({ name: 'User' });

      await createPermission({
        roleId: userRole.id,
        subject: 'Connection',
        action: 'read',
        conditions: [],
      });

      const user = await createUser({ roleId: userRole.id });

      const userWithRoleAndPermissions = await user
        .$query()
        .withGraphFetched({ role: true, permissions: true });

      const userConnection = await createConnection({ userId: user.id });
      const anotherUserConnection = await createConnection();

      expect(
        await userWithRoleAndPermissions.readableConnections.orderBy(
          'created_at',
          'asc'
        )
      ).toStrictEqual([userConnection, anotherUserConnection]);
    });

    it('should throw an authorization error without Connection read permission', async () => {
      const user = new User();

      expect(() => user.readableConnections).toThrowError(
        'The user is not authorized!'
      );
    });
  });

  describe('readableExecutions', () => {
    it('should return user executions with isCreator condition', async () => {
      const userRole = await createRole({ name: 'User' });

      await createPermission({
        roleId: userRole.id,
        subject: 'Execution',
        action: 'read',
        conditions: ['isCreator'],
      });

      const user = await createUser({ roleId: userRole.id });

      const userWithRoleAndPermissions = await user
        .$query()
        .withGraphFetched({ role: true, permissions: true });

      const userFlow = await createFlow({ userId: user.id });
      const userFlowExecution = await createExecution({ flowId: userFlow.id });
      await createExecution();

      expect(await userWithRoleAndPermissions.readableExecutions).toStrictEqual(
        [userFlowExecution]
      );
    });

    it('should return all executions without isCreator condition', async () => {
      const userRole = await createRole({ name: 'User' });

      await createPermission({
        roleId: userRole.id,
        subject: 'Execution',
        action: 'read',
        conditions: [],
      });

      const user = await createUser({ roleId: userRole.id });

      const userWithRoleAndPermissions = await user
        .$query()
        .withGraphFetched({ role: true, permissions: true });

      const userFlow = await createFlow({ userId: user.id });
      const userFlowExecution = await createExecution({ flowId: userFlow.id });
      const anotherUserFlowExecution = await createExecution();

      expect(await userWithRoleAndPermissions.readableExecutions).toStrictEqual(
        [userFlowExecution, anotherUserFlowExecution]
      );
    });

    it('should throw an authorization error without Execution read permission', async () => {
      const user = new User();

      expect(() => user.readableExecutions).toThrowError(
        'The user is not authorized!'
      );
    });
  });

  it('ability should return userAbility for the user', () => {
    const user = new User();
    user.fullName = 'Sample user';

    const userAbilitySpy = vi
      .spyOn(userAbilityModule, 'default')
      .mockReturnValue('user-ability');

    expect(user.ability).toStrictEqual('user-ability');
    expect(userAbilitySpy).toHaveBeenNthCalledWith(1, user);
  });

  describe('authenticate', () => {
    it('should create and return the token for correct email and password', async () => {
      const user = await createUser({
        email: 'test-user@flowline.example',
        password: 'sample-password',
      });

      const token = await User.authenticate(
        'test-user@flowline.example',
        'sample-password'
      );

      const persistedToken = await AccessToken.query().findOne({
        userId: user.id,
      });

      expect(token).toBe(persistedToken.token);
    });

    it('should return undefined for existing email and incorrect password', async () => {
      await createUser({
        email: 'test-user@flowline.example',
        password: 'sample-password',
      });

      const token = await User.authenticate(
        'test-user@flowline.example',
        'wrong-password'
      );

      expect(token).toBe(undefined);
    });

    it('should return undefined for non-existing email', async () => {
      await createUser({
        email: 'test-user@flowline.example',
        password: 'sample-password',
      });

      const token = await User.authenticate('non-existing-user@flowline.example');

      expect(token).toBe(undefined);
    });
  });

  describe('login', () => {
    it('should return true when the given password matches with the user password', async () => {
      const user = await createUser({ password: 'sample-password' });

      expect(await user.login('sample-password')).toBe(true);
    });

    it('should return false when the given password does not match with the user password', async () => {
      const user = await createUser({ password: 'sample-password' });

      expect(await user.login('wrong-password')).toBe(false);
    });
  });

  describe('updatePassword', () => {
    it('should update password when the given current password matches with the user password', async () => {
      const user = await createUser({ password: 'sample-password' });

      const updatedUser = await user.updatePassword({
        currentPassword: 'sample-password',
        password: 'new-password',
      });

      expect(await updatedUser.login('new-password')).toBe(true);
    });

    it('should throw validation error when the given current password does not match with the user password', async () => {
      const user = await createUser({ password: 'sample-password' });

      await expect(
        user.updatePassword({
          currentPassword: 'wrong-password',
          password: 'new-password',
        })
      ).rejects.toThrowError('currentPassword: is incorrect.');
    });
  });

  describe('generateHash', () => {
    it('should hash password and re-assign it', async () => {
      const user = new User();
      user.password = 'sample-password';

      await user.generateHash();

      expect(user.password).not.toBe('sample-password');
      expect(await user.login('sample-password')).toBe(true);
    });

    it('should do nothing when password does not exist', async () => {
      const user = new User();

      await user.generateHash();

      expect(user.password).toBe(undefined);
    });
  });

  describe('hasFolderAccess', () => {
    let currentUser, currentUserFolder;

    beforeEach(async () => {
      currentUser = await createUser();
      currentUserFolder = await createFolder({ userId: currentUser.id });
    });

    it('should return true if the user has access to the folder', async () => {
      const hasAccess = await currentUser.hasFolderAccess(currentUserFolder.id);
      expect(hasAccess).toBe(true);
    });

    it('should throw an error if the user does not have access to the folder', async () => {
      const anotherUser = await createUser();
      const anotherUserFolder = await createFolder({ userId: anotherUser.id });

      await expect(
        currentUser.hasFolderAccess(anotherUserFolder.id)
      ).rejects.toThrow();
    });

    it('should throw an error if the folder does not exist', async () => {
      const nonExistingFolderUUID = Crypto.randomUUID();

      await expect(
        currentUser.hasFolderAccess(nonExistingFolderUUID)
      ).rejects.toThrow();
    });
  });

  describe('getFlows', () => {
    let currentUser,
      currentUserRole,
      anotherUser,
      folder,
      anotherUserFolder,
      flowOne,
      flowTwo,
      flowThree;

    beforeEach(async () => {
      currentUser = await createUser();
      currentUserRole = await currentUser.$relatedQuery('role');

      anotherUser = await createUser();

      folder = await createFolder({ userId: currentUser.id });
      anotherUserFolder = await createFolder({ userId: anotherUser.id });

      flowOne = await createFlow({
        userId: currentUser.id,
        folderId: folder.id,
        active: true,
        name: 'Flow One',
      });

      flowTwo = await createFlow({
        userId: currentUser.id,
        active: false,
        name: 'Flow Two',
      });

      flowThree = await createFlow({
        userId: anotherUser.id,
        name: 'Flow Three',
        folderId: anotherUserFolder.id,
      });

      await createPermission({
        action: 'read',
        subject: 'Flow',
        roleId: currentUserRole.id,
        conditions: [],
      });

      currentUser = await currentUser.$query().withGraphFetched({
        role: true,
        permissions: true,
      });
    });

    it('should return flows filtered by name', async () => {
      const flows = await currentUser.getFlows({ name: 'Flow Two' }, [
        folder.id,
      ]);

      expect(flows).toHaveLength(1);
      expect(flows[0].id).toBe(flowTwo.id);
    });

    it('should return flows filtered by status', async () => {
      const flows = await currentUser.getFlows({ status: 'published' }, [
        folder.id,
      ]);

      expect(flows).toHaveLength(1);
      expect(flows[0].id).toBe(flowOne.id);
    });

    it('should return flows filtered by name and status', async () => {
      const flows = await currentUser.getFlows(
        { name: 'Flow One', status: 'published' },
        [folder.id]
      );

      expect(flows).toHaveLength(1);
      expect(flows[0].id).toBe(flowOne.id);
    });

    it('should return flows filtered by onlyOwnedFlows', async () => {
      const flows = await currentUser.getFlows({ onlyOwnedFlows: true }, [
        folder.id,
      ]);

      expect(flows).toHaveLength(2);
      expect(flows[0].id).toBe(flowOne.id);
      expect(flows[1].id).toBe(flowTwo.id);
    });

    it('should return flows filtered by onlyOwnedFlows with null folderId', async () => {
      const flows = await currentUser.getFlows(
        { onlyOwnedFlows: true, folderId: 'null' },
        [folder.id]
      );

      expect(flows).toHaveLength(1);
      expect(flows[0].id).toBe(flowTwo.id);
    });

    it('should return flows with specific folder ID', async () => {
      const flows = await currentUser.getFlows({ folderId: folder.id }, [
        folder.id,
      ]);

      expect(flows.length).toBe(1);
      expect(flows[0].id).toBe(flowOne.id);
    });

    it('should return flows filtered by folderId and name', async () => {
      const flows = await currentUser.getFlows(
        {
          folderId: folder.id,
          name: 'Flow One',
        },
        [folder.id]
      );

      expect(flows).toHaveLength(1);
      expect(flows[0].id).toBe(flowOne.id);
    });

    it('should return all flows if no filters are provided', async () => {
      const flows = await currentUser.getFlows({}, [folder.id]);

      expect(flows).toHaveLength(3);
      expect(flows.map((flow) => flow.id)).toEqual(
        expect.arrayContaining([flowOne.id, flowTwo.id, flowThree.id])
      );
    });

    it('should return uncategorized flows if the folderId is null', async () => {
      const flows = await currentUser.getFlows({ folderId: 'null' }, [
        folder.id,
      ]);

      expect(flows).toHaveLength(2);
      expect(flows.map((flow) => flow.id)).toEqual(
        expect.arrayContaining([flowTwo.id, flowThree.id])
      );
    });

    it('should return other users flow as uncategorized flows if the folderId is null', async () => {
      const flows = await currentUser.getFlows({ folderId: 'null' }, [
        folder.id,
      ]);

      expect(flows).toHaveLength(2);
      expect(flows.map((flow) => flow.id)).toEqual(
        expect.arrayContaining([flowTwo.id, flowThree.id])
      );
    });

    it('should return specified flows with all filters together', async () => {
      const flows = await currentUser.getFlows(
        {
          folderId: folder.id,
          name: 'Flow One',
          status: 'published',
          onlyOwnedFlows: true,
        },
        [folder.id]
      );

      expect(flows).toHaveLength(1);
      expect(flows[0].id).toBe(flowOne.id);
    });
  });

  describe('getExecutions', () => {
    let currentUser,
      currentUserRole,
      anotherUser,
      flow,
      executionOne,
      executionTwo,
      executionThree;

    beforeEach(async () => {
      currentUser = await createUser();
      currentUserRole = await currentUser.$relatedQuery('role');

      anotherUser = await createUser();

      flow = await createFlow({
        userId: currentUser.id,
        name: 'Test Flow',
      });

      const anotherUserFlow = await createFlow({
        userId: anotherUser.id,
        name: 'Another User Flow',
      });

      executionOne = await createExecution({
        flowId: flow.id,
        testRun: false,
        status: 'success',
      });

      // sleep for 10 milliseconds to make sure the created_at values are different
      await new Promise((resolve) => setTimeout(resolve, 10));

      executionTwo = await createExecution({
        flowId: flow.id,
        testRun: true,
        status: 'failure',
      });

      // sleep for 10 milliseconds to make sure the created_at values are different
      await new Promise((resolve) => setTimeout(resolve, 10));

      executionThree = await createExecution({
        flowId: anotherUserFlow.id,
        testRun: false,
        status: 'success',
      });

      await createPermission({
        action: 'read',
        subject: 'Execution',
        roleId: currentUserRole.id,
        conditions: [],
      });

      currentUser = await currentUser.$query().withGraphFetched({
        role: true,
        permissions: true,
      });
    });

    it('should return executions filtered by name', async () => {
      const executions = await currentUser.getExecutions({ name: 'Test Flow' });

      expect(executions).toHaveLength(2);

      expect(executions[0].id).toBe(executionTwo.id);
      expect(executions[1].id).toBe(executionOne.id);
    });

    it('should return executions filtered by status', async () => {
      const executions = await currentUser.getExecutions({ status: 'failure' });

      expect(executions).toHaveLength(1);
      expect(executions[0].id).toBe(executionTwo.id);
    });

    it('should return executions filtered by startDateTime and endDateTime', async () => {
      const executions = await currentUser.getExecutions({
        startDateTime: executionOne.createdAt,
        endDateTime: executionTwo.createdAt,
      });

      expect(executions).toHaveLength(2);
      expect(executions[0].id).toBe(executionTwo.id);
      expect(executions[1].id).toBe(executionOne.id);
    });

    it('should return all executions when no filter is applied', async () => {
      const executions = await currentUser.getExecutions({});

      expect(executions.length).toBeGreaterThanOrEqual(3);

      expect(executions.some((e) => e.id === executionOne.id)).toBe(true);
      expect(executions.some((e) => e.id === executionTwo.id)).toBe(true);
      expect(executions.some((e) => e.id === executionThree.id)).toBe(true);
    });

    it('should include flow and steps in the returned executions', async () => {
      const step = await createStep({
        flowId: flow.id,
        type: 'trigger',
      });

      const executions = await currentUser.getExecutions({ name: 'Test Flow' });

      expect(executions[0].flow.id).toBe(flow.id);
      expect(executions[0].flow.steps[0].id).toBe(step.id);
    });
  });

  it.todo('getApps');

  it('createAdmin should create admin with given data and mark the installation completed', async () => {
    const adminRole = await createRole({ name: 'Admin' });

    const markInstallationCompletedSpy = vi
      .spyOn(Config, 'markInstallationCompleted')
      .mockResolvedValue();

    const adminUser = await User.createAdmin({
      fullName: 'Sample admin',
      email: 'admin@flowline.example',
      password: 'sample',
    });

    expect(adminUser).toMatchObject({
      fullName: 'Sample admin',
      email: 'admin@flowline.example',
      roleId: adminRole.id,
    });

    expect(markInstallationCompletedSpy).toHaveBeenCalledOnce();
    expect(await adminUser.login('sample')).toBe(true);
  });

  describe('can', () => {
    it('should return conditions for the given action and subject of the user', async () => {
      const userRole = await createRole({ name: 'User' });

      await createPermission({
        roleId: userRole.id,
        subject: 'Flow',
        action: 'read',
        conditions: ['isCreator'],
      });

      await createPermission({
        roleId: userRole.id,
        subject: 'Connection',
        action: 'read',
        conditions: [],
      });

      const user = await createUser({ roleId: userRole.id });

      const userWithRoleAndPermissions = await user
        .$query()
        .withGraphFetched({ role: true, permissions: true });

      expect(userWithRoleAndPermissions.can('read', 'Flow')).toStrictEqual({
        isCreator: true,
      });

      expect(
        userWithRoleAndPermissions.can('read', 'Connection')
      ).toStrictEqual({});
    });

    it('should return not authorized error when the user is not permitted for the given action and subject', async () => {
      const userRole = await createRole({ name: 'User' });
      const user = await createUser({ roleId: userRole.id });

      const userWithRoleAndPermissions = await user
        .$query()
        .withGraphFetched({ role: true, permissions: true });

      expect(() => userWithRoleAndPermissions.can('read', 'Flow')).toThrowError(
        'The user is not authorized!'
      );
    });
  });

  it('lowercaseEmail should lowercase the user email', () => {
    const user = new User();
    user.email = 'USER@FLOWLINE.EXAMPLE';

    user.lowercaseEmail();

    expect(user.email).toBe('user@flowline.example');
  });

  describe('createEmptyFlow', () => {
    it('should create a flow with default name', async () => {
      const user = await createUser();
      const flow = await user.createEmptyFlow();

      expect(flow.name).toBe('Name your flow');
      expect(flow.userId).toBe(user.id);
    });

    it('should call createInitialSteps on the created flow', async () => {
      const user = await createUser();
      const createInitialStepsSpy = vi.spyOn(
        Flow.prototype,
        'createInitialSteps'
      );

      await user.createEmptyFlow();

      expect(createInitialStepsSpy).toHaveBeenCalledOnce();
    });
  });

  describe('$beforeInsert', () => {
    it('should call super.$beforeInsert', async () => {
      const superBeforeInsertSpy = vi
        .spyOn(User.prototype, '$beforeInsert')
        .mockResolvedValue();

      await createUser();

      expect(superBeforeInsertSpy).toHaveBeenCalledOnce();
    });

    it('should lowercase the user email', async () => {
      const user = await createUser({
        fullName: 'Sample user',
        email: 'USER@FLOWLINE.EXAMPLE',
      });

      expect(user.email).toBe('user@flowline.example');
    });

    it('should generate password hash', async () => {
      const user = await createUser({
        fullName: 'Sample user',
        email: 'user@flowline.example',
        password: 'sample-password',
      });

      expect(user.password).not.toBe('sample-password');
      expect(await user.login('sample-password')).toBe(true);
    });
  });

  describe('$beforeUpdate', () => {
    it('should call super.$beforeUpdate', async () => {
      const superBeforeUpdateSpy = vi
        .spyOn(User.prototype, '$beforeUpdate')
        .mockResolvedValue();

      const user = await createUser({
        fullName: 'Sample user',
        email: 'user@flowline.example',
      });

      await user.$query().patch({ fullName: 'Updated user name' });

      expect(superBeforeUpdateSpy).toHaveBeenCalledOnce();
    });

    it('should lowercase the user email if given', async () => {
      const user = await createUser({
        fullName: 'Sample user',
        email: 'user@flowline.example',
      });

      await user.$query().patchAndFetch({ email: 'NEW_EMAIL@FLOWLINE.EXAMPLE' });

      expect(user.email).toBe('new_email@flowline.example');
    });

    it('should generate password hash', async () => {
      const user = await createUser({
        fullName: 'Sample user',
        email: 'user@flowline.example',
        password: 'sample-password',
      });

      await user.$query().patchAndFetch({ password: 'new-password' });

      expect(user.password).not.toBe('new-password');
      expect(await user.login('new-password')).toBe(true);
    });
  });
});
