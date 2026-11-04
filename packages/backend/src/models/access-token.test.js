import { describe, it, expect } from 'vitest';
import AccessToken from '@/models/access-token.js';
import User from '@/models/user.js';
import Base from '@/models/base.js';
import { createAccessToken } from '@/factories/access-token.js';

describe('AccessToken model', () => {
  it('tableName should return correct name', () => {
    expect(AccessToken.tableName).toBe('access_tokens');
  });

  it('jsonSchema should have correct validations', () => {
    expect(AccessToken.jsonSchema).toMatchSnapshot();
  });

  it('relationMappings should return correct associations', () => {
    const relationMappings = AccessToken.relationMappings();

    const expectedRelations = {
      user: {
        relation: Base.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'access_tokens.user_id',
          to: 'users.id',
        },
      },
    };

    expect(relationMappings).toStrictEqual(expectedRelations);
  });

  it('revoke should set revokedAt', async () => {
    const accessToken = await createAccessToken();

    await accessToken.revoke();

    expect(accessToken.revokedAt).not.toBeUndefined();
  });
});
