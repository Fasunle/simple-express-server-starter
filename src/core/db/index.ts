/**
 * @fileoverview Database service for managing database connections and operations
 * @copyright COCO Inc. 2024
 * @author Kehinde Fasunle <kfasunle@gmail.com>
 * @see {@link https://github.com/fasunle}
 */

//
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { AppDataSource } from '@/data-source';

dotenv.config();

/**
 * Service class responsible for handling all database-related operations
 * including connections, queries, and transactions
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private dataSource: DataSource;

  private constructor() {
    this.dataSource = AppDataSource;
  }

  /**
   * Gets the singleton instance of DatabaseService
   * @returns {DatabaseService} The singleton instance of DatabaseService
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initializes and establishes the database connection
   * @throws {Error} If connection fails
   */
  public async connect() {
    try {
      await this.dataSource.initialize();
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }

  /**
   * Executes a SQL query with optional parameters
   * @param {string} text - The SQL query to execute
   * @param {any[]} [params] - Optional parameters for the query
   * @returns {Promise<any>} The query result
   * @throws {Error} If query execution fails
   */
  public async query(text: string, params?: any[]) {
    try {
      const result = await this.dataSource.query(text, params);
      return result;
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  /**
   * Executes a callback function within a transaction
   * @param {Function} callback - The callback function to execute within the transaction
   * @returns {Promise<T>} The result of the callback function
   * @throws {Error} If transaction fails
   */
  public async transaction<T>(callback: (queryRunner: any) => Promise<T>): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await callback(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Closes the database connection
   * @throws {Error} If disconnection fails
   */
  public async disconnect() {
    try {
      await this.dataSource.destroy();
      console.log('Database disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting from database:', error);
      throw error;
    }
  }
}
