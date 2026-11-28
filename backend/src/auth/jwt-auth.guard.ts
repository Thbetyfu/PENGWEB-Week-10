import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard untuk memproteksi endpoint privat menggunakan strategi JWT Bearer.
 * Request tanpa token atau dengan token tidak valid otomatis ditolak dengan status 401.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
