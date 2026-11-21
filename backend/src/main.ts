import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Mengaktifkan CORS agar frontend dapat berkomunikasi dengan backend
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
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
  console.log(`[Bengkelin Backend] Endpoint Servis: http://localhost:${port}/servis`);
}
await bootstrap();
