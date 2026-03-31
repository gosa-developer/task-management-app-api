import jwt, { SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms'; // ✅ important
import { env } from '../config/env';
import { JWTPayload } from '../types';

export const generateToken = (payload: JWTPayload): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as StringValue,
  };

  return jwt.sign(payload, env.JWT_SECRET as string, options);
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, env.JWT_SECRET as string) as JWTPayload;
};