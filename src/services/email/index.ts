const emailConfig = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  from: {
    name: process.env.FROM_NAME || 'Your Company',
    email: process.env.FROM_EMAIL || 'noreply@yourcompany.com',
  },
};

import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import fs from 'fs/promises';

class EmailService {
  private transporter: nodemailer.Transporter;
  private templatesDir: string;

  constructor() {
    this.transporter = nodemailer.createTransport(emailConfig.smtp);
    this.templatesDir = path.join(__dirname, '../../templates');
  }

  private async loadTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(this.templatesDir, `${templateName}.ejs`);
    return await fs.readFile(templatePath, 'utf-8');
  }

  private async renderTemplate(templateName: string, data: Record<string, any>): Promise<string> {
    const template = await this.loadTemplate(templateName);
    return ejs.render(template, data);
  }

  async sendEmail({
    to,
    subject,
    templateName,
    data,
    attachments = [],
  }: {
    to: string | string[];
    subject: string;
    templateName: string;
    data: Record<string, any>;
    attachments?: nodemailer.Attachment[];
  }): Promise<void> {
    try {
      const html = await this.renderTemplate(templateName, data);

      const mailOptions = {
        from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
        to: Array.isArray(to) ? to.join(',') : to,
        subject,
        html,
        attachments,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Email sending failed');
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
export default emailService;
