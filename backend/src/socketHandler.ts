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
const socketToGroupMap = {}
  
io.on("connection",(socket)=>{
    console.log('a user connected : ', socket.id);

    const userId = socket.handshake.query.userId;

    if (Array.isArray(userId)) {
        userToSocketIdMap[userId[0]] = socket.id;
      } else if (userId) {
        userToSocketIdMap[userId] = socket.id;
      }
      console.log(userToSocketIdMap)
    // socket.join(userId as string);
    console.log(`User ${userId} joined room ${userId}`);

      socket.on("disconnect",()=>{
        console.log("user disconnected", socket.id);
        delete userToSocketIdMap[userId[0]]
      })
    
})

export const getReceiverSocketId = (receiverId:string)=>{
    return userToSocketIdMap[receiverId];
}




export {app, server, io}