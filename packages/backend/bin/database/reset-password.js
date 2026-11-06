import readline from 'node:readline/promises';
import process from 'process';
import logger from '../../src/helpers/logger.js';
import { resetPassword } from './utils.js';

const [email] = process.argv.slice(2);

if (!email) {
  logger.error('Usage: yarn db:reset:password <email>');
  process.exit(1);
}

const prompt = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const password = await prompt.question('New password: ');
prompt.close();

await resetPassword(email, password);
logger.info(`Password updated for ${email}.`);

process.exit(0);
