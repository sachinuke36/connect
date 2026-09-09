import { Server } from "socket.io";
import expess from 'express';
import { createServer } from 'node:http';
import { prisma } from './db/db.config';

interface UserToSocketIdMap {
    [userId: string]: string;
}
interface SocketToGroupMap {
    [socketId: string]: Set<string>;
}

const app = expess();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        credentials: true,
        methods: ["GET", "POST"]
    }
});

const userToSocketIdMap: UserToSocketIdMap = {};
const socketToGroupMap: SocketToGroupMap = {};
const typingUsers: { [conversationKey: string]: Set<string> } = {};
  
io?.on("connection", async (socket) => {
    console.log('a user connected : ', socket.id);

    const queryUserId = socket.handshake.query.userId;
    const oduserId = Array.isArray(queryUserId) ? queryUserId[0] : queryUserId;

    if (oduserId) {
        console.log(`[SOCKET] User ${oduserId} connected with socket ${socket.id}`);
        userToSocketIdMap[oduserId] = socket.id;
        // Update user online status
        try {
            await prisma.user.update({
                where: { userId: oduserId },
                data: { isOnline: true, lastSeen: new Date() }
            });
        } catch (error) {
            console.error("Error updating online status:", error);
        }
    }
    io?.emit("getOnlineUsers", Object.keys(userToSocketIdMap));
    socketToGroupMap[socket.id] = new Set();

      socket?.on("joinGroup",(groupId:string)=>{
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
      socket?.on("room:join",(data)=>{
        const {to, from, roomId} = data;
        console.log(`[CALL] room:join - from: ${from}, to: ${to}, roomId: ${roomId}`);
        const userSocketId = getReceiverSocketId(from);
        const toSocketId = getReceiverSocketId(to);
        console.log(`[CALL] userSocketId: ${userSocketId}, toSocketId: ${toSocketId}`);
        if(toSocketId) io?.to(toSocketId).emit("incoming:call",data)
        io?.to(roomId).emit("user:joined",{userId:from, socketId:socket.id})
        socket?.join(roomId);
        io?.to(userSocketId).emit("room:join",data);
      })

      socket?.on("offer",({from, to, offer})=>{
        console.log(`[CALL] offer - from: ${from}, to: ${to}`);
        const toSocketId = getReceiverSocketId(to);
        console.log(`[CALL] sending offer to socketId: ${toSocketId}`);
        if(toSocketId) io?.to(toSocketId).emit("offer", {offer, from, to})
      })
      socket?.on("accepted:call", ({from, to})=>{
        console.log(`[CALL] accepted:call - from: ${from}, to: ${to}`);
        io?.to(getReceiverSocketId(from)).emit("accepted:call");
      })

      // Handle user:ready signal - receiver is ready to receive offer
      socket?.on("user:ready", ({to, from})=>{
        console.log(`[CALL] user:ready - from: ${from}, to: ${to}`);
        const toSocketId = getReceiverSocketId(to);
        if(toSocketId) {
          console.log(`[CALL] sending user:ready signal to socketId: ${toSocketId}`);
          io?.to(toSocketId).emit("user:ready", {from});
        }
      })
      socket?.on("call-declined", ({from, to})=>{
        console.log(`[CALL] call-declined - from: ${from}, to: ${to}`);
        io?.to(getReceiverSocketId(from)).emit("call-declined");
      })
      socket?.on("answer",({from, to, answer})=>{
        console.log(`[CALL] answer - from: ${from}, to: ${to}`);
        console.log(`[CALL] Current socket mappings:`, JSON.stringify(userToSocketIdMap));
        const toSocketId = getReceiverSocketId(to);
        console.log(`[CALL] sending answer to socketId: ${toSocketId} (looked up userId: ${to})`);
        if(toSocketId) io?.to(toSocketId).emit("answer", {answer, from, to})
      });

      socket?.on("icecandidate",({candidate, to})=>{
        console.log(`[CALL] icecandidate - to: ${to}`);
        const toSocketId = getReceiverSocketId(to);
        if(toSocketId) io?.to(toSocketId).emit("icecandidate", {candidate})
      })
    
      socket?.on("end-call",({to, from})=>{
        io?.to(getReceiverSocketId(to)).emit("end-call",{to, from})
      })
      socket?.on("call-ended",({callInfo})=>{
        io?.to(getReceiverSocketId(callInfo[0])).emit("call-ended",callInfo)
        io?.to(getReceiverSocketId(callInfo[1])).emit("call-ended",callInfo)
      })

      // Typing indicator
      socket?.on("typing:start", ({ to, from }) => {
        const toSocketId = getReceiverSocketId(to);
        if (toSocketId) {
          io?.to(toSocketId).emit("typing:start", { from });
        }
      });

      socket?.on("typing:stop", ({ to, from }) => {
        const toSocketId = getReceiverSocketId(to);
        if (toSocketId) {
          io?.to(toSocketId).emit("typing:stop", { from });
        }
      });

      // Message read receipts
      socket?.on("message:delivered", async ({ messageId, to }) => {
        try {
          await prisma.message.update({
            where: { messageId },
            data: { status: "DELIVERED" }
          });
          const toSocketId = getReceiverSocketId(to);
          if (toSocketId) {
            io?.to(toSocketId).emit("message:delivered", { messageId });
          }
        } catch (error) {
          console.error("Error updating message status:", error);
        }
      });

      socket?.on("message:seen", async ({ messageIds, to, conversationId }) => {
        try {
          await prisma.message.updateMany({
            where: { messageId: { in: messageIds } },
            data: { status: "SEEN" }
          });
          const toSocketId = getReceiverSocketId(to);
          if (toSocketId) {
            io?.to(toSocketId).emit("message:seen", { messageIds, conversationId });
          }
        } catch (error) {
          console.error("Error updating message status:", error);
        }
      });

      socket?.on("disconnect", async () => {
        console.log("user disconnected", socket?.id);
        for (const oduserId in userToSocketIdMap) {
          if (userToSocketIdMap[oduserId] === socket.id) {
            // Update last seen
            try {
              await prisma.user.update({
                where: { userId: oduserId },
                data: { lastSeen: new Date(), isOnline: false }
              });
            } catch (error) {
              console.error("Error updating last seen:", error);
            }
            delete userToSocketIdMap[oduserId];
            break;
          }
        }
        io?.emit("getOnlineUsers", Object.keys(userToSocketIdMap));
      })
    
})

export const getReceiverSocketId = (receiverId:string)=>{
    return userToSocketIdMap[receiverId];
}




export {app, server, io}