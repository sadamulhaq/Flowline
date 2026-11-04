import bcrypt from 'bcrypt';
import { DateTime } from 'luxon';
import { ValidationError } from 'objection';

import userAbility from '@/helpers/user-ability.js';
import createAuthTokenByUserId from '@/helpers/create-auth-token-by-user-id.js';
import Base from '@/models/base.js';
import App from '@/models/app.js';
import AccessToken from '@/models/access-token.js';
import Connection from '@/models/connection.js';
import Config from '@/models/config.js';
import Execution from '@/models/execution.js';
import Flow from '@/models/flow.js';
import Permission from '@/models/permission.js';
import Role from '@/models/role.js';
import Step from '@/models/step.js';
import Folder from '@/models/folder.js';
import NotAuthorizedError from '@/errors/not-authorized.js';

class User extends Base {
  static tableName = 'users';

  static jsonSchema = {
    type: 'object',
    required: ['fullName', 'email'],

    properties: {
      id: { type: 'string', format: 'uuid' },
      fullName: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email', minLength: 1, maxLength: 255 },
      password: { type: 'string', minLength: 6 },
      status: {
        type: 'string',
        enum: ['active', 'invited'],
        default: 'active',
      },
      resetPasswordToken: { type: ['string', 'null'] },
      resetPasswordTokenSentAt: {
        type: ['string', 'null'],
        format: 'date-time',
      },
      invitationToken: { type: ['string', 'null'] },
      invitationTokenSentAt: {
        type: ['string', 'null'],
        format: 'date-time',
      },
      trialExpiryDate: { type: 'string' },
      roleId: { type: 'string', format: 'uuid' },
      deletedAt: { type: 'string' },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' },
    },
  };

  static relationMappings = () => ({
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
  });

  get readableFlows() {
    const conditions = this.can('read', 'Flow');
    return conditions.isCreator ? this.$relatedQuery('flows') : Flow.query();
  }

  get readableSteps() {
    const conditions = this.can('read', 'Flow');
    return conditions.isCreator ? this.$relatedQuery('steps') : Step.query();
  }

  get readableConnections() {
    const conditions = this.can('read', 'Connection');
    return conditions.isCreator
      ? this.$relatedQuery('connections')
      : Connection.query();
  }

  get readableExecutions() {
    const conditions = this.can('read', 'Execution');
    return conditions.isCreator
      ? this.$relatedQuery('executions')
      : Execution.query();
  }

  get manageableConnections() {
    const conditions = this.can('manage', 'Connection');
    return conditions.isCreator
      ? this.$relatedQuery('connections')
      : Connection.query();
  }

  get ability() {
    return userAbility(this);
  }

  static async authenticate(email, password) {
    const user = await User.query().findOne({
      email: email?.toLowerCase() || null,
    });

    if (user && (await user.login(password))) {
      const token = await createAuthTokenByUserId(user.id);
      return token;
    }
  }

  async login(password) {
    return await bcrypt.compare(password, this.password);
  }

  async updatePassword({ currentPassword, password }) {
    if (await User.authenticate(this.email, currentPassword)) {
      const user = await this.$query().patchAndFetch({
        password,
      });

      return user;
    }

    throw new ValidationError({
      data: {
        currentPassword: [
          {
            message: 'is incorrect.',
          },
        ],
      },
      type: 'ValidationError',
    });
  }

  async generateHash() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async hasFolderAccess(folderId) {
    if (folderId && folderId !== 'null') {
      await this.$relatedQuery('folders').findById(folderId).throwIfNotFound();
    }

    return true;
  }

  async getFolderIds() {
    const folders = await this.$relatedQuery('folders').select('id');

    return folders.map((folder) => folder.id);
  }

  getFlows({ folderId, name, status, onlyOwnedFlows }, ownedFolderIds) {
    return this.readableFlows
      .clone()
      .withGraphFetched({
        steps: true,
      })
      .where((builder) => {
        if (name) {
          builder.where('flows.name', 'ilike', `%${name}%`);
        }

        if (status === 'published') {
          builder.where('flows.active', true);
        } else if (status === 'draft') {
          builder.where('flows.active', false);
        }

        if (onlyOwnedFlows) {
          builder.where('flows.user_id', this.id);
        }

        if (folderId === 'null') {
          builder.where((builder) => {
            builder
              .whereNull('flows.folder_id')
              .orWhereNotIn('flows.folder_id', ownedFolderIds);
          });
        } else if (folderId) {
          builder.where('flows.folder_id', folderId);
        }
      })
      .orderBy('active', 'desc')
      .orderBy('updated_at', 'desc');
  }

  getExecutions({ name, status, startDateTime, endDateTime }) {
    return this.readableExecutions
      .clone()
      .withSoftDeleted()
      .joinRelated({
        flow: true,
      })
      .withGraphFetched({
        flow: {
          steps: true,
        },
      })
      .where((builder) => {
        builder.withSoftDeleted();

        if (name) {
          builder.where('flow.name', 'ilike', `%${name}%`);
        }

        if (status === 'success') {
          builder.where('executions.status', 'success');
        } else if (status === 'failure') {
          builder.where('executions.status', 'failure');
        }

        if (startDateTime) {
          const startDate = DateTime.fromMillis(Number(startDateTime));

          if (startDate.isValid) {
            builder.where('executions.created_at', '>=', startDate.toISO());
          }
        }

        if (endDateTime) {
          const endDate = DateTime.fromMillis(Number(endDateTime));

          if (endDate.isValid) {
            builder.where('executions.created_at', '<=', endDate.toISO());
          }
        }
      })
      .orderBy('created_at', 'desc');
  }

  async getApps(name) {
    const connections = await this.readableConnections
      .clone()
      .select('connections.key')
      .where({ draft: false })
      .count('connections.id as count')
      .groupBy('connections.key');

    const flows = await this.readableFlows
      .clone()
      .withGraphJoined('steps')
      .orderBy('created_at', 'desc');

    const duplicatedUsedApps = flows
      .map((flow) => flow.steps.map((step) => step.appKey))
      .flat()
      .filter(Boolean);

    const connectionKeys = connections.map((connection) => connection.key);
    const usedApps = [...new Set([...duplicatedUsedApps, ...connectionKeys])];

    let apps = await App.findAll(name);

    apps = apps
      .filter((app) => {
        return usedApps.includes(app.key);
      })
      .map((app) => {
        const connection = connections.find(
          (connection) => connection.key === app.key
        );

        app.connectionCount = connection?.count || 0;
        app.flowCount = 0;

        flows.forEach((flow) => {
          const usedFlow = flow.steps.find((step) => step.appKey === app.key);

          if (usedFlow) {
            app.flowCount += 1;
          }
        });

        return app;
      })
      .sort((appA, appB) => appA.name.localeCompare(appB.name));

    return apps;
  }

  static async createAdmin({ email, password, fullName }) {
    const adminRole = await Role.findAdmin();

    const adminUser = await this.query().insert({
      email,
      password,
      fullName,
      roleId: adminRole.id,
    });

    await Config.markInstallationCompleted();

    return adminUser;
  }

  can(action, subject) {
    const can = this.ability.can(action, subject);

    if (!can) throw new NotAuthorizedError('The user is not authorized!');

    const relevantRule = this.ability.relevantRuleFor(action, subject);

    const conditions = relevantRule?.conditions || [];
    const conditionMap = Object.fromEntries(
      conditions.map((condition) => [condition, true])
    );

    return conditionMap;
  }

  lowercaseEmail() {
    if (this.email) {
      this.email = this.email.toLowerCase();
    }
  }

  async createEmptyFlow() {
    const flow = await this.$relatedQuery('flows').insertAndFetch({
      name: 'Name your flow',
    });

    await flow.createInitialSteps();

    return flow;
  }

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext);

    this.lowercaseEmail();
    await this.generateHash();
  }

  async $beforeUpdate(opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext);

    this.lowercaseEmail();

    await this.generateHash();
  }
}

export default User;
