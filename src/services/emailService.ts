import nodemailer from 'nodemailer';
import { loggerConfig as Config } from '../config/config';

export class EmailService {
  private _smtpReady: boolean = false;
  private _transporter: nodemailer.Transporter | undefined = undefined;

  constructor() {
    this.initSMTP();
  }

  get isReady(): boolean {
    return this._smtpReady;
  }

  private initSMTP() {
    if (!Config.smtpEnabled) {
      console.error('Failed to initialize: SMTP is currently disabled.');
      return;
    }

    if (Config.smtpConfig === null) {
      console.error('Failed to initialize: missing SMTP configuration.');
      return;
    }

    try {
      this._transporter = nodemailer.createTransport({
        host: Config.smtpConfig.host,
        port: Config.smtpConfig.port,
        secure: true,
        auth: {
          user: Config.smtpConfig.username,
          pass: Config.smtpConfig.password,
        },
        // debug: true,
        // logger: true,
      });

      this._smtpReady = true;
    } catch (error) {
      console.error(`Failed to initialize: ${(error as Error).message}`);
      this._smtpReady = false;
    }
  }

  async sendErrorMail(errorCode: string, module: string, errorMessage: string) {
    if (!this._smtpReady || !this._transporter || !Config.smtpConfig) {
      console.error('Failed to send error email: SMTP not configured.');
      return;
    }

    const emailContent = {
      from: `"${Config.clientName}" <${Config.smtpConfig.from}>`,
      to: Config.smtpConfig.to,
      subject: `[${Config.clientName}] Error Alert - ${errorCode}`,
      html: `
          <h2>Error Report</h2>
          <p><strong>Client:</strong> ${Config.clientName}</p>
          <p><strong>Error Code:</strong> ${errorCode}</p>
          <p><strong>Module:</strong> ${module}</p>
          <p><strong>Error Message:</strong>${errorMessage}</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          <hr>
        `,
    };

    try {
      await this._transporter.sendMail(emailContent);
      return;
    } catch (error) {
      console.error(`Failed to send error email: ${(error as Error).message}`);
      return;
    }
  }

  async sendCustomMail(to: string, subject: string, htmlContent: string) {
    if (!this._smtpReady || !this._transporter || !Config.smtpConfig) {
      console.error('Failed to send custom email: SMTP not configured.');
      return;
    }

    const emailContent = {
      from: `"${Config.clientName}" <${Config.smtpConfig.from}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    try {
      await this._transporter.sendMail(emailContent);
      return;
    } catch (error) {
      console.error(`Failed to send custom email: ${(error as Error).message}`);
      return;
    }
  }
}

export const loggerMailer = new EmailService();
