import logger from '@/helpers/logger.js';
import mailer from '@/helpers/mailer.ee.js';
import compileEmail from '@/helpers/compile-email.ee.js';
import appConfig from '@/config/app.js';

export const sendEmailJob = async (job) => {
  const { email, subject, template, params } = job.data;

  if (isCloudSandbox() && !isFlowlineEmail(email)) {
    logger.info(
      'Only Flowline emails are allowed for non-production environments!'
    );

    return;
  }

  await mailer.sendMail({
    to: email,
    from: appConfig.fromEmail,
    subject: subject,
    html: compileEmail(template, params),
  });
};

const isCloudSandbox = () => {
  return appConfig.isCloud && !appConfig.isProd;
};

const isFlowlineEmail = (email) => {
  return email.endsWith('@flowline.example');
};
