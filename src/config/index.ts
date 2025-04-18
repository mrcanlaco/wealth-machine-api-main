import dotenv from 'dotenv';

dotenv.config();

export const config = {
  email: {
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'Team',
  },
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  // Add other configuration sections as needed
};
