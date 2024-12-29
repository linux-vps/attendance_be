import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorResponse = {
      success: false,
      error: {
        statusCode: status,
        message: message,
        timestamp: new Date().toISOString(),
      },
    };

    if (process.env.NODE_ENV !== 'production' && exception instanceof Error) {
      errorResponse.error['stack'] = exception.stack;
    }

    response.status(status).json(errorResponse);
  }
}
