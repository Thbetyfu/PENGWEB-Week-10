import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ServisModule } from './servis/servis.module.js';

@Module({
  imports: [
    // Rate limiting global: maksimal 30 request per 60 detik (endpoint login di-override lebih ketat)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),
    PrismaModule,
    AuthModule,
    ServisModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
