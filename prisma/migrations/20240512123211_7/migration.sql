-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_user_id_fkey";

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
