import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

/**
 * Modul global untuk menyediakan PrismaService ke seluruh modul fitur
 * tanpa perlu mengimpornya berulang kali.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
