import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { JenisMotor, Prisma, StatusServis } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateServisDto } from './dto/create-servis.dto.js';
import { UpdateServisDto } from './dto/update-servis.dto.js';
import { Servis } from './entities/servis.entity.js';

@Injectable()
export class ServisService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mengambil seluruh daftar servis dari PostgreSQL, dengan dukungan
   * filter opsional berdasarkan status dan jenisMotor.
   */
  async findAll(status?: string, jenisMotor?: string): Promise<Servis[]> {
    const where: Prisma.ServisWhereInput = {};

    if (status) {
      const normalizedStatus =
        status.toLowerCase() === 'selesai'
          ? StatusServis.Selesai
          : status.toLowerCase() === 'dijadwalkan'
            ? StatusServis.Dijadwalkan
            : undefined;
      if (normalizedStatus) {
        where.status = normalizedStatus;
      }
    }

    if (jenisMotor) {
      const normalizedJenis =
        jenisMotor.toLowerCase() === 'listrik'
          ? JenisMotor.Listrik
          : jenisMotor.toLowerCase() === 'konvensional'
            ? JenisMotor.Konvensional
            : undefined;
      if (normalizedJenis) {
        where.jenisMotor = normalizedJenis;
      }
    }

    return this.prisma.servis.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Mengambil satu data servis berdasarkan ID dari PostgreSQL.
   */
  async findOne(id: string): Promise<Servis> {
    const item = await this.prisma.servis.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(
        `Data servis dengan ID "${id}" tidak ditemukan pada sistem Bengkelin.`,
      );
    }

    return item;
  }

  /**
   * Menyimpan jadwal servis baru ke PostgreSQL setelah memastikan
   * tidak ada duplikasi jadwal aktif untuk plat nomor pada tanggal yang sama.
   */
  async create(createServisDto: CreateServisDto): Promise<Servis> {
    const platUpper = createServisDto.platNomor.trim().toUpperCase();

    const duplikat = await this.prisma.servis.findFirst({
      where: {
        platNomor: platUpper,
        tanggal: createServisDto.tanggal,
        status: StatusServis.Dijadwalkan,
      },
    });

    if (duplikat) {
      throw new ConflictException(
        `Jadwal servis untuk kendaraan dengan plat nomor "${platUpper}" pada tanggal ${createServisDto.tanggal} sudah terdaftar.`,
      );
    }

    return this.prisma.servis.create({
      data: {
        kendaraan: createServisDto.kendaraan.trim(),
        platNomor: platUpper,
        jenisMotor: createServisDto.jenisMotor as JenisMotor,
        bengkel: createServisDto.bengkel.trim(),
        layanan: createServisDto.layanan.trim(),
        biaya: createServisDto.biaya,
        tanggal: createServisDto.tanggal,
        status: (createServisDto.status ?? 'Dijadwalkan') as StatusServis,
      },
    });
  }

  /**
   * Memperbarui sebagian atau seluruh data servis berdasarkan ID.
   */
  async update(id: string, updateServisDto: UpdateServisDto): Promise<Servis> {
    await this.findOne(id);

    const dataUpdate: Prisma.ServisUpdateInput = {
      ...updateServisDto,
    };

    if (updateServisDto.platNomor) {
      dataUpdate.platNomor = updateServisDto.platNomor.trim().toUpperCase();
    }

    return this.prisma.servis.update({
      where: { id },
      data: dataUpdate,
    });
  }

  /**
   * Menghapus data servis secara permanen dari PostgreSQL berdasarkan ID.
   */
  async remove(id: string): Promise<{ message: string; id: string }> {
    await this.findOne(id);

    await this.prisma.servis.delete({
      where: { id },
    });

    return {
      message: `Data servis dengan ID "${id}" berhasil dihapus dari sistem Bengkelin.`,
      id,
    };
  }

  /**
   * Endpoint query lanjutan: Mengembalikan statistik ringkas antrean servis
   * dan total estimasi biaya menggunakan Prisma count & aggregate.
   */
  async getStatistik(): Promise<{
    totalServis: number;
    dijadwalkan: number;
    selesai: number;
    motorKonvensional: number;
    motorListrik: number;
    totalEstimasiBiaya: number;
  }> {
    const [
      totalServis,
      dijadwalkan,
      selesai,
      motorKonvensional,
      motorListrik,
      agregatBiaya,
    ] = await Promise.all([
      this.prisma.servis.count(),
      this.prisma.servis.count({ where: { status: StatusServis.Dijadwalkan } }),
      this.prisma.servis.count({ where: { status: StatusServis.Selesai } }),
      this.prisma.servis.count({
        where: { jenisMotor: JenisMotor.Konvensional },
      }),
      this.prisma.servis.count({ where: { jenisMotor: JenisMotor.Listrik } }),
      this.prisma.servis.aggregate({
        _sum: { biaya: true },
      }),
    ]);

    return {
      totalServis,
      dijadwalkan,
      selesai,
      motorKonvensional,
      motorListrik,
      totalEstimasiBiaya: agregatBiaya._sum.biaya ?? 0,
    };
  }
}
