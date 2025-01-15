

import { Server } from "socket.io";
import expess from 'express';
import {createServer} from 'node:http';

  interface UserToSocketIdMap {
    [userId: string]: string;
  }
  interface SocketToGroupMap {
    [socketId: string]: Set<string>;
  }
  
  const origin = "http://localhost:5173"
  const app = expess();
  const server = createServer(app);
  const io = new Server(server,{
    cors:{
      origin: "*",
      credentials: true,
      methods:["GET", "POST"]
    }
  });

const userToSocketIdMap : UserToSocketIdMap = {};
const socketToGroupMap : SocketToGroupMap = {}
  
io.on("connection",(socket)=>{
    console.log('a user connected : ', socket.id);

    const userId = socket.handshake.query.userId;

    if (Array.isArray(userId)) {
        userToSocketIdMap[userId[0]] = socket.id;
      } else if (userId) {
        userToSocketIdMap[userId] = socket.id;
      }
      io.emit("getOnlineUsers",Object.keys(userToSocketIdMap));
      socketToGroupMap[socket.id] = new Set();

      socket.on("joinGroup",(groupId:string)=>{
        socket.join(groupId);
        socketToGroupMap[socket.id].add(groupId);
        // console.log(socketToGroupMap)
        console.log(`User ${socket.id} joined group with ID: ${groupId}`);
      });


      //sockets for video call
      socket.on("room:join",(data)=>{
        const {to, from, roomId} = data;
        const userSocketId = getReceiverSocketId(from);
        const toSocketId = getReceiverSocketId(to);
        if(toSocketId) io.to(toSocketId).emit("incoming:call",data)
        io.to(roomId).emit("user:joined",{userId:from, socketId:socket.id})
        socket.join(roomId);
        io.to(userSocketId).emit("room:join",data);
      })

  

      socket.on("offer",({from, to, offer})=>{
        io.to(getReceiverSocketId(to)).emit("offer", {offer, from, to})
      })
      socket.on("accepted:call", ({from, to})=>{
        io.to(getReceiverSocketId(from)).emit("accepted:call");
      })
      socket.on("answer",({from, to, answer})=>{
        io.to(getReceiverSocketId(from)).emit("answer", {answer, from, to})
      });

      socket.on("icecandidate",({candidate, to})=>{
        io.to(getReceiverSocketId(to)).emit("icecandidate", {candidate})
      })
    
      socket.on("end-call",({to, from})=>{
        io.to(getReceiverSocketId(to)).emit("end-call",{to, from})
      })
      socket.on("call-ended",({callInfo})=>{
        io.to(getReceiverSocketId(callInfo[0])).emit("call-ended",callInfo)
        io.to(getReceiverSocketId(callInfo[1])).emit("call-ended",callInfo)
      })

      socket.on("disconnect",()=>{
        console.log("user disconnected", socket.id);
        for (const userId in userToSocketIdMap) {
          if (userToSocketIdMap[userId] === socket.id) {
            delete userToSocketIdMap[userId];
            break;
          }
        }
      })
    
})

export const getReceiverSocketId = (receiverId:string)=>{
    return userToSocketIdMap[receiverId];
}




export {app, server, io}