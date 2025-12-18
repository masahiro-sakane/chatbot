import { Router, Request, Response } from 'express';
import { HealthResponse } from '../types';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  const healthResponse: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };

  res.json(healthResponse);
});

export default router;
