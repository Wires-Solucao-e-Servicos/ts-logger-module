import os from 'os';
import path from 'path';

import { type SMTPConfig } from '../interfaces/interfaces';

class LoggerConfigManager {
  private baseDir: string = os.homedir();
  private _clientName: string;
  private _loggerDirectory: string;

  private _smtpConfig: SMTPConfig | null = null;
  private _smtpEnabled: boolean = false;

  constructor() {
    this._clientName = process.env.CLIENT_NAME || 'Typescript Logger';
    this._loggerDirectory = path.join(this.baseDir, this._clientName);

    this.configSMTP();
  }

  private configSMTP(): void {
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

    this._smtpConfig = {
      to,
      from,
      host,
      port,
      username,
      password,
    };
    this._smtpEnabled = true;
  }

  get clientName(): string {
    return this._clientName;
  }

  set clientName(name: string) {
    this._clientName = name;

    this._loggerDirectory = path.join(this.baseDir, this._clientName);
  }

  get loggerDirectory(): string {
    return this._loggerDirectory;
  }

  set loggerDirectory(directory: string) {
    this._loggerDirectory = directory;
  }

  get smtpConfig(): SMTPConfig | null {
    return this._smtpConfig;
  }

  get smtpEnabled(): boolean {
    return this._smtpEnabled;
  }
}

export const loggerConfig = new LoggerConfigManager();
