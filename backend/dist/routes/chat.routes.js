"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socketHandler_1 = require("../socketHandler");
const chatManagement_1 = require("../controllers/chatManagement");
const chat = new chatManagement_1.Chat(socketHandler_1.io);
exports.default = (router) => {
    router.post("/sendChat", chat.sendChat);
    router.post("/getchats", chat.getChats);
    router.get("/getConvesations", chat.getConversationLists);
};
//# sourceMappingURL=chat.routes.js.map