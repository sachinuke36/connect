/*
  Warnings:

  - You are about to drop the `_UserFriends` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_userGroups` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserFriends" DROP CONSTRAINT "_UserFriends_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserFriends" DROP CONSTRAINT "_UserFriends_B_fkey";

-- DropForeignKey
ALTER TABLE "_userGroups" DROP CONSTRAINT "_userGroups_A_fkey";

-- DropForeignKey
ALTER TABLE "_userGroups" DROP CONSTRAINT "_userGroups_B_fkey";

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "groupChatIds" INTEGER[],
ADD COLUMN     "membersId" INTEGER[],
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "chatsReceivedIds" INTEGER[],
ADD COLUMN     "chatsSentIds" INTEGER[],
ADD COLUMN     "friendRequestsIds" INTEGER[],
ADD COLUMN     "friendShipIds" INTEGER[],
ADD COLUMN     "groupChatIds" INTEGER[],
ADD COLUMN     "groupIds" TEXT[],
ADD COLUMN     "sentRequestsId" INTEGER[],
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "_UserFriends";

-- DropTable
DROP TABLE "_userGroups";

-- CreateTable
CREATE TABLE "FriendShip" (
    "friendshipId" SERIAL NOT NULL,
    "status" "FriendRequestStatus" NOT NULL,
    "friendId" INTEGER NOT NULL,

    CONSTRAINT "FriendShip_pkey" PRIMARY KEY ("friendshipId")
);

-- CreateTable
CREATE TABLE "_FriendShipToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FriendShipToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_GroupToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_GroupToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_FriendShipToUser_B_index" ON "_FriendShipToUser"("B");

-- CreateIndex
CREATE INDEX "_GroupToUser_B_index" ON "_GroupToUser"("B");

-- AddForeignKey
ALTER TABLE "_FriendShipToUser" ADD CONSTRAINT "_FriendShipToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "FriendShip"("friendshipId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FriendShipToUser" ADD CONSTRAINT "_FriendShipToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToUser" ADD CONSTRAINT "_GroupToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("groupId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToUser" ADD CONSTRAINT "_GroupToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
