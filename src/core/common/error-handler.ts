/**
 * @file error-handler.ts
 * @description Error handling utilities and middleware for the application
 * @company Coco
 * @author Kehinde Fasunle
 * @see {@link https://github.com/fasunle}
 */

//
import { ErrorMiddleware } from '@/types';
import {
  AUTHENTICATION_ERROR,
  HTTP_BAD_REQUEST,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_UNAUTHENTICATED,
  VALIDATION_ERROR,
} from './constants';

/**
 * @class AppError
 * @extends Error
 * @description Custom error class for application-specific errors
 */
export class AppError extends Error {
  /**
   * @constructor
   * @param {string} message - Error message
   * @param {string} name - Error name/type
   * @param {number} [statusCode] - HTTP status code
   * @param {any} [data] - Additional error data
   */
  constructor(
    public message: string,
    public name: string,
    public statusCode?: number,
    public data?: any
  ) {
    super(message);
    this.name = name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * @function throwError
 * @description Generic error throwing utility
 * @param {string} message - Error message
 * @param {number} [statusCode=HTTP_BAD_REQUEST] - HTTP status code
 * @param {string} [name="AppError"] - Error name/type
 * @param {any} [data] - Additional error data
 * @throws {AppError}
 */
export const throwError = (
  message: string,
  statusCode: number = HTTP_BAD_REQUEST,
  name: string = 'AppError',
  data?: any
): never => {
  throw new AppError(message, name, statusCode, data);
};

/**
 * @function throwValidationError
 * @description Throws a validation error
 * @param {string} message - Validation error message
 * @param {any} [data] - Additional validation error data
 * @throws {AppError}
 */
export const throwValidationError = (message: string, data?: any): never => {
  throw new AppError(message, VALIDATION_ERROR, HTTP_BAD_REQUEST, data);
};

/**
 * @function throwAuthenticationError
 * @description Throws an authentication error
 * @param {string} [message="Authentication failed"] - Authentication error message
 * @throws {AppError}
 */
export const throwAuthenticationError = (message: string = 'Authentication failed'): never => {
  throw new AppError(message, AUTHENTICATION_ERROR, HTTP_UNAUTHENTICATED);
};

/**
 * @function throwInternalError
 * @description Throws an internal server error
 * @param {string} [message="Internal Server Error"] - Internal error message
 * @throws {AppError}
 */
export const throwInternalError = (message: string = 'Internal Server Error'): never => {
  throw new AppError(message, 'INTERNAL_ERROR', HTTP_INTERNAL_SERVER_ERROR);
};

/**
 * @function errorHandler
 * @description Global error handling middleware
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const errorHandler: ErrorMiddleware = (err, req, res, next) => {
  const stack = process.env.NODE_ENV === 'development' ? err : undefined;
  // Handle specific error types
  if (err.name === VALIDATION_ERROR) {
    res.status(HTTP_BAD_REQUEST).json({
      error: err.message || 'Validation failed',
      stack,
    });
  }

  // Handle other error types as needed
  if (err.name === AUTHENTICATION_ERROR) {
    res.status(HTTP_UNAUTHENTICATED).json({ error: 'Authentication failed' });
  }

  // Default error handler
  console.error(err.stack); // Log the error for debugging

  res.status(HTTP_INTERNAL_SERVER_ERROR).json({
    error: 'Internal Server Error',
    stack,
  });
};
export default errorHandler;
