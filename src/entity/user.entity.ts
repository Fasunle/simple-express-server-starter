/**
 * @fileoverview User entity class for managing user data and authentication
 * @copyright COCO Inc. 2024
 * @author Kehinde Fasunle <kfasunle@gmail.com>
 * @see {@link https://github.com/fasunle}
 *
 * This entity represents the user model in the database and handles:
 * - User data structure and validation
 * - Password hashing and verification
 * - User roles and authentication states
 *
 * Potential improvements:
 * - Add more user profile fields
 * - Implement additional validation rules
 * - Add methods for role management
 * - Include password history tracking
 * - Add account lockout functionality
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { logger } from '@/core/common/logger';
import { hashPassword, verifyPassword } from '@/core/common/bcrypt';

/**
 * User entity class representing the users table in the database
 * Handles user data storage and password management
 */
@Entity('users')
export class User {
  /** Unique identifier for the user */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** User's email address (unique) */
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  /** User's first name */
  @Column({ type: 'varchar', length: 50 })
  firstName: string;

  /** User's last name */
  @Column({ type: 'varchar', length: 50 })
  lastName: string;

  /** Hashed password (excluded from serialization) */
  @Column({ type: 'varchar', length: 100 })
  @Exclude()
  password: string;

  /** Flag indicating if the user account is active */
  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  /** Array of user roles */
  @Column({ type: 'varchar', length: 20, array: true, default: ['user'] })
  roles: string[];

  /** Refresh token for authentication */
  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshToken: string;

  /** Timestamp of the user's last login */
  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  /** Timestamp of when the user was created */
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  /** Timestamp of when the user was last updated */
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  /**
   * Automatically hashes the password before inserting or updating the user
   * @returns {Promise<void>}
   */
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    logger.info('Hashing password before insert or update');
    if (this.password) {
      this.password = await hashPassword(this.password);
    }
  }

  /**
   * Validates a plain text password against the stored hash
   * @param {string} password - Plain text password to validate
   * @returns {Promise<boolean>} True if password matches, false otherwise
   */
  async validatePassword(password: string): Promise<boolean> {
    logger.info('Validating password');
    return verifyPassword(password, this.password);
  }
}
