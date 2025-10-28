import * as fs from 'fs';
import * as path from 'path';

import { loggerConfig as Config } from '../config/config';
import { loggerMailer as Mailer } from './emailService';

export class FileService {
  private _filename: string = '';
  private _initialized: boolean = false;
  private _lastEmailSent: number = 0;

  constructor() {
    this.init();
  }

  private getFormattedDate(date: Date = new Date()): string {
    const pad = (num: number) => num.toString().padStart(2, '0');
    const d = pad(date.getDate());
    const m = pad(date.getMonth() + 1);
    const y = date.getFullYear();
    const h = pad(date.getHours());
    const min = pad(date.getMinutes());
    const s = pad(date.getSeconds());
    return `${d}/${m}/${y} ${h}:${min}:${s}`;
  }

  private rotateLogFiles(): void {
    try {
      const files = fs.readdirSync(Config.directory);

      const logFiles = files
        .filter((file) => file.toLowerCase().endsWith('.txt'))
        .map((file) => ({
          name: file,
          path: path.join(Config.directory, file),
          mtime: fs.statSync(path.join(Config.directory, file)).mtime.getTime(),
        }))
        .sort((a, b) => b.mtime - a.mtime);

      if (logFiles.length > Config.maxFilecount) {
        const filesToDelete = logFiles.slice(Config.maxFilecount);

        filesToDelete.forEach((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (error) {
            console.error(`failed to delete log file ${file.name}:`, (error as Error).message);
          }
        });
      }
    } catch (error) {
      console.error('logger cleanup fail:', (error as Error).message);
    }
  }

  private init(): void {
    if (this._initialized) {
      return;
    }

    try {
      this.rotateLogFiles();

      fs.mkdirSync(Config.directory, { recursive: true });
      this._filename = path.join(Config.directory, Config.filename);

      const separator = '\n' + '_'.repeat(50) + '\n\n';
      const fileContent = `${separator}[${Config.clientName}] [${this.getFormattedDate()}] Logger successfully initialized.\n`;

      fs.appendFileSync(this._filename, fileContent);
      this._initialized = true;
    } catch (error) {
      console.error('error initializing logger:', (error as Error).message);
    }
  }

  private log(level: string, code: string, module: string, text: string): void {
    if (!this._initialized) {
      console.warn('logger not initialized. Call init() first.');
      return;
    }

    try {
      const line = `[${Config.clientName}] [${this.getFormattedDate()}] [${level}] [${code}] [${module}]: ${text}\n`;
      fs.appendFileSync(this._filename, line);
    } catch (error) {
      console.error('logger write fail:', (error as Error).message);
    }
  }

  info(code: string, module: string, text: string): void {
    this.log('INFO', code, module, text);
  }

  error(code: string, module: string, text: string): void {
    this.log('ERROR', code, module, text);

    if (!Config.smtpEnabled) {
      return;
    }

    const now = Date.now();

    if (now - this._lastEmailSent >= Config.throttle) {
      this._lastEmailSent = now;

      if (Mailer.isReady) {
        Mailer.sendErrorMail(code, module, text).catch((error) => console.error('logger failed to send error email:', (error as Error).message));
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

const loggerInstance = new FileService();

(loggerInstance as any).config = Config;
(loggerInstance as any).mailer = Mailer;

export const logger = loggerInstance as typeof loggerInstance & {
  config: typeof Config;
  mailer: typeof Mailer;
};
