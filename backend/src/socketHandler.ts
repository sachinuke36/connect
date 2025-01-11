import { Server } from "socket.io";
import expess from 'express';
import {createServer} from 'node:http';

interface SocketData {
    roomId?: string;
    userId?: string;
  }
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
      origin: origin,
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

      socketToGroupMap[socket.id] = new Set();

      socket.on("joinGroup",(groupId:string)=>{
        socket.join(groupId);
        socketToGroupMap[socket.id].add(groupId);
        console.log(socketToGroupMap)
        console.log(`User ${socket.id} joined group with ID: ${groupId}`);
      })
      socket.on("disconnect",()=>{
        console.log("user disconnected", socket.id);
        delete userToSocketIdMap[userId[0]]
      })
    
})

export const getReceiverSocketId = (receiverId:string)=>{
    return userToSocketIdMap[receiverId];
}




export {app, server, io}