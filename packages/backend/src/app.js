import createError from 'http-errors';
import express from 'express';
import 'express-async-errors';
import cors from 'cors';

import appConfig from './config/app.js';
import corsOptions from './config/cors-options.js';
import morgan from './helpers/morgan.js';
import assetsHandler from './helpers/assets-handler.js';
import webUIHandler from './helpers/web-ui-handler.js';
import errorHandler from './helpers/error-handler.js';
import './config/orm.js';
import {
  createBullBoardHandler,
  serverAdapter,
} from '@/helpers/create-bull-board-handler.js';
import injectBullBoardHandler from '@/helpers/inject-bull-board-handler.js';
import router from '@/routes/index.js';

createBullBoardHandler(serverAdapter);

const app = express();

injectBullBoardHandler(app, serverAdapter);

assetsHandler(app);

app.use(morgan);

app.use(
  express.json({
    limit: appConfig.requestBodySizeLimit,
    verify(req, res, buf) {
      req.rawBody = buf;
    },
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: appConfig.requestBodySizeLimit,
    verify(req, res, buf) {
      req.rawBody = buf;
    },
  })
);

app.use(cors(corsOptions));

app.use('/', router);

webUIHandler(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(errorHandler);

export default app;
