import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsNumber,
  Min,
  IsIn,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateServisDto {
  @IsString({ message: 'Kendaraan harus berupa teks string' })
  @IsNotEmpty({ message: 'Nama kendaraan tidak boleh kosong' })
  @MinLength(3, { message: 'Nama kendaraan minimal 3 karakter' })
  kendaraan: string;

  @IsString({ message: 'Plat nomor harus berupa string' })
  @IsNotEmpty({ message: 'Plat nomor wajib diisi' })
  platNomor: string;

  @IsString({ message: 'Jenis motor harus berupa string' })
  @IsIn(['Konvensional', 'Listrik'], {
    message: 'Jenis motor harus berupa "Konvensional" atau "Listrik"',
  })
  jenisMotor: 'Konvensional' | 'Listrik';

  @IsString({ message: 'Nama bengkel harus berupa string' })
  @IsNotEmpty({ message: 'Nama bengkel mitra tidak boleh kosong' })
  bengkel: string;

  @IsString({ message: 'Layanan servis harus berupa string' })
  @IsNotEmpty({ message: 'Jenis layanan tidak boleh kosong' })
  layanan: string;

  @IsNumber({}, { message: 'Biaya harus berupa angka' })
  @Min(10000, { message: 'Biaya servis minimal Rp 10.000' })
  biaya: number;

  @IsDateString(
    {},
    { message: 'Format tanggal harus valid (format YYYY-MM-DD)' },
  )
  tanggal: string;

  @IsOptional()
  @IsIn(['Dijadwalkan', 'Selesai'], {
    message: 'Status harus bernilai "Dijadwalkan" atau "Selesai"',
  })
  status?: 'Dijadwalkan' | 'Selesai';
}
