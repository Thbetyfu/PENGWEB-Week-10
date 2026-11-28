import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Memasang HTTP security headers (X-Content-Type-Options, X-Frame-Options, dll.)
  app.use(helmet());

  // Mengaktifkan CORS secara spesifik untuk origin frontend yang diizinkan
  const allowedOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
  app.enableCors({
    origin: allowedOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  // Mengaktifkan ValidationPipe secara global untuk seluruh endpoint
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Hapus otomatis properti yang tidak ada di DTO
      forbidNonWhitelisted: true, // Tolak request dan lempar error jika ada field asing
      transform: true, // Otomatis transformasi payload menjadi instance DTO
    }),
  );

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`[Bengkelin Backend] Server berjalan di http://localhost:${port}`);
  console.log(`[Bengkelin Backend] Endpoint Auth: http://localhost:${port}/auth`);
  console.log(`[Bengkelin Backend] Endpoint Servis (JWT Protected): http://localhost:${port}/servis`);
}
await bootstrap();
