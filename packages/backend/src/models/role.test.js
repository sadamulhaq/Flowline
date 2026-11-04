import { describe, it, expect, vi } from 'vitest';
import Role from '@/models/role.js';
import Base from '@/models/base.js';
import Permission from '@/models/permission.js';
import User from '@/models/user.js';
import { createRole } from '@/factories/role.js';
import { createUser } from '@/factories/user.js';

describe('Role model', () => {
  it('tableName should return correct name', () => {
    expect(Role.tableName).toBe('roles');
  });

  it('jsonSchema should have correct validations', () => {
    expect(Role.jsonSchema).toMatchSnapshot();
  });

  it('relationMappingsshould return correct associations', () => {
    const relationMappings = Role.relationMappings();

    const expectedRelations = {
      users: {
        relation: Base.HasManyRelation,
        modelClass: User,
        join: {
          from: 'roles.id',
          to: 'users.role_id',
        },
      },
      permissions: {
        relation: Base.HasManyRelation,
        modelClass: Permission,
        join: {
          from: 'roles.id',
          to: 'permissions.role_id',
        },
      },
    };

    expect(relationMappings).toStrictEqual(expectedRelations);
  });

  it('virtualAttributes should return correct attributes', () => {
    expect(Role.virtualAttributes).toStrictEqual(['isAdmin']);
  });

  describe('isAdmin', () => {
    it('should return true for admin named role', () => {
      const role = new Role();
      role.name = 'Admin';

      expect(role.isAdmin).toBe(true);
    });

    it('should return false for not admin named roles', () => {
      const role = new Role();
      role.name = 'User';

      expect(role.isAdmin).toBe(false);
    });
  });

  it('findAdmin should return admin role', async () => {
    const createdAdminRole = await createRole({ name: 'Admin' });

    const adminRole = await Role.findAdmin();

    expect(createdAdminRole).toStrictEqual(adminRole);
  });

  describe('preventAlteringAdmin', () => {
    it('preventAlteringAdmin should throw an error when altering admin role', async () => {
      const role = await createRole({ name: 'Admin' });

      await expect(() => role.preventAlteringAdmin()).rejects.toThrowError(
        'The admin role cannot be altered!'
      );
    });

    it('preventAlteringAdmin should not throw an error when altering non-admin roles', async () => {
      const role = await createRole({ name: 'User' });

      expect(await role.preventAlteringAdmin()).toBe(undefined);
    });
  });

  describe('assertNoRoleUserExists', () => {
    it('should reject with an error when the role has users', async () => {
      const role = await createRole({ name: 'User' });
      await createUser({ roleId: role.id });

      await expect(() => role.assertNoRoleUserExists()).rejects.toThrowError(
        `All users must be migrated away from the "User" role.`
      );
    });

    it('should resolve when the role does not have any users', async () => {
      const role = await createRole();

      expect(await role.assertNoRoleUserExists()).toBe(undefined);
    });
  });

  it('assertRoleIsNotUsed should call assertNoRoleUserExists', async () => {
    const role = new Role();

    const assertNoRoleUserExistsSpy = vi
      .spyOn(role, 'assertNoRoleUserExists')
      .mockResolvedValue();

    await role.assertRoleIsNotUsed();

    expect(assertNoRoleUserExistsSpy).toHaveBeenCalledOnce();
  });

  describe('$beforeDelete', () => {
    it('should call preventAlteringAdmin', async () => {
      const role = await createRole({ name: 'User' });

      const preventAlteringAdminSpy = vi
        .spyOn(role, 'preventAlteringAdmin')
        .mockResolvedValue();

      await role.$query().delete();

      expect(preventAlteringAdminSpy).toHaveBeenCalledOnce();
    });

    it('should call assertRoleIsNotUsed', async () => {
      const role = await createRole({ name: 'User' });

      const assertRoleIsNotUsedSpy = vi
        .spyOn(role, 'assertRoleIsNotUsed')
        .mockResolvedValue();

      await role.$query().delete();

      expect(assertRoleIsNotUsedSpy).toHaveBeenCalledOnce();
    });
  });
});
