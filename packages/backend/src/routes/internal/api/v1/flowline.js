import { Router } from 'express';
import { checkIsEnterprise } from '@/helpers/check-is-enterprise.js';
import versionAction from '@/controllers/internal/api/v1/flowline/version.js';
import notificationsAction from '@/controllers/internal/api/v1/flowline/notifications.js';
import infoAction from '@/controllers/internal/api/v1/flowline/info.js';
import licenseAction from '@/controllers/internal/api/v1/flowline/license.js';
import configAction from '@/controllers/internal/api/v1/flowline/config.ee.js';

const router = Router();

router.get('/version', versionAction);
router.get('/notifications', notificationsAction);
router.get('/info', infoAction);
router.get('/license', licenseAction);
router.get('/config', checkIsEnterprise, configAction);

export default router;
