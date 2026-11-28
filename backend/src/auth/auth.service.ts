import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Mendaftarkan pengguna baru dengan password yang di-hash menggunakan bcrypt
   * sebelum disimpan ke PostgreSQL agar tidak pernah tersimpan sebagai plaintext.
   */
  async register(registerDto: RegisterDto) {
    const emailNormalized = registerDto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar. Silakan gunakan email lain atau login.');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    const user = await this.prisma.user.create({
      data: {
        nama: registerDto.nama.trim(),
        email: emailNormalized,
        password: hashedPassword,
      },
      select: {
        id: true,
        nama: true,
        email: true,
        createdAt: true,
      },
    });

    return {
      message: 'Registrasi berhasil.',
      user,
    };
  }

  /**
   * Memverifikasi kredensial login menggunakan bcrypt.compare dan menerbitkan
   * JWT accessToken apabila valid.
   */
  async login(loginDto: LoginDto) {
    const emailNormalized = loginDto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password salah.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      nama: user.nama,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
      },
    };
  }
}
