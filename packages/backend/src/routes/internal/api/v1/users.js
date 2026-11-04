import { Router } from 'express';
import { authenticateUser } from '@/helpers/authentication.js';
import { authorizeUser } from '@/helpers/authorization.js';
import getCurrentUserAction from '@/controllers/internal/api/v1/users/get-current-user.js';
import updateCurrentUserAction from '@/controllers/internal/api/v1/users/update-current-user.js';
import updateCurrentUserPasswordAction from '@/controllers/internal/api/v1/users/update-current-user-password.js';
import getAppsAction from '@/controllers/internal/api/v1/users/get-apps.js';

const router = Router();

router.get('/me', authenticateUser, getCurrentUserAction);
router.patch('/:userId', authenticateUser, updateCurrentUserAction);

router.patch(
  '/:userId/password',
  authenticateUser,
  updateCurrentUserPasswordAction
);

router.get('/:userId/apps', authenticateUser, authorizeUser, getAppsAction);

export default router;
