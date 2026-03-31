import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
};

// Validate required env vars
if (!env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}
if (!env.DATABASE_URL && env.NODE_ENV !== 'test') {
  throw new Error('DATABASE_URL is required');
}