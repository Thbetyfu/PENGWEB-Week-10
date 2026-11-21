import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Provider PrismaService yang mengelola siklus hidup koneksi PrismaClient
 * ke basis data PostgreSQL ketika modul NestJS diinisialisasi.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
