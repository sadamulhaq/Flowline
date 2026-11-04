import { describe, it, expect } from 'vitest';
import Permission from '@/models/permission.js';

describe('Permission model', () => {
  it('tableName should return correct name', () => {
    expect(Permission.tableName).toBe('permissions');
  });

  it('jsonSchema should have correct validations', () => {
    expect(Permission.jsonSchema).toMatchSnapshot();
  });
});
