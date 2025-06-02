/**
 * @fileoverview User service for managing user-related operations and authentication
 * @copyright COCO Inc. 2024
 * @author Kehinde Fasunle <kfasunle@gmail.com>
 * @see {@link https://github.com/fasunle}
 *
 * This service handles all user-related operations including:
 * - User creation and management
 * - User authentication and password verification
 * - User profile updates and deletion
 *
 * Potential improvements:
 * - Add user role management
 * - Implement email verification
 * - Add password complexity validation
 * - Implement rate limiting for authentication attempts
 * - Add session management
 * - Include user profile data management
 */

import bcrypt from 'bcrypt';
import { HTTP_NOT_FOUND, HTTP_UNAUTHENTICATED } from '@/core/common/constants';
import { throwError } from '@/core/common/error-handler';
import { generateToken } from '@/core/common/jwt';
import { AppDataSource } from '@/data-source';
import { User } from '@/entity/user.entity';

/**
 * Service class responsible for handling all user-related operations
 * including CRUD operations and authentication
 */
export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Creates a new user in the database
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<User>} Newly created user object
   */
  public async createUser(email: string, password: string) {
    const user = this.userRepository.create({
      email,
      password,
    });

    return await this.userRepository.save(user);
  }

  /**
   * Authenticates a user and generates a JWT token
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<{user: {id: string, email: string}, token: string}>} User data and authentication token
   * @throws {Error} If user not found or password is invalid
   */
  public async authenticateUser(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throwError('User not found', HTTP_NOT_FOUND);
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throwError('Invalid password', HTTP_UNAUTHENTICATED);
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return { user: { id: user.id, email: user.email }, token };
  }

  /**
   * Retrieves a user by their ID
   * @param {string} id - User's unique identifier
   * @returns {Promise<User|null>} User object if found, null otherwise
   */
  public async getUserById(id: string) {
    return await this.userRepository.findOne({ where: { id } });
  }

  /**
   * Finds a user by their email address
   * @param {string} email - User's email address
   * @returns {Promise<User|null>} User object if found, null otherwise
   */
  public async findUserByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }

  /**
   * Updates user information in the database
   * @param {string} id - User's unique identifier
   * @param {Partial<{email: string, password: string}>} updateData - Data to update
   * @returns {Promise<User>} Updated user object
   * @throws {Error} If user not found
   */
  public async updateUser(id: string, updateData: Partial<{ email: string; password: string }>) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throwError('User not found', HTTP_NOT_FOUND);
    }

    Object.assign(user, updateData);
    return await this.userRepository.save(user);
  }

  /**
   * Deletes a user from the database
   * @param {string} id - User's unique identifier
   * @returns {Promise<User>} Deleted user object
   * @throws {Error} If user not found
   */
  public async deleteUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throwError('User not found', HTTP_NOT_FOUND);
    }

    return await this.userRepository.remove(user);
  }

  /**
   * Verifies if a provided password matches the hashed password
   * @param {string} password - Plain text password to verify
   * @param {string} hashedPassword - Hashed password to compare against
   * @returns {Promise<boolean>} True if passwords match, false otherwise
   */
  public async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

export default new UserService();
