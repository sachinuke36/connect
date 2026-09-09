"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = exports.getReceiverSocketId = void 0;
const socket_io_1 = require("socket.io");
const express_1 = __importDefault(require("express"));
const node_http_1 = require("node:http");
const db_config_1 = require("./db/db.config");
const app = (0, express_1.default)();
exports.app = app;
const server = (0, node_http_1.createServer)(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        credentials: true,
        methods: ["GET", "POST"]
    }
});
exports.io = io;
const userToSocketIdMap = {};
const socketToGroupMap = {};
const typingUsers = {};
io?.on("connection", async (socket) => {
    console.log('a user connected : ', socket.id);
    const queryUserId = socket.handshake.query.userId;
    const oduserId = Array.isArray(queryUserId) ? queryUserId[0] : queryUserId;
    if (oduserId) {
        console.log(`[SOCKET] User ${oduserId} connected with socket ${socket.id}`);
        userToSocketIdMap[oduserId] = socket.id;
        // Note: Online status DB updates commented out - run prisma migrate first
        // try {
        //     await prisma.user.update({
        //         where: { userId: oduserId },
        //         data: { isOnline: true, lastSeen: new Date() }
        //     });
        // } catch (error) {
        //     console.error("Error updating online status:", error);
        // }
    }
    io?.emit("getOnlineUsers", Object.keys(userToSocketIdMap));
    socketToGroupMap[socket.id] = new Set();
    socket?.on("joinGroup", (groupId) => {
        socket.join(groupId);
        socketToGroupMap[socket.id].add(groupId);
        // console.log(socketToGroupMap)
        console.log(`User ${socket.id} joined group with ID: ${groupId}`);
    });
    // Re-register user socket mapping (for call rooms)
    socket?.on("register-user", ({ userId }) => {
        if (userId) {
            const oldSocketId = userToSocketIdMap[userId];
            console.log(`[CALL] Re-registering user ${userId}: ${oldSocketId} -> ${socket.id}`);
            userToSocketIdMap[userId] = socket.id;
            console.log(`[CALL] Updated mappings:`, JSON.stringify(userToSocketIdMap));
        }
    });
    //sockets for video call
    socket?.on("room:join", (data) => {
        const { to, from, roomId } = data;
        console.log(`[CALL] room:join - from: ${from}, to: ${to}, roomId: ${roomId}`);
        const userSocketId = (0, exports.getReceiverSocketId)(from);
        const toSocketId = (0, exports.getReceiverSocketId)(to);
        console.log(`[CALL] userSocketId: ${userSocketId}, toSocketId: ${toSocketId}`);
        if (toSocketId)
            io?.to(toSocketId).emit("incoming:call", data);
        io?.to(roomId).emit("user:joined", { userId: from, socketId: socket.id });
        socket?.join(roomId);
        io?.to(userSocketId).emit("room:join", data);
    });
    socket?.on("offer", ({ from, to, offer }) => {
        console.log(`[CALL] offer - from: ${from}, to: ${to}`);
        const toSocketId = (0, exports.getReceiverSocketId)(to);
        console.log(`[CALL] sending offer to socketId: ${toSocketId}`);
        if (toSocketId)
            io?.to(toSocketId).emit("offer", { offer, from, to });
    });
    socket?.on("accepted:call", ({ from, to }) => {
        console.log(`[CALL] accepted:call - from: ${from}, to: ${to}`);
        io?.to((0, exports.getReceiverSocketId)(from)).emit("accepted:call");
    });
    // Handle user:ready signal - receiver is ready to receive offer
    socket?.on("user:ready", ({ to, from }) => {
        console.log(`[CALL] user:ready - from: ${from}, to: ${to}`);
        const toSocketId = (0, exports.getReceiverSocketId)(to);
        if (toSocketId) {
            console.log(`[CALL] sending user:ready signal to socketId: ${toSocketId}`);
            io?.to(toSocketId).emit("user:ready", { from });
        }
    });
    socket?.on("call-declined", ({ from, to }) => {
        console.log(`[CALL] call-declined - from: ${from}, to: ${to}`);
        io?.to((0, exports.getReceiverSocketId)(from)).emit("call-declined");
    });
    socket?.on("answer", ({ from, to, answer }) => {
        console.log(`[CALL] answer - from: ${from}, to: ${to}`);
        console.log(`[CALL] Current socket mappings:`, JSON.stringify(userToSocketIdMap));
        const toSocketId = (0, exports.getReceiverSocketId)(to);
        console.log(`[CALL] sending answer to socketId: ${toSocketId} (looked up userId: ${to})`);
        if (toSocketId)
            io?.to(toSocketId).emit("answer", { answer, from, to });
    });
    socket?.on("icecandidate", ({ candidate, to }) => {
        console.log(`[CALL] icecandidate - to: ${to}`);
        const toSocketId = (0, exports.getReceiverSocketId)(to);
        if (toSocketId)
            io?.to(toSocketId).emit("icecandidate", { candidate });
    });
    socket?.on("end-call", ({ to, from }) => {
        io?.to((0, exports.getReceiverSocketId)(to)).emit("end-call", { to, from });
    });
    socket?.on("call-ended", ({ callInfo }) => {
        io?.to((0, exports.getReceiverSocketId)(callInfo[0])).emit("call-ended", callInfo);
        io?.to((0, exports.getReceiverSocketId)(callInfo[1])).emit("call-ended", callInfo);
    });
    // Typing indicator
    socket?.on("typing:start", ({ to, from }) => {
        const toSocketId = (0, exports.getReceiverSocketId)(to);
        if (toSocketId) {
            io?.to(toSocketId).emit("typing:start", { from });
        }
    });
    socket?.on("typing:stop", ({ to, from }) => {
        const toSocketId = (0, exports.getReceiverSocketId)(to);
        if (toSocketId) {
            io?.to(toSocketId).emit("typing:stop", { from });
        }
    });
    // Message read receipts
    socket?.on("message:delivered", async ({ messageId, to }) => {
        try {
            await db_config_1.prisma.message.update({
                where: { messageId },
                data: { status: "DELIVERED" }
            });
            const toSocketId = (0, exports.getReceiverSocketId)(to);
            if (toSocketId) {
                io?.to(toSocketId).emit("message:delivered", { messageId });
            }
        }
        catch (error) {
            console.error("Error updating message status:", error);
        }
    });
    socket?.on("message:seen", async ({ messageIds, to, conversationId }) => {
        try {
            await db_config_1.prisma.message.updateMany({
                where: { messageId: { in: messageIds } },
                data: { status: "SEEN" }
            });
            const toSocketId = (0, exports.getReceiverSocketId)(to);
            if (toSocketId) {
                io?.to(toSocketId).emit("message:seen", { messageIds, conversationId });
            }
        }
        catch (error) {
            console.error("Error updating message status:", error);
        }
    });
    socket?.on("disconnect", async () => {
        console.log("user disconnected", socket?.id);
        for (const oduserId in userToSocketIdMap) {
            if (userToSocketIdMap[oduserId] === socket.id) {
                // Note: Online status DB updates commented out - run prisma migrate first
                // try {
                //   await prisma.user.update({
                //     where: { userId: oduserId },
                //     data: { lastSeen: new Date(), isOnline: false }
                //   });
                // } catch (error) {
                //   console.error("Error updating last seen:", error);
                // }
                delete userToSocketIdMap[oduserId];
                break;
            }
        }
        io?.emit("getOnlineUsers", Object.keys(userToSocketIdMap));
    });
});
const getReceiverSocketId = (receiverId) => {
    return userToSocketIdMap[receiverId];
};
exports.getReceiverSocketId = getReceiverSocketId;
//# sourceMappingURL=socketHandler.js.map