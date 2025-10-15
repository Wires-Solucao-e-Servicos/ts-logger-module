import * as path from 'path';
import * as fs from 'fs';
import { Config } from '../config/config';
import { loggerEmail } from './emailService';

export class FileService {
  private _filename: string = '';
  private _initialized: boolean = false;
  private _lastEmailSent: number = 0;
  private _emailThrottleMs: number = 60000;

  constructor() {
    this.init();
  }

  set emailThrottle(ms: number) {
    this._emailThrottleMs = ms;
  }

  getFormattedDate(date: Date = new Date()): string {
    const pad = (num: number) => num.toString().padStart(2, '0');
    const d = pad(date.getDate());
    const m = pad(date.getMonth() + 1);
    const y = date.getFullYear();
    const h = pad(date.getHours());
    const min = pad(date.getMinutes());
    const s = pad(date.getSeconds());
    return `${d}/${m}/${y} ${h}:${min}:${s}`;
  }

  private init(): void {
    if (this._initialized) {
      return;
    }

    try {
      fs.mkdirSync(Config.loggerDirectory, { recursive: true });
      this._filename = path.join(Config.loggerDirectory, 'log.txt');

      const separator = '\n' + '_'.repeat(50) + '\n\n';
      const fileContent = `${separator}[${Config.clientName}] [${this.getFormattedDate()}] Logger successfully initialized.\n`;

      fs.appendFileSync(this._filename, fileContent);
      this._initialized = true;
    } catch (error) {
      console.error('Error initializing logger:', (error as Error).message);
    }
  }

  private log(level: string, code: string, module: string, text: string): void {
    if (!this._initialized) {
      console.warn('Logger not initialized. Call init() first.');
      return;
    }

    try {
      const line = `[${Config.clientName}] [${this.getFormattedDate()}] [${level}] [${code}] [${module}]: ${text}\n`;
      fs.appendFileSync(this._filename, line);
    } catch (error) {
      console.error('Logger write fail:', (error as Error).message);
    }
  }

  info(code: string, module: string, text: string): void {
    this.log('INFO', code, module, text);
  }

  async error(code: string, module: string, text: string) {
    this.log('ERROR', code, module, text);

    if (!Config.smtpEnabled) {
      return;
    }

    const now = Date.now();

    if (now - this._lastEmailSent >= this._emailThrottleMs) {
      this._lastEmailSent = now;

      if (loggerEmail.isReady) {
        await loggerEmail.sendErrorMail(code, module, text);
      }
    }
  }

  warn(code: string, module: string, text: string): void {
    this.log('WARN', code, module, text);
  }

  debug(code: string, module: string, text: string): void {
    this.log('DEBUG', code, module, text);
  }
}

export const logger = new FileService();
