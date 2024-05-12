/*
  Warnings:

  - Changed the type of `event_type` on the `Log` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EVENT_TYPE" AS ENUM ('Registration', 'Update', 'In', 'Out');

-- AlterTable
ALTER TABLE "Log" DROP COLUMN "event_type",
ADD COLUMN     "event_type" "EVENT_TYPE" NOT NULL;
