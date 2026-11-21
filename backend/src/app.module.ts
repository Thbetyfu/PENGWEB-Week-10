import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { ServisModule } from './servis/servis.module.js';

@Module({
  imports: [PrismaModule, ServisModule],
})
export class AppModule {}
