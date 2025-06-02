/**
 * @file jwt.ts
 * @description JWT authentication utilities for managing tokens and session validation
 * @company Coco
 * @author Kehinde Fasunle
 * @see https://github.com/fasunle
 */

//
import jwt from 'jsonwebtoken';
import { JWTPayload } from 'types';

/**
 * Secret key for JWT token generation and verification
 * @constant {string}
 */
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Token expiration time
 * @constant {string}
 */
const TOKEN_EXPIRATION = '24h';

/**
 * Generates a JWT token with the provided payload
 * @param {JWTPayload} payload - The data to be encoded in the token
 * @returns {string} The generated JWT token
 */
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
};

/**
 * Verifies a JWT token and returns the decoded payload
 * @param {string} token - The JWT token to verify
 * @returns {JWTPayload | null} The decoded payload if valid, null otherwise
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Validates a session using the Authorization header
 * @param {string} [authHeader] - The Authorization header containing the Bearer token
 * @returns {JWTPayload | null} The decoded payload if session is valid, null otherwise
 */
export const hasValidSession = (authHeader?: string): JWTPayload | null => {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return null;
  }

  return verifyToken(token);
};
