/**
 * @fileoverview Server configuration and route setup for the application
 * @copyright COCO Inc. 2024
 * @author Kehinde Fasunle <kfasunle@gmail.com>
 * @see {@link https://github.com/fasunle}
 */

import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import app from 'express';
import rateLimit from 'express-rate-limit';
import path from 'path';

//
import { v1 } from './controllers/v1';
import { HTTP_OK } from './core/common/constants';
import errorHandler from './core/common/error-handler';
import { requestLogger } from './core/common/logger';
import { CSPPolicy, staticFilesMiddleware } from './templates';

/**
 * Express server instance for handling HTTP requests
 */
const server = app();

// Configure middleware for parsing JSON and URL-encoded bodies
server.use(app.json());
server.use(app.urlencoded({ extended: true }));
server.use(requestLogger);

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Configure CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// Apply security middlewares
server.use(helmet()); // Adds various HTTP headers for security
server.use(compression()); // Compress response bodies
server.use(cors(corsOptions));
server.use(limiter);

// Additional security measures
server.disable('x-powered-by'); // Hide Express
server.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Configure helmet CSP for EJS templates
server.use(CSPPolicy);

// Configure view engine and static files serving

// Set EJS as templating engine
server.set('view engine', 'ejs');
server.set('views', path.join(__dirname, 'views'));

// Serve static files with security headers
server.use('/static', staticFilesMiddleware(app));

server.get('/', (req, res) => {
  res.status(HTTP_OK).send('Hello World from version 1 of the API');
});

/**
 * Mount v1 API routes under /api/v1 endpoint
 */
server.use('/api/v1', v1);

server.use(errorHandler);

export default server;
