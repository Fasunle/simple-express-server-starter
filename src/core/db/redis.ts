/**
 * Redis service for handling Redis operations with type-safe values.
 * This class provides a wrapper around the Redis client with methods for common operations.
 *
 * @template T The type of values to be stored in Redis
 *
 * @example
 * // Initialize Redis service
 * const redis = new RedisService<User>('redis://localhost:6379');
 *
 * // Basic key-value operations
 * await redis.set('user:123', { id: 123, name: 'John' });
 * await redis.set('user:123', { id: 123, name: 'John' }, 3600); // with TTL
 * const user = await redis.get('user:123');
 * await redis.delete('user:123');
 * const exists = await redis.exists('user:123');
 *
 * // Hash operations
 * await redis.setHash('users', 'user:123', { id: 123, name: 'John' });
 * const hashUser = await redis.getHash('users', 'user:123');
 * const allUsers = await redis.getAllHash('users');
 *
 * // Cleanup
 * await redis.disconnect();
 * @copyright COCO Inc. 2024
 * @author Kehinde Fasunle <kfasunle@gmail.com>
 * @see {@link https://github.com/fasunle}
 */
import { createClient, RedisClientType } from 'redis';

//
import { logger } from '@/core/common/logger';
import { throwError } from '@/core/common/error-handler';
import { HTTP_INTERNAL_SERVER_ERROR } from '../common/constants';

export class RedisService<T> {
  private client: RedisClientType;

  /**
   * Creates a new Redis service instance.
   * @param connectionString The Redis connection string (e.g., 'redis://localhost:6379')
   */
  constructor(connectionString: string) {
    this.client = createClient({
      url: connectionString,
    });

    this.client.on('error', err => logger.error('Redis Client Error: ', err));
    this.client.connect();
  }

  /**
   * Sets a value in Redis with an optional expiration time.
   * @param key The Redis key
   * @param value The value to store
   * @param expireInSeconds Optional TTL in seconds
   */
  async set(key: string, value: T, expireInSeconds?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (expireInSeconds) {
        await this.client.setEx(key, expireInSeconds, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      throwError(`Error setting Redis key: ${error.message}`, HTTP_INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Retrieves a value from Redis.
   * @param key The Redis key
   * @returns The stored value or null if not found
   */
  async get(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value as any) : null;
    } catch (error) {
      throwError(`Error getting Redis key: ${error.message}`, HTTP_INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Deletes a key from Redis.
   * @param key The Redis key to delete
   */
  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      throwError(`Error deleting Redis key: ${error.message}`, HTTP_INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Checks if a key exists in Redis.
   * @param key The Redis key to check
   * @returns True if the key exists, false otherwise
   */
  async exists(key: string): Promise<boolean> {
    try {
      return (await this.client.exists(key)) === 1;
    } catch (error) {
      throwError(
        `Error checking Redis key existence: ${error.message}`,
        HTTP_INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Sets a field in a Redis hash.
   * @param key The Redis hash key
   * @param field The field name in the hash
   * @param value The value to store
   */
  async setHash(key: string, field: string, value: T): Promise<void> {
    try {
      await this.client.hSet(key, field, JSON.stringify(value));
    } catch (error) {
      throwError(`Error setting Redis hash: ${error.message}`, HTTP_INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Retrieves a field from a Redis hash.
   * @param key The Redis hash key
   * @param field The field name in the hash
   * @returns The stored value or null if not found
   */
  async getHash(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.client.hGet(key, field);
      return value ? JSON.parse(JSON.stringify(value)) : null;
    } catch (error) {
      throwError(`Error getting Redis hash: ${error.message}`, HTTP_INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Retrieves all fields and values from a Redis hash.
   * @param key The Redis hash key
   * @returns An object containing all field-value pairs
   */
  async getAllHash(key: string): Promise<Record<string, T>> {
    try {
      const hash = await this.client.hGetAll(key);
      const result: Record<string, T> = {};
      for (const [field, value] of Object.entries(hash)) {
        result[field] = JSON.parse(value);
      }
      return result;
    } catch (error) {
      throw new Error(`Error getting all Redis hash values: ${error}`);
    }
  }

  /**
   * Disconnects from the Redis server.
   */
  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}
