import { Router } from 'express';

import flowlineRouter from '@/routes/internal/api/v1/flowline.js';
import accessTokensRouter from '@/routes/internal/api/v1/access-tokens.js';
import usersRouter from '@/routes/internal/api/v1/users.js';
import flowsRouter from '@/routes/internal/api/v1/flows.js';
import stepsRouter from '@/routes/internal/api/v1/steps.js';
import appsRouter from '@/routes/internal/api/v1/apps.js';
import connectionsRouter from '@/routes/internal/api/v1/connections.js';
import executionsRouter from '@/routes/internal/api/v1/executions.js';
import installationUsersRouter from '@/routes/internal/api/v1/installation/users.js';
import foldersRouter from '@/routes/internal/api/v1/folders.js';

const router = Router();

router.use('/v1/flowline', flowlineRouter);
router.use('/v1/access-tokens', accessTokensRouter);
router.use('/v1/users', usersRouter);
router.use('/v1/apps', appsRouter);
router.use('/v1/connections', connectionsRouter);
router.use('/v1/flows', flowsRouter);
router.use('/v1/steps', stepsRouter);
router.use('/v1/executions', executionsRouter);
router.use('/v1/installation/users', installationUsersRouter);
router.use('/v1/folders', foldersRouter);

export default router;
