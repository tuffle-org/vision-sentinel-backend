/*
  Warnings:

  - The `face_data` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "face_data",
ADD COLUMN     "face_data" BYTEA;
