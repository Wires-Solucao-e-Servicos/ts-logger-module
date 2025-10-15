import dotenv from 'dotenv';
import { logger } from './services/fileService';

dotenv.config();

logger.info('TEST', 'TEST', 'This is a logger test.');
logger.error('ERROR', 'ERROR', 'This is an error test.');
