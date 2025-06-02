/**
 * @fileoverview Authentication service for managing user authentication operations
 * @copyright COCO Inc. 2024
 * @author Kehinde Fasunle <kfasunle@gmail.com>
 * @see {@link https://github.com/fasunle}
 */

import { User } from '@/entity/user.entity';
import { UserService } from '../user';
import { HTTP_BAD_REQUEST, HTTP_NOT_FOUND, HTTP_UNAUTHENTICATED } from '@/core/common/constants';
import { throwError } from '@/core/common/error-handler';
import { hashPassword } from '@/core/common/bcrypt';

/**
 * Service class responsible for handling all authentication-related operations
 * including login, signup, password management and verification
 */
export class AuthService {
  constructor(private userService: UserService) {
    this.userService = userService;
  }

  /**
   * Authenticates a user with their email and password
   * @param {string} email - The user's email address
   * @param {string} password - The user's password
   * @returns {Promise<User | null>} The authenticated user object or null
   * @throws {Error} If authentication fails or user not found
   */
  async login(email: string, password: string): Promise<User | null> {
    try {
      // Database logic moved to DatabaseService
      // This will verify credentials and return user data
      const user = await this.userService.findUserByEmail(email);

      if (!user) {
        throwError('User not found', HTTP_NOT_FOUND);
      }

      // Password verification should be done using bcrypt
      const isValidPassword = await this.userService.verifyPassword(password, user.password);

      if (!isValidPassword) {
        throwError('Invalid password', HTTP_UNAUTHENTICATED);
      }

      return user;
    } catch (error) {
      throwError(`Login failed: ${error.message}`, HTTP_UNAUTHENTICATED);
    }
  }

  /**
   * Creates a new user account
   * @param {Object} userData - The user registration data
   * @param {string} userData.email - User's email address
   * @param {string} userData.password - User's password
   * @param {string} userData.name - User's name
   * @returns {Promise<User>} The newly created user object
   * @throws {Error} If user already exists or signup fails
   */
  async signup(userData: {
    email: string;
    password: string;
    name: string;
    // Add other required fields
  }): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.userService.findUserByEmail(userData.email);

      if (existingUser) {
        throwError('User already exists', HTTP_BAD_REQUEST);
      }

      // Create new user in database
      const newUser = await this.userService.createUser(userData.email, userData.password);

      return newUser;
    } catch (error) {
      throwError(`Signup failed: ${error.message}`, HTTP_BAD_REQUEST);
    }
  }

  /**
   * Changes a user's password after verifying their current password
   * @param {string} userId - The ID of the user
   * @param {string} currentPassword - The user's current password
   * @param {string} newPassword - The new password to set
   * @returns {Promise<boolean>} True if password change is successful
   * @throws {Error} If current password is invalid or user not found
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      // Verify current password
      const user = await this.userService.getUserById(userId);

      if (!user) {
        throwError('User not found', HTTP_NOT_FOUND);
      }

      const isValidPassword = await this.userService.verifyPassword(currentPassword, user.password);

      if (!isValidPassword) {
        throwError('Current password is incorrect', HTTP_UNAUTHENTICATED);
      }

      const password = await hashPassword(newPassword);

      // Update password in database
      await this.userService.updateUser(userId, { password });

      return true;
    } catch (error) {
      throwError(`Password change failed: ${error.message}`, HTTP_BAD_REQUEST);
    }
  }

  /**
   * Verifies if the provided password matches the user's stored password
   * @param {string} email - The user's email address
   * @param {string} password - The password to verify
   * @returns {Promise<boolean>} True if password is valid
   * @throws {Error} If user not found or verification fails
   */
  async confirmPassword(email: string, password: string): Promise<boolean> {
    try {
      const user = await this.userService.findUserByEmail(email);

      if (!user) {
        throwError('User not found', HTTP_NOT_FOUND);
      }

      // Verify password
      const isValidPassword = await this.userService.verifyPassword(password, user.password);

      return isValidPassword;
    } catch (error) {
      throwError(`Password confirmation failed: ${error.message}`, HTTP_BAD_REQUEST);
    }
  }
}
