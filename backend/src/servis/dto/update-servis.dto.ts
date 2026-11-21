import { PartialType } from '@nestjs/mapped-types';
import { CreateServisDto } from './create-servis.dto.js';

export class UpdateServisDto extends PartialType(CreateServisDto) {}
