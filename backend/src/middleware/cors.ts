import cors from 'cors';

/**
 * CORS configuration
 * In production, frontend is served from the same origin, so CORS is more permissive
 * In development, frontend is on a different port (5173), so we need specific origin
 */
const isProduction = process.env.NODE_ENV === 'production';

export const corsOptions: cors.CorsOptions = {
  origin: isProduction
    ? true // In production, allow same origin (frontend served from backend)
    : process.env.FRONTEND_URL || 'http://localhost:5173', // In development, allow specific origin
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export const corsMiddleware = cors(corsOptions);
