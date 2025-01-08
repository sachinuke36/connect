/*
  Warnings:

  - You are about to drop the column `groupChatIds` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the `_GroupToGroupChat` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `groupId` to the `GroupChat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_GroupToGroupChat" DROP CONSTRAINT "_GroupToGroupChat_A_fkey";

-- DropForeignKey
ALTER TABLE "_GroupToGroupChat" DROP CONSTRAINT "_GroupToGroupChat_B_fkey";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "groupChatIds";

-- AlterTable
ALTER TABLE "GroupChat" ADD COLUMN     "groupId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_GroupToGroupChat";

-- AddForeignKey
ALTER TABLE "GroupChat" ADD CONSTRAINT "GroupChat_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;
