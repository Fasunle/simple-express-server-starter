/**
 * Authorization utilities for handling role-based access control and tenant-based access control.
 * This module provides middleware functions for Express.js to protect routes based on user roles
 * and tenant membership.
 * @module authorization
 */

import { Request, Response, NextFunction } from 'express';
import { AuthUser, UserRole } from 'types';
import { HTTP_FORBIDDEN, HTTP_UNAUTHENTICATED } from './constants';

/**
 * Creates a middleware that checks if the authenticated user has any of the specified roles.
 * @param {UserRole[]} roles - Array of roles to check against
 * @returns {Function} Express middleware function
 * @example
 * // Protect a route with role-based access control
 * router.get('/admin-only', hasRole([UserRole.ADMIN]), (req, res) => {
 *   res.json({ message: 'Admin access granted' });
 * });
 */
export const hasRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req?.session?.user as AuthUser;

    if (!user) {
      return res
        .status(HTTP_UNAUTHENTICATED)
        .json({ message: 'Unauthorized - User not authenticated' });
    }

    const hasRequiredRole = user.roles.some(role => roles.includes(role));

    if (!hasRequiredRole) {
      return res.status(HTTP_FORBIDDEN).json({ message: 'Forbidden - Insufficient permissions' });
    }

    next();
  };
};

/**
 * Creates a middleware that verifies if the authenticated user belongs to the requested tenant.
 * Checks tenant ID from either request parameters or request body.
 * @returns {Function} Express middleware function
 * @example
 * // Protect a route with tenant-based access control
 * router.get('/tenant/:tenantId/data', belongsToTenant(), (req, res) => {
 *   res.json({ message: 'Tenant access granted' });
 * });
 */
export const belongsToTenant = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req?.session?.user;
    const requestedTenantId = req.params.tenantId || req.body.tenantId;

    if (!user) {
      return res
        .status(HTTP_UNAUTHENTICATED)
        .json({ message: 'Unauthorized - User not authenticated' });
    }

    if (!user.tenantId || user.tenantId !== requestedTenantId) {
      return res.status(HTTP_FORBIDDEN).json({ message: 'Forbidden - Invalid tenant access' });
    }

    next();
  };
};

/**
 * Creates a middleware that checks if the user has admin, manager, or user role.
 * @returns {Function} Express middleware function
 * @example
 * // Protect a route for admin access
 * router.post('/admin/settings', isAdmin(), (req, res) => {
 *   res.json({ message: 'Admin settings updated' });
 * });
 */
export const isAdmin = () => hasRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER]);

/**
 * Creates a middleware that checks if the user has manager or user role.
 * @returns {Function} Express middleware function
 * @example
 * // Protect a route for manager access
 * router.put('/manager/tasks', isManager(), (req, res) => {
 *   res.json({ message: 'Manager tasks updated' });
 * });
 */
export const isManager = () => hasRole([UserRole.MANAGER, UserRole.USER]);

/**
 * Creates a middleware that checks if the user has user role.
 * @returns {Function} Express middleware function
 * @example
 * // Protect a route for user access
 * router.get('/user/profile', isUser(), (req, res) => {
 *   res.json({ message: 'User profile accessed' });
 * });
 */
export const isUser = () => hasRole([UserRole.USER]);

/**
 * Combines multiple middleware functions into a single middleware that executes them in sequence.
 * If any middleware fails, the chain is broken and the error is passed to the next error handler.
 * @param {...Function} middlewares - Array of middleware functions to execute
 * @returns {Function} Express middleware function
 * @example
 * // Combine multiple authorization checks
 * router.post('/protected',
 *   authorizeMultiple(
 *     isAdmin(),
 *     belongsToTenant()
 *   ),
 *   (req, res) => {
 *     res.json({ message: 'Access granted' });
 *   }
 * );
 */
export const authorizeMultiple = (
  ...middlewares: Array<(req: Request, res: Response, next: NextFunction) => void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const executeMiddleware = (index: number) => {
      if (index === middlewares.length) {
        return next();
      }
      //
      middlewares[index](req, res, (err?: any) => {
        if (err) {
          return next(err);
        }
        executeMiddleware(index + 1);
      });
    };

    executeMiddleware(0);
  };
};
