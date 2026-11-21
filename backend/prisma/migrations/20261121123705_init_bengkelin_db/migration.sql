-- CreateEnum
CREATE TYPE "JenisMotor" AS ENUM ('Konvensional', 'Listrik');

-- CreateEnum
CREATE TYPE "StatusServis" AS ENUM ('Dijadwalkan', 'Selesai');

-- CreateTable
CREATE TABLE "servis" (
    "id" TEXT NOT NULL,
    "kendaraan" TEXT NOT NULL,
    "platNomor" TEXT NOT NULL,
    "jenisMotor" "JenisMotor" NOT NULL,
    "bengkel" TEXT NOT NULL,
    "layanan" TEXT NOT NULL,
    "biaya" INTEGER NOT NULL,
    "tanggal" TEXT NOT NULL,
    "status" "StatusServis" NOT NULL DEFAULT 'Dijadwalkan',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servis_pkey" PRIMARY KEY ("id")
);
