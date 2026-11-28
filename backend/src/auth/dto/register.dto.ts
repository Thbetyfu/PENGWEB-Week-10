import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'Nama harus berupa teks.' })
  @IsNotEmpty({ message: 'Nama tidak boleh kosong.' })
  @MinLength(2, { message: 'Nama minimal 2 karakter.' })
  nama: string;

  @IsEmail({}, { message: 'Format email tidak valid.' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong.' })
  email: string;

  @IsString({ message: 'Password harus berupa teks.' })
  @IsNotEmpty({ message: 'Password tidak boleh kosong.' })
  @MinLength(6, { message: 'Password minimal 6 karakter.' })
  password: string;
}
