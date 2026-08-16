import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS - allow all origins with dynamic origin reflection
  app.enableCors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  // Global roles guard
  app.useGlobalGuards(new RolesGuard(app.get(Reflector)));
  
  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
}

bootstrap();
