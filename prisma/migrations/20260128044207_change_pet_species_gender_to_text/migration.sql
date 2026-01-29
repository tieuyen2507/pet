/*
  Warnings:

  - You are about to drop the column `cost` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `diagnosis` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `issuedAt` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `issuerAddress` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `recordIdBytes32` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `recordType` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `signature` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `symptoms` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `treatment` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Pet` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Pet` table. All the data in the column will be lost.
  - You are about to drop the column `weightKg` on the `Pet` table. All the data in the column will be lost.
  - You are about to drop the `Reminder` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `description` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `species` on the `Pet` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `gender` on the `Pet` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `birthDate` on table `Pet` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_petId_fkey";

-- AlterTable
ALTER TABLE "MedicalRecord" DROP COLUMN "cost",
DROP COLUMN "diagnosis",
DROP COLUMN "issuedAt",
DROP COLUMN "issuerAddress",
DROP COLUMN "recordIdBytes32",
DROP COLUMN "recordType",
DROP COLUMN "signature",
DROP COLUMN "symptoms",
DROP COLUMN "treatment",
ADD COLUMN     "attachmentsUrl" TEXT,
ADD COLUMN     "chainId" INTEGER,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "txHash" TEXT,
ALTER COLUMN "recordHash" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Pet" DROP COLUMN "notes",
DROP COLUMN "updatedAt",
DROP COLUMN "weightKg",
DROP COLUMN "species",
ADD COLUMN     "species" TEXT NOT NULL,
DROP COLUMN "gender",
ADD COLUMN     "gender" TEXT NOT NULL,
ALTER COLUMN "birthDate" SET NOT NULL;

-- DropTable
DROP TABLE "Reminder";

-- DropEnum
DROP TYPE "Gender";

-- DropEnum
DROP TYPE "RecordType";

-- DropEnum
DROP TYPE "ReminderStatus";

-- DropEnum
DROP TYPE "ReminderType";

-- DropEnum
DROP TYPE "Species";

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Appointment_petId_idx" ON "Appointment"("petId");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
