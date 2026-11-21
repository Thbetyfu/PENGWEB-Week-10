import { Module } from '@nestjs/common';
import { ServisService } from './servis.service.js';
import { ServisController } from './servis.controller.js';

@Module({
  controllers: [ServisController],
  providers: [ServisService],
  exports: [ServisService],
})
export class ServisModule {}
