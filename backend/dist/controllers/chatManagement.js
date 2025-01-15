"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
const db_config_1 = require("../db/db.config");
const authControllers_1 = require("./authControllers");
const socketHandler_1 = require("../socketHandler");
class Chat {
    chats;
    io;
    constructor(io) {
        this.chats = [];
        this.io = io;
        this.getConversationLists = this.getConversationLists.bind(this);
        this.createConversation = this.createConversation.bind(this);
        this.getChats = this.getChats.bind(this);
        this.sendChat = this.sendChat.bind(this);
        this.getConversationsOfUser = this.getConversationsOfUser.bind(this);
    }
    async createConversation(user, friendId) {
        if (!user)
            return;
        try {
            let conversation = await db_config_1.prisma.conversation.findFirst({ where: {
                    participantIds: { hasEvery: [user.userId, friendId] }
                } });
            if (!conversation) {
                conversation = await db_config_1.prisma.conversation.create({ data: {
                        participantIds: [user.userId, friendId],
                        participants: { connect: [{ userId: user.userId }, { userId: friendId }] }
                    } });
            }
            return conversation;
        }
        catch (error) {
            console.log("Error in createConversation: ", error);
        }
    }
    async getConversationsOfUser(user) {
        let conversation = await db_config_1.prisma.conversation.findMany({
            where: {
                participantIds: {
                    hasSome: [user.userId]
                }
            }
        });
        return conversation;
    }
    async sendChat(req, res) {
        const { username, friendId, messageBody } = req.body;
        // const friendId = (await getUser(friendUsername)).userId
        try {
            const user = await (0, authControllers_1.getUser)(username);
            if (!user)
                return;
            const conversation = await this.createConversation(user, friendId);
            const message = await db_config_1.prisma.message.create({
                data: {
                    conversationId: conversation?.conversationId,
                    senderId: user.userId,
                    body: messageBody
                }
            });
            // socket connection for message goes here
            const friendSocketId = (0, socketHandler_1.getReceiverSocketId)(friendId);
            this.io.to(friendSocketId).emit("newMessage", { senderId: user.userId, body: messageBody, sent_at: Date.now() });
            return res.json({ message: " Message Sent Successfully !", data: message });
        }
        catch (error) {
            console.log("Error in sendChat: ", error);
            throw new Error("Error in sending Message");
        }
    }
    async getChats(req, res) {
        const { friendUserId: friendId, username } = req.body;
        if (!friendId || !username)
            return res.json({ error: "Provide all details" });
        // const friendId = (await getUser(friendUserId)).userId
        const user = await (0, authControllers_1.getUser)(username);
        if (!user)
            return;
        const conversationId = (await this.createConversation(user, friendId))?.conversationId;
        this.chats = await db_config_1.prisma.message.findMany({
            where: { conversationId }
        });
        return res.json({ message: "Chats fetched successfully!", data: this.chats });
    }
    async getConversationLists(req, res) {
        const { username } = req.body;
        try {
            const user = await (0, authControllers_1.getUser)(username);
            if (!user)
                return;
            const users = await (0, authControllers_1.getAllUsers)();
            const conversationIds = (await this.getConversationsOfUser(user)).map((i) => i.conversationId); // where user is involved
            const messages = await db_config_1.prisma.message.findMany({
                where: { conversationId: { in: conversationIds } }
            });
            const senderIds = messages.map((m) => {
                if (m.senderId !== user.userId)
                    return m.senderId;
            });
            const friendNames = users.filter((u) => senderIds.includes(u.userId));
            return res.json({ messages: "conversationsLists fetched successfully!", data: friendNames });
        }
        catch (error) {
            console.log("Error in getConversationLists : ", error);
            throw new Error("Something went wrong!");
        }
    }
}
exports.Chat = Chat;
//# sourceMappingURL=chatManagement.js.map