import { describe, it, expect } from 'vitest';
import User from '../../src/models/user.js';
import { createUser } from '../../test/factories/user.js';
import { resetPassword } from './utils.js';

describe('resetPassword', () => {
  it('should replace the password of the matching user', async () => {
    const user = await createUser({ password: 'old-password' });

    await resetPassword(user.email.toUpperCase(), 'new-password');

    const updatedUser = await User.query().findById(user.id);
    expect(await updatedUser.login('new-password')).toBe(true);
    expect(await updatedUser.login('old-password')).toBe(false);
  });

  it('should fail for an unknown email', async () => {
    await expect(
      resetPassword('nobody@flowline.example', 'new-password')
    ).rejects.toThrow();
  });
});
