import * as fs from 'fs';
import * as path from 'path';
import * as fsp from 'fs/promises';

import { loggerConfig as Config } from '../config/config';
import { loggerMailer as Mailer } from './emailService';

export class FileService {
  private _filename: string = '';
  private _initialized: boolean = false;

  private _currentDay: number = 0;
  private _lastEmailSent: number = 0;

  constructor() {
    this.initLogger();
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

  private formatFilename(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    this._currentDay = now.getDate();
    return `log-${year}-${month}-${day}.txt`;
  }

  private async rotate(): Promise<void> {
    try {
      const files = await fsp.readdir(Config.directory);

      const logFilesPromises = files
        .filter((file) => file.endsWith('.txt'))
        .map(async (file) => {
          const filePath = path.join(Config.directory, file);
          const stats = await fsp.stat(filePath);
          return {
            name: file,
            path: filePath,
            mtime: stats.mtime.getTime(),
          };
        });

      const logFiles = (await Promise.all(logFilesPromises)).sort((a, b) => b.mtime - a.mtime);

      if (logFiles.length > Config.maxFilecount) {
        const filesToDelete = logFiles.slice(Config.maxFilecount);

        await Promise.allSettled(
          filesToDelete.map(async (file) => {
            try {
              await fsp.unlink(file.path);
            } catch (error) {
              console.error(`failed to delete log file ${file.name}:`, (error as Error).message);
            }
          })
        );
      }
    } catch (error) {
      console.error('logger cleanup fail:', (error as Error).message);
    }
  }

  private checkRotation() {
    const today = new Date().getDate();

    if (today === this._currentDay) {
      return;
    }

    try {
      fs.mkdirSync(Config.directory, { recursive: true });
      this._filename = path.join(Config.directory, this.formatFilename());

      const separator = '\n' + '_'.repeat(50) + '\n\n';
      const fileContent = `${separator}[${Config.clientName}] [${this.getFormattedDate()}] Logger successfully initialized.\n`;

      fs.appendFileSync(this._filename, fileContent);

      this.rotate().catch((error) => console.error('error rotating logger: ', error));
    } catch (error) {
      console.error('error checking logger rotation:', error);
    }
  }

  private initLogger(): void {
    if (this._initialized) {
      return;
    }

    try {
      const newFilename = this.formatFilename();

      fs.mkdirSync(Config.directory, { recursive: true });
      this._filename = path.join(Config.directory, newFilename);

      const separator = '\n' + '_'.repeat(50) + '\n\n';
      const fileContent = `${separator}[${Config.clientName}] [${this.getFormattedDate()}] Logger successfully initialized.\n`;

      fs.appendFileSync(this._filename, fileContent);
      this._initialized = true;
    } catch (error) {
      console.error('[critical] error initializing logger:', (error as Error).message);
    }
  }

  private log(level: string, code: string, module: string, text: string): void {
    if (!this._initialized) {
      console.warn('[warning] logger not initialized. skipping log');
      return;
    }

    this.checkRotation();

    try {
      const line = `[${Config.clientName}] [${this.getFormattedDate()}] [${level}] [${code}] [${module}]: ${text}\n`;
      fs.appendFileSync(this._filename, line);

      if (Config.console) {
        console.log(line);
      }
    } catch (error) {
      console.error('[error] logger write fail:', (error as Error).message);
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
        Mailer.sendErrorMail(code, module, text).catch((error) =>
          console.warn('[warning] logger failed to send error email:', (error as Error).message)
        );
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
