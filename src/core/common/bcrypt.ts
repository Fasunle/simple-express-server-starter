//
/**
 * @fileoverview Bcrypt utility functions for password hashing and verification.
 * This module provides both synchronous and asynchronous methods for password hashing
 * and verification using the bcrypt algorithm.
 *
 * @module bcrypt
 * @company Coco
 * @author Kehinde Fasunle <kfasunle@gmail.com>
 * @see {@link https://github.com/fasunle}
 * @see {@link https://github.com/fasunle}
 */

import * as bcrypt from 'bcrypt';
import { throwError } from './error-handler';
import { HTTP_INTERNAL_SERVER_ERROR } from './constants';

const SALT_ROUNDS = 10;

/**
 * Hashes a plain text password using bcrypt (async).
 * @async
 * @param {string} password - The plain text password to hash.
 * @returns {Promise<string>} A promise that resolves to the hashed password.
 * @throws {Error} If there's an error during the hashing process.
 * @example
 * // Import the hashPassword function
 * import { hashPassword } from '@core/common/bcrypt';
 *
 * async function createUser() {
 *   const plainPassword = "mySecurePassword123";
 *   try {
 *     const hashedPassword = await hashPassword(plainPassword);
 *     // hashedPassword: "$2b$10$..."
 *     // Store the hashedPassword in your database
 *   } catch (error) {
 *     // Handle error
 *   }
 * }
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throwError(error?.message || 'Error hashing password', HTTP_INTERNAL_SERVER_ERROR);
  }
}

/**
 * Verifies a plain text password against a hashed password (async).
 * @async
 * @param {string} plainPassword - The plain text password to verify.
 * @param {string} hashedPassword - The hashed password to compare against.
 * @returns {Promise<boolean>} A promise that resolves to true if passwords match, false otherwise.
 * @throws {Error} If there's an error during the verification process.
 * @example
 * // Import the verifyPassword function
 * import { verifyPassword } from '@core/common/bcrypt';
 *
 * async function loginUser() {
 *   const plainPassword = "mySecurePassword123";
 *   const hashedPassword = "$2b$10$..."; // Retrieved from database
 *   try {
 *     const isMatch = await verifyPassword(plainPassword, hashedPassword);
 *     if (isMatch) {
 *       // Password is correct, proceed with login
 *     } else {
 *       // Password is incorrect
 *     }
 *   } catch (error) {
 *     // Handle error
 *   }
 * }
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throwError('Error verifying password', HTTP_INTERNAL_SERVER_ERROR);
  }
}

/**
 * Hashes a plain text password using bcrypt (sync).
 * @param {string} password - The plain text password to hash.
 * @returns {string} The hashed password.
 * @throws {Error} If there's an error during the hashing process.
 * @example
 * // Import the hashPasswordSync function
 * import { hashPasswordSync } from '@core/common/bcrypt';
 *
 * function createUserSync() {
 *   const plainPassword = "mySecurePassword123";
 *   try {
 *     const hashedPassword = hashPasswordSync(plainPassword);
 *     // hashedPassword: "$2b$10$..."
 *     // Store the hashedPassword in your database
 *   } catch (error) {
 *     // Handle error
 *   }
 * }
 */
export function hashPasswordSync(password: string): string {
  try {
    const salt = bcrypt.genSaltSync(SALT_ROUNDS);
    return bcrypt.hashSync(password, salt);
  } catch (error) {
    throwError('Error hashing password synchronously', HTTP_INTERNAL_SERVER_ERROR);
  }
}

/**
 * Verifies a plain text password against a hashed password (sync).
 * @param {string} plainPassword - The plain text password to verify.
 * @param {string} hashedPassword - The hashed password to compare against.
 * @returns {boolean} True if passwords match, false otherwise.
 * @throws {Error} If there's an error during the verification process.
 * @example
 * // Import the verifyPasswordSync function
 * import { verifyPasswordSync } from '@core/common/bcrypt';
 *
 * function loginUserSync() {
 *   const plainPassword = "mySecurePassword123";
 *   const hashedPassword = "$2b$10$..."; // Retrieved from database
 *   try {
 *     const isMatch = verifyPasswordSync(plainPassword, hashedPassword);
 *     if (isMatch) {
 *       // Password is correct, proceed with login
 *     } else {
 *       // Password is incorrect
 *     }
 *   } catch (error) {
 *     // Handle error
 *   }
 * }
 */
export function verifyPasswordSync(plainPassword: string, hashedPassword: string): boolean {
  try {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  } catch (error) {
    throwError('Error verifying password synchronously', HTTP_INTERNAL_SERVER_ERROR);
  }
}
