import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JWTPayload } from '../types';

export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtAccessExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.refreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as JWTPayload;
  } catch (err) {
    return null;
  }
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, config.refreshSecret) as JWTPayload;
  } catch (err) {
    return null;
  }
}
