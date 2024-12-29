import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use((req, res, next) => {
    console.log('Request:', {
      method: req.method,
      path: req.path,
      headers: {
        authorization: req.headers.authorization ? 'Bearer ...' : 'none',
      },
      body: req.body,
    });
    next();
  });
  // Security
  app.use(helmet());
  app.enableCors();

  // // Compression
  // app.use(compression());

  // Global pipes
  app.useGlobalPipes(new ValidationPipe());

  // Global interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global filters
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new DatabaseExceptionFilter(),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Attendance Management API')
    .setDescription('API documentation for the Attendance Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
