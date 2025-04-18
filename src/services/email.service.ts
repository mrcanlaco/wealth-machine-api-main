import nodemailer from 'nodemailer';
import { config } from '@/config';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  async sendInvitation(
    to: string,
    invitedBy: string,
    machineName: string,
    invitationLink: string
  ): Promise<void> {
    const html = `
      <h2>You've been invited to join ${machineName}</h2>
      <p>${invitedBy} has invited you to join their wealth management machine.</p>
      <p>Click the link below to accept the invitation:</p>
      <a href="${invitationLink}" style="
        display: inline-block;
        background-color: #4CAF50;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
      ">Accept Invitation</a>
      <p>This invitation will expire in 7 days.</p>
      <p>If you don't want to join, you can safely ignore this email.</p>
    `;

    await this.transporter.sendMail({
      from: `"Wealth Machine" <${config.email.from}>`,
      to,
      subject: `Invitation to join ${machineName}`,
      html,
    });
  }

  async sendInvitationAccepted(
    to: string,
    acceptedBy: string,
    machineName: string
  ): Promise<void> {
    const html = `
      <h2>Invitation Accepted</h2>
      <p>${acceptedBy} has accepted your invitation to join ${machineName}.</p>
      <p>They now have access to the machine based on the role you assigned.</p>
    `;

    await this.transporter.sendMail({
      from: `"Wealth Machine" <${config.email.from}>`,
      to,
      subject: `${acceptedBy} joined ${machineName}`,
      html,
    });
  }

  async sendUserRemoved(
    to: string,
    removedBy: string,
    machineName: string
  ): Promise<void> {
    const html = `
      <h2>Access Removed</h2>
      <p>${removedBy} has removed your access to ${machineName}.</p>
      <p>You no longer have access to this machine.</p>
    `;

    await this.transporter.sendMail({
      from: `"Wealth Machine" <${config.email.from}>`,
      to,
      subject: `Access removed from ${machineName}`,
      html,
    });
  }

  async sendInvitationRejectedEmail(
    to: string,
    machineName: string
  ): Promise<void> {
    const mailOptions = {
      from: config.email.from,
      to,
      subject: `Lời mời tham gia ${machineName} đã bị từ chối`,
      html: `
        <h2>Lời mời tham gia ${machineName} đã bị từ chối</h2>
        <p>Xin chào,</p>
        <p>Lời mời tham gia máy ${machineName} đã bị từ chối.</p>
        <p>Nếu bạn nghĩ đây là một sự nhầm lẫn, vui lòng liên hệ với người quản lý máy.</p>
        <p>Trân trọng,<br>Wealth Machine Team</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export const emailService = new EmailService();
