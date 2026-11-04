import { Router } from 'express';
import webhooksRouter from '@/routes/webhooks.js';
import healthcheckRouter from '@/routes/healthcheck.js';
import internalApiRouter from '@/routes/internal/api/index.js';

const router = Router();

router.use('/webhooks', webhooksRouter);
router.use('/healthcheck', healthcheckRouter);
router.use('/internal/api', internalApiRouter);

export default router;
