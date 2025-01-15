"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = exports.getReceiverSocketId = void 0;
const socket_io_1 = require("socket.io");
const express_1 = __importDefault(require("express"));
const node_http_1 = require("node:http");
const origin = "http://localhost:5173";
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
io.on("connection", (socket) => {
    console.log('a user connected : ', socket.id);
    const userId = socket.handshake.query.userId;
    if (Array.isArray(userId)) {
        userToSocketIdMap[userId[0]] = socket.id;
    }
    else if (userId) {
        userToSocketIdMap[userId] = socket.id;
    }
    io.emit("getOnlineUsers", Object.keys(userToSocketIdMap));
    socketToGroupMap[socket.id] = new Set();
    socket.on("joinGroup", (groupId) => {
        socket.join(groupId);
        socketToGroupMap[socket.id].add(groupId);
        // console.log(socketToGroupMap)
        console.log(`User ${socket.id} joined group with ID: ${groupId}`);
    });
    //sockets for video call
    socket.on("room:join", (data) => {
        const { to, from, roomId } = data;
        const userSocketId = (0, exports.getReceiverSocketId)(from);
        const toSocketId = (0, exports.getReceiverSocketId)(to);
        if (toSocketId)
            io.to(toSocketId).emit("incoming:call", data);
        io.to(roomId).emit("user:joined", { userId: from, socketId: socket.id });
        socket.join(roomId);
        io.to(userSocketId).emit("room:join", data);
    });
    socket.on("offer", ({ from, to, offer }) => {
        io.to((0, exports.getReceiverSocketId)(to)).emit("offer", { offer, from, to });
    });
    socket.on("accepted:call", ({ from, to }) => {
        io.to((0, exports.getReceiverSocketId)(from)).emit("accepted:call");
    });
    socket.on("answer", ({ from, to, answer }) => {
        io.to((0, exports.getReceiverSocketId)(from)).emit("answer", { answer, from, to });
    });
    socket.on("icecandidate", ({ candidate, to }) => {
        io.to((0, exports.getReceiverSocketId)(to)).emit("icecandidate", { candidate });
    });
    socket.on("end-call", ({ to, from }) => {
        io.to((0, exports.getReceiverSocketId)(to)).emit("end-call", { to, from });
    });
    socket.on("call-ended", ({ callInfo }) => {
        io.to((0, exports.getReceiverSocketId)(callInfo[0])).emit("call-ended", callInfo);
        io.to((0, exports.getReceiverSocketId)(callInfo[1])).emit("call-ended", callInfo);
    });
    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
        for (const userId in userToSocketIdMap) {
            if (userToSocketIdMap[userId] === socket.id) {
                delete userToSocketIdMap[userId];
                break;
            }
        }
    });
});
const getReceiverSocketId = (receiverId) => {
    return userToSocketIdMap[receiverId];
};
exports.getReceiverSocketId = getReceiverSocketId;
//# sourceMappingURL=socketHandler.js.map