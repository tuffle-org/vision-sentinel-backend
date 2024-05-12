-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_id_fkey";

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
