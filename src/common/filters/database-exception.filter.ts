import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';
import { ErrorResponse } from '../interfaces/api-response.interface';

@Catch(QueryFailedError, EntityNotFoundError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError | EntityNotFoundError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database operation failed';
    let code = 'DATABASE_ERROR';

    if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Entity not found';
      code = 'ENTITY_NOT_FOUND';
    } else if (exception instanceof QueryFailedError) {
      // Handle specific database errors
      if ((exception as any).code === '23505') { // Unique violation
        status = HttpStatus.CONFLICT;
        message = 'Duplicate entry';
        code = 'DUPLICATE_ENTRY';
      }
    }

    const errorResponse: ErrorResponse = {
      success: false,
      message,
      error: {
        code,
        details: process.env.NODE_ENV === 'development' ? exception : undefined,
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };

    response.status(status).json(errorResponse);
  }
}
