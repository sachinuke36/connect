"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socketHandler_1 = require("../socketHandler");
const groupControllers_1 = require("../controllers/groupControllers");
const group = new groupControllers_1.Group(socketHandler_1.io);
exports.default = (router) => {
    router.post("/creategroup", group.createGroup);
    router.post("/getgroup", group.getGroup);
    router.post("/removeuserfromgroup", group.removeUserFromGroup);
    router.post("/leavegroup", group.leaveGroup);
    router.post("/updategroup", group.updateGroup);
};
//# sourceMappingURL=group.routes.js.map