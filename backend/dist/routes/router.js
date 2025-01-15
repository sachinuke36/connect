"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const friendRequest_routes_1 = __importDefault(require("./friendRequest.routes"));
const chat_routes_1 = __importDefault(require("./chat.routes"));
const group_routes_1 = __importDefault(require("./group.routes"));
const groupChat_routes_1 = __importDefault(require("./groupChat.routes"));
const router = (0, express_1.Router)();
exports.default = () => {
    (0, auth_routes_1.default)(router);
    (0, friendRequest_routes_1.default)(router);
    (0, chat_routes_1.default)(router);
    (0, group_routes_1.default)(router);
    (0, groupChat_routes_1.default)(router);
    return router;
};
//# sourceMappingURL=router.js.map