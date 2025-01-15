"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socketHandler_1 = require("../socketHandler");
const groupChatControllers_1 = require("../controllers/groupChatControllers");
const groupchats = new groupChatControllers_1.groupChat(socketHandler_1.io);
exports.default = (router) => {
    router.post("/sendgroupchat", groupchats.sendGroupChat);
    router.post("/getgroupchats", groupchats.getGroupChats);
};
//# sourceMappingURL=groupChat.routes.js.map