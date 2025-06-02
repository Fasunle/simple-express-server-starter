/**
 * @fileoverview Type definitions and interfaces for Express.js application
 * Provides TypeScript types for request handlers, middleware, and authentication
 * @copyright COCO Inc. 2024
 * @author Kehinde Fasunle <kfasunle@gmail.com>
 * @see {@link https://github.com/fasunle}
 */

//
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      session: {
        user: AuthUser | JWTPayload | null;
      };
    }
  }
}

/**
 * Interface defining the structure of JWT payload data.
 * Contains user identification and authorization information.
 */
export interface JWTPayload {
  userId: string;
  email: string;
  roles?: string[];
  tenantId?: string;
}

/**
 * Enum defining the available user roles in the system.
 * Used for role-based access control (RBAC).
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MANAGER = 'manager',
}

/**
 * Interface defining the structure of authenticated user data.
 * Used to type-check user information throughout the application.
 */
export interface AuthUser {
  id: string;
  roles: UserRole[];
  tenantId?: string;
}

/**
 * Type definition for Express middleware functions.
 * Handles request processing and can be async or synchronous.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void | Promise<void>} Nothing or a Promise that resolves to nothing
 *
 * @example
 *
 * const loggerMiddleware: ExpressMiddleware = (req, res, next) => {
 *   console.log(`${req.method} ${req.path}`);
 *   next();
 * };
 *
 */
export type ExpressMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Type definition for Express error handling middleware.
 * Processes errors that occur during request handling.
 *
 * @param {Error} err - Error object that was thrown
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void | Promise<void>} Nothing or a Promise that resolves to nothing
 *
 * @example
 *
 * const errorHandler: ErrorMiddleware = (err, req, res, next) => {
 *   res.status(500).json({ error: err.message });
 * };
 *
 */
export type ErrorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Type definition for Express request handlers with optional generic type.
 * Handles specific route logic with typed request parameters.
 *
 * @template T - Type for request parameters/body
 * @param {Request<T>} req - Express request object with generic type
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void | Promise<void>} Nothing or a Promise that resolves to nothing
 *
 * @example
 *
 * interface CreateUserBody { name: string; email: string; }
 * const createUser: RequestHandler<CreateUserBody> = (req, res) => {
 *   const { name, email } = req.body;
 *   // Handle user creation
 * };
 *
 */
export type RequestHandler<T = any> = (
  req: Request<T>,
  res: Response,
  next: NextFunction
) => void | Promise<void>;
