"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Friend = void 0;
const db_config_1 = require("../db/db.config");
const authControllers_1 = require("./authControllers");
const socketHandler_1 = require("../socketHandler");
class Friend {
    io;
    constructor(io) {
        this.io = io;
        this.sendFriendRequest = this.sendFriendRequest.bind(this);
        this.acceptRequest = this.acceptRequest.bind(this);
        this.rejectFriendRequest = this.rejectFriendRequest.bind(this);
        this.isFriend = this.isFriend.bind(this);
    }
    async sendFriendRequest(req, res) {
        const { userId: senderId, receiverId } = req.body;
        if (!senderId || !receiverId)
            return;
        try {
            const isFriend = await this.isFriend(senderId, receiverId);
            if (isFriend)
                return res.json({ message: "Already friends !" });
            const sendRequest = await db_config_1.prisma.friendRequest.create({
                data: { senderId, receiverId }
            });
            const receiverSocketId = (0, socketHandler_1.getReceiverSocketId)(receiverId);
            this.io.to(receiverSocketId).emit("friend-request-sent", { senderId, receiverId });
            return res.json({ message: "friend request sent successfully!", data: sendRequest });
        }
        catch (error) {
            console.log("Error in sending friend request! : ", error);
            throw new Error("Something went wrong!");
        }
    }
    async acceptRequest(req, res) {
        const { senderId, userId } = req.body;
        if (!senderId || !userId)
            return;
        try {
            const friendRequest = await db_config_1.prisma.friendRequest.update({
                where: { receiverId_senderId: { receiverId: userId, senderId: senderId } },
                data: {
                    status: "ACCEPTED"
                }
            });
            const senderSocketId = (0, socketHandler_1.getReceiverSocketId)(senderId);
            this.io.to(senderSocketId).emit("friend-request-accepted", { message: "friend request accepted", userId });
            return res.json({ message: " friend requested accepted!", data: friendRequest });
        }
        catch (error) {
            console.log("Error in accepting Friend Request: ", error);
            throw new Error("Something went wrong !");
        }
    }
    async rejectFriendRequest(req, res) {
        const { senderId, username } = req.body;
        if (!senderId || !username)
            return;
        try {
            const user = await db_config_1.prisma.user.findFirst({ where: { username } });
            if (!user)
                return res.json({ message: "No user found !" });
            const friendRequest = await db_config_1.prisma.friendRequest.update({
                where: { receiverId_senderId: { receiverId: user.userId, senderId: senderId } },
                data: {
                    status: "REJECTED"
                }
            });
        }
        catch (error) {
            console.log("Error in accepting Friend Request: ", error);
            throw new Error("Something went wrong !");
        }
    }
    async isFriend(senderId, receiverId) {
        try {
            const isFriend = await db_config_1.prisma.friendRequest.findFirst({
                where: { OR: [{ senderId, receiverId }, { senderId: receiverId, receiverId: senderId }],
                    status: "ACCEPTED"
                },
            });
            return Boolean(isFriend);
        }
        catch (error) {
            console.log("Error in isFriend");
            throw new Error("Something went wrong!");
        }
    }
    async getFriendRequests(req, res) {
        const { userId } = req.body;
        if (!userId)
            return;
        try {
            let friendRequests = await db_config_1.prisma.friendRequest.findMany({
                where: { OR: [{ receiverId: userId }, { senderId: userId }],
                    status: "PENDING" }
            });
            const friendRequestIds = friendRequests.map((i) => i.senderId);
            return res.json({ message: "Friend Request Ids", data: friendRequests });
        }
        catch (error) {
            console.log("Error in getFriendRequests : ", error);
        }
    }
    async getFriends(req, res) {
        const { username } = req.body;
        if (!username)
            return;
        const userId = (await (0, authControllers_1.getUser)(username))?.userId;
        if (!userId)
            return;
        try {
            const friends = await db_config_1.prisma.friendRequest.findMany({
                where: { OR: [{ senderId: userId }, { receiverId: userId }],
                    status: "ACCEPTED" }
            });
            const friendsIds = friends.map((i) => {
                if (i.receiverId === userId)
                    return i.senderId;
                else
                    return i.receiverId;
            });
            const allusers = await (0, authControllers_1.getAllUsers)();
            if (!allusers)
                return;
            const friendNames = allusers.filter((u) => friendsIds.includes(u.userId));
            return res.json({ messsage: "friendslists fetched successfully!", data: friendNames });
        }
        catch (error) {
            console.log("Error in getFriends", error);
            throw new Error("Something went wrong!");
        }
    }
}
exports.Friend = Friend;
//# sourceMappingURL=friendManagement.js.map