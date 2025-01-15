"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupChat = void 0;
const db_config_1 = require("../db/db.config");
class groupChat {
    io;
    constructor(io) {
        this.io = io;
        this.sendGroupChat = this.sendGroupChat.bind(this);
    }
    async sendGroupChat(req, res) {
        const { groupId, senderId, messageBody } = req.body;
        if (!groupId || !senderId || !messageBody)
            return;
        try {
            const response = await db_config_1.prisma.groupChat.create({ data: {
                    groupId,
                    senderId,
                    messageBody
                } });
            //socket connection goes here
            this.io.to(groupId).emit("newGroupMessage", {
                groupId,
                senderId,
                messageBody,
                sent_at: Date.now()
            });
            return res.status(200).json({ message: "message sent successfully!", data: response });
        }
        catch (error) {
            console.log("Error in sendgroupchat", error);
            throw new Error("Something went wrong!");
        }
    }
    async getGroupChats(req, res) {
        const { groupId } = req.body;
        if (!groupId)
            return;
        try {
            const groupChats = await db_config_1.prisma.groupChat.findMany({ where: { groupId } });
            return res.json({ message: " groupChats fetched successfully!", data: groupChats });
        }
        catch (error) {
            console.log("Error in getGroupChats", error);
            throw new Error("Something went wrong!");
        }
    }
}
exports.groupChat = groupChat;
//# sourceMappingURL=groupChatControllers.js.map