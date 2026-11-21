import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ServisService } from './servis.service.js';
import { CreateServisDto } from './dto/create-servis.dto.js';
import { UpdateServisDto } from './dto/update-servis.dto.js';
import { Servis } from './entities/servis.entity.js';

@Controller('servis')
export class ServisController {
  // Dependency Injection melalui constructor, tidak membuat instance ServisService secara manual
  constructor(private readonly servisService: ServisService) {}

  @Post()
  create(@Body() createServisDto: CreateServisDto): Promise<Servis> {
    return this.servisService.create(createServisDto);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('jenisMotor') jenisMotor?: string,
  ): Promise<Servis[]> {
    return this.servisService.findAll(status, jenisMotor);
  }

  @Get('statistik')
  getStatistik() {
    return this.servisService.getStatistik();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Servis> {
    return this.servisService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServisDto: UpdateServisDto,
  ): Promise<Servis> {
    return this.servisService.update(id, updateServisDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ message: string; id: string }> {
    return this.servisService.remove(id);
  }
}
