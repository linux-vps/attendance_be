import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Add unique request ID
    req.requestId = uuidv4();
    
    // Add request start time
    req.startTime = Date.now();
    
    // Add request ID to response headers
    res.setHeader('X-Request-Id', req.requestId);
    
    next();
  }
}
