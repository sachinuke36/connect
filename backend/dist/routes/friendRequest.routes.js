"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const friendManagement_1 = require("../controllers/friendManagement");
const socketHandler_1 = require("../socketHandler");
const friend = new friendManagement_1.Friend(socketHandler_1.io);
exports.default = (router) => {
    router.post("/addFriend", friend.sendFriendRequest);
    router.post("/getFriendRequest", friend.getFriendRequests);
    router.post("/acceptFriendRequest", friend.acceptRequest);
    router.post("/rejectFriendRequest", friend.rejectFriendRequest);
    router.post("/getFriends", friend.getFriends);
};
//# sourceMappingURL=friendRequest.routes.js.map