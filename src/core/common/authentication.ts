/**
 * @fileoverview Authentication middleware for Express.js applications
 * Provides JWT-based authentication verification for protected routes
 * @copyright COCO Inc. 2024
 * @author Kehinde Fasunle <kfasunle@gmail.com>
 * @see {@link https://github.com/fasunle}
 */

import { ExpressMiddleware } from '@/types';
import { HTTP_INTERNAL_SERVER_ERROR, HTTP_UNAUTHENTICATED } from './constants';
import { hasValidSession } from './jwt';

/**
 * Express middleware function that validates JWT authentication for protected routes.
 * Checks for valid JWT token in the Authorization header and adds user session data
 * to the request object for use in subsequent middleware and route handlers.
 *
 * @param {Request} req - Express request object containing headers and session
 * @param {Response} res - Express response object for sending HTTP responses
 * @param {NextFunction} next - Express next function to continue to next middleware
 *
 * @returns {Promise<void>} Resolves when authentication check is complete
 *
 * @throws {Error} Returns HTTP 401 if authentication fails or token is invalid
 * @throws {Error} Returns HTTP 500 if an unexpected error occurs during authentication
 *
 * @example
 * ```typescript
 * // Apply to protected routes
 * app.get('/api/protected', authenticated, (req, res) => {
 *   // Access user data via req.session.user
 *   const userId = req.session.user.id;
 *   res.json({ message: 'Access granted', userId });
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Apply to route groups
 * const protectedRouter = express.Router();
 * protectedRouter.use(authenticated);
 * protectedRouter.get('/profile', getUserProfile);
 * protectedRouter.post('/update', updateUserProfile);
 * ```
 */
export const authenticated: ExpressMiddleware = async (req, res, next) => {
  try {
    // Extract and validate JWT token from Authorization header
    const jwtPayload = hasValidSession(req.headers.authorization);

    // Check if user is authenticated via session
    if (!jwtPayload) {
      res.status(HTTP_UNAUTHENTICATED).json({
        success: false,
        message: 'Authentication required. Please login to continue.',
      });
      return;
    }

    // Add user info to request object for use in subsequent middleware/routes
    // This allows downstream handlers to access authenticated user data
    req.session.user = jwtPayload;

    // Continue to next middleware or route handler
    next();
  } catch (error) {
    // Handle any unexpected errors during authentication process
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Authentication check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
