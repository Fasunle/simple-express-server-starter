/**
 * @file logger.ts
 * @description Logger utility class implementing singleton pattern for consistent logging across the application
 * @author Kehinde Fasunle <fasunle@gmail.com>
 *
 * @company Coco
 * @version 1.0.0
 * @license MIT
 * @github https://github.com/fasunle
 *
 * @class Logger
 * @description A singleton logger class that provides centralized logging functionality with different log levels
 * and handles both production and development environment logging
 *
 * @method private constructor() Initializes the logger instance with log file path and environment settings
 * @method private ensureLogDirectory() Creates log directory if it doesn't exist
 * @method public static getInstance() Returns the singleton instance of Logger
 * @method private writeToFile() Writes log messages to file with timestamp and level
 * @method public info() Logs information level messages
 * @method public success() Logs success level messages
 * @method public warn() Logs warning level messages
 * @method public error() Logs error level messages
 * @method public debug() Logs debug level messages in development
 * @method public trace() Logs trace level messages with stack trace in development
 */

//
import { ExpressMiddleware } from '@/types';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

/**
 * Logger class providing centralized logging functionality with different log levels
 * and production/development environment handling
 */
export class Logger {
  private static instance: Logger;
  private logFile: string;
  private isProd: boolean;

  /**
   * Private constructor to prevent direct instantiation
   * Initializes log file path and environment settings
   */
  private constructor() {
    this.logFile = path.join(process.cwd(), 'logs', 'app.log');
    this.isProd = process.env.NODE_ENV === 'production';
    this.ensureLogDirectory();
  }

  /**
   * Creates log directory if it doesn't exist
   * @private
   */
  private ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Gets the singleton instance of the Logger class
   * @returns {Logger} The singleton Logger instance
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Writes log message to file with timestamp and level
   * @private
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {...any[]} args - Additional arguments to log
   */
  private writeToFile(level: string, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level}] ${message} ${
      args.length ? JSON.stringify(args) : ''
    }`;
    fs.appendFileSync(this.logFile, formattedMessage + '\n');
  }

  /**
   * Logs info level message
   * @param {string} message - Info message to log
   * @param {...any[]} args - Additional arguments to log
   */
  public info(message: string, ...args: any[]) {
    console.log(chalk.blue('ℹ'), chalk.blue(message), ...args);
    if (this.isProd) this.writeToFile('INFO', message, ...args);
  }

  /**
   * Logs success level message
   * @param {string} message - Success message to log
   * @param {...any[]} args - Additional arguments to log
   */
  public success(message: string, ...args: any[]) {
    console.log(chalk.green('✔'), chalk.green(message), ...args);
    if (this.isProd) this.writeToFile('SUCCESS', message, ...args);
  }

  /**
   * Logs warning level message
   * @param {string} message - Warning message to log
   * @param {...any[]} args - Additional arguments to log
   */
  public warn(message: string, ...args: any[]) {
    console.log(chalk.yellow('⚠'), chalk.yellow(message), ...args);
    if (this.isProd) this.writeToFile('WARN', message, ...args);
  }

  /**
   * Logs error level message
   * @param {string} message - Error message to log
   * @param {...any[]} args - Additional arguments to log
   */
  public error(message: string, ...args: any[]) {
    console.log(chalk.red('✖'), chalk.red(message), ...args);
    if (this.isProd) this.writeToFile('ERROR', message, ...args);
  }

  /**
   * Logs debug level message (only in development)
   * @param {string} message - Debug message to log
   * @param {...any[]} args - Additional arguments to log
   */
  public debug(message: string, ...args: any[]) {
    if (!this.isProd) {
      console.log(chalk.magenta('🔍'), chalk.magenta(message), ...args);
    }
    if (this.isProd) this.writeToFile('DEBUG', message, ...args);
  }

  /**
   * Logs trace level message with stack trace (only in development)
   * @param {string} message - Trace message to log
   * @param {...any[]} args - Additional arguments to log
   */
  public trace(message: string, ...args: any[]) {
    if (!this.isProd) {
      console.log(chalk.cyan('📍'), chalk.cyan(message), ...args);
      console.trace();
    }
    if (this.isProd) this.writeToFile('TRACE', message, ...args);
  }
}

/**
 * Exports singleton instance of Logger
 * @constant {Logger} logger - Singleton instance of the Logger class
 */
export const logger = Logger.getInstance();

/**
 * Middleware to log incoming HTTP requests
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const requestLogger: ExpressMiddleware = (req, res, next) => {
  const start = Date.now();

  // Log request details
  logger.info(`Incoming ${req.method} request to ${req.url}`, {
    method: req.method,
    url: req.url,
    params: req.params,
    query: req.query,
    body: req.body,
    headers: req.headers,
    ip: req.ip,
  });

  // Log response details after request is completed
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`Request completed in ${duration}ms`, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
    });
  });

  next();
};
