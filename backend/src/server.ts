// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

// Now import other modules
import express, { Application, Request, Response } from 'express';
import path from 'path';
import helmet from 'helmet';
import { corsMiddleware } from './middleware/cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import chatRoutes from './routes/chat';
import healthRoutes from './routes/health';

// Create Express application
const app: Application = express();

// Get port and environment from environment variables
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// Security: Helmet middleware for security headers
if (isProduction) {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    })
  );
} else {
  // In development, use more permissive CSP
  app.use(helmet({ contentSecurityPolicy: false }));
}

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(corsMiddleware); // Enable CORS

// API Routes
app.use('/api', chatRoutes);
app.use('/api', healthRoutes);

// Serve static files in production
if (isProduction) {
  const publicPath = path.join(__dirname, '..', 'public');

  // Serve static files
  app.use(express.static(publicPath));

  // SPA fallback: serve index.html for all non-API routes
  app.use((req: Request, res: Response, next) => {
    // Skip API routes - they should return JSON errors
    if (req.path.startsWith('/api/')) {
      return next();
    }
    // Serve index.html for all other routes (SPA routing)
    res.sendFile(path.join(publicPath, 'index.html'), (err) => {
      if (err) {
        next(err);
      }
    });
  });
}

// Error handling (only applies to API routes and errors in production)
app.use(notFoundHandler);
app.use(errorHandler); // Global error handler

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

export default app;
