import os from 'os';
import path from 'path';

import { type SMTPConfig } from '../interfaces/interfaces';

class LoggerConfigManager {
  private _console: boolean = true;

  private _clientName: string;

  private baseDir: string = os.homedir();
  private _loggerDirectory: string;

  private _smtpConfig: SMTPConfig | null = null;
  private _smtpEnabled: boolean = false;
  private _smtpDebug: boolean = false;
  private _emailThrottleMs: number = 60000;

  private _maxFilecount: number = 30;

  constructor() {
    this._clientName = process.env.CLIENT_NAME || 'Typescript Logger';
    this._loggerDirectory = path.join(this.baseDir, this._clientName);

    this.initConfig();
  }

  private initConfig(): void {
    const to = process.env.SMTP_TO;
    const from = process.env.SMTP_FROM;
    const host = process.env.SMTP_HOST;
    const portStr = process.env.SMTP_PORT;
    const username = process.env.SMTP_USERNAME;
    const password = process.env.SMTP_PASSWORD;

    if (!to || !from || !host || !portStr || !username || !password) {
      console.warn('SMTP disabled: missing configuration.');
      this._smtpEnabled = false;
      return;
    }

    const port = parseInt(portStr);
    if (isNaN(port) || port <= 0 || port > 65535) {
      console.warn(`SMTP disabled: invalid port "${portStr}".`);
      this._smtpEnabled = false;
      return;
    }

    const secure = port === 465 ? true : false;

    this._smtpConfig = {
      to,
      from,
      host,
      port,
      username,
      password,
      secure,
    };
    this._smtpEnabled = true;
  }

  get console(): boolean {
    return this._console;
  }

  set console(status: boolean) {
    this._console = status;
  }

  get clientName(): string {
    return this._clientName;
  }

  set clientName(name: string) {
    this._clientName = name;

    this._loggerDirectory = path.join(this.baseDir, this._clientName);
  }

  get directory(): string {
    return this._loggerDirectory;
  }

  set directory(directory: string) {
    this._loggerDirectory = directory;
  }

  get smtpConfig(): SMTPConfig | null {
    return this._smtpConfig;
  }

  get smtpEnabled(): boolean {
    return this._smtpEnabled;
  }

  set debug(status: boolean) {
    this._smtpDebug = status;
  }

  get debug(): boolean {
    return this._smtpDebug;
  }

  set maxFilecount(count: number) {
    this._maxFilecount = count;
  }

  get maxFilecount(): number {
    return this._maxFilecount;
  }

  set throttle(ms: number) {
    this._emailThrottleMs = ms;
  }

  get throttle(): number {
    return this._emailThrottleMs;
  }
}

export const loggerConfig = new LoggerConfigManager();
