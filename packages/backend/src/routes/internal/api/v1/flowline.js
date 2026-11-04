import { Router } from 'express';
import versionAction from '@/controllers/internal/api/v1/flowline/version.js';
import notificationsAction from '@/controllers/internal/api/v1/flowline/notifications.js';
import infoAction from '@/controllers/internal/api/v1/flowline/info.js';

const router = Router();

router.get('/version', versionAction);
router.get('/notifications', notificationsAction);
router.get('/info', infoAction);

export default router;
