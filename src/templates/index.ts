import { ExpressMiddleware } from '@/types';
import helmet from 'helmet';
import path from 'path';

export const CSPPolicy: ExpressMiddleware = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    fontSrc: ["'self'"],
  },
});

export const staticFilesMiddleware = (app: any) =>
  app.static(path.join(__dirname, 'public'), {
    maxAge: '7d', // Cache static assets for 7 days
    etag: true, // Enable ETag for caching
    lastModified: true,
    setHeaders: res => {
      res.setHeader('Cache-Control', 'public, max-age=604800');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  });
