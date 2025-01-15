import express, { NextFunction, Request, Response } from 'express'
import router from './routes/router';
import cors from 'cors'
import {createServer} from 'node:http';
import {Server} from 'socket.io'
import {app, server} from './socketHandler'

const origin = "http://localhost:5173"
const PORT = process.env.PORT || 8000;

//middlewares
app.use(cors({origin: origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'],}))
  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/api',router());

server.listen(PORT,()=>{
  console.log("Server is running on : " + PORT )
})






// import { prisma } from "./db/db.config";

// async function main() {
//   try {
//     // Find sender (Ramesh) by username
//     const ramesh = await prisma.user.findUnique({
//       where: { username: "ramesh" },
//     });

//     if (!ramesh) {
//       throw new Error("Sender (Ramesh) not found.");
//     }

//     // Find receiver (Sachin) by username
//       const sachin = await prisma.user.findUnique({
//       where: { username: "sachinuke36" },
//     });

//     if (!sachin) {
//       throw new Error("Receiver (Sachin) not found.");
//     }

//     // Ensure senderId and receiverId are defined before using them
//     const senderId = ramesh.userId;
//     const receiverId = sachin.userId;

//     // Create a friend request
//     // const createFriendRequest = await prisma.friendRequest.create({
//     //   data: {
//     //     senderId,  // Guaranteed to be a string
//     //     receiverId, // Guaranteed to be a string
//     //   },
//     // });

//     // const acceptRequest = await prisma.friendRequest.updateMany({
//     //     where: {
//     //          receiverId,
//     //          senderId ,
//     //          status : "PENDING"
//     //     },
//     //     data:{
//     //          status: "ACCEPTED"
//     //     }
       
//     // })
//     // const friendsOfSachin = await prisma.friendRequest.findMany({
//     // where: { OR : [ {senderId:sachin.userId}, {receiverId: sachin.userId}],
//     // status: "ACCEPTED"}
//     // })
//     // console.log(await prisma.friendRequest.findMany())
//     // console.log(receiverId)

//     // console.log("Friend Request accepted:",friendsOfSachin.map((i)=>{
//     //     if(i.receiverId !== receiverId) return i.receiverId
//     //     else return i.senderId
//     // }) );
//     let conversation = await prisma.conversation.findFirst({
//         where: {
//           participantIds: {
//             hasEvery: [senderId, receiverId], // Checks if both IDs are present in the array
//           },
//         },
//       });

//       if(!conversation){
//         conversation = await prisma.conversation.create({
//             data: {
//                 participantIds : [senderId, receiverId],
//                 participants: {
//                     connect: [{ userId: senderId }, { userId: receiverId }],
//                   },
//             }
//         })
//       }

//       const message = await prisma.message.create({
//         data: {
//             conversationId : conversation.conversationId,
//             senderId : sachin.userId,
//             body : "Hii"
//         }
//       })

//       const messageBetweenSachinAndRamesh = await prisma.message.findMany({
//         where: {conversationId: conversation.conversationId},
        
//       })



//       console.log(conversation);
//       console.log(messageBetweenSachinAndRamesh)
//   } catch (error : any) {
//     console.error("Error occurred:", error.message);
//   } finally {
//     // Disconnect Prisma Client
//     await prisma.$disconnect();
//   }
// }

// // Run the main function
// main();









// // import { prisma } from "./db/db.config";

// // async function main(){
// //    const sachin = await prisma.user.findUnique({
// //     where:{ username: "sachinuke36",
// //     }
// //    })

// //    const ramesh = await prisma.user.findUnique({
// //     where:{ username: "ramesh",
// //     }
// //    })

// //    const createFriendRequest = await prisma.friendRequest.create({
// //     data: {
// //         senderId : ramesh?.userId,
// //         receiverId : sachin?.userId
// //     }
// //    })
// // console.log(ramesh)
// // console.log(sachin)
// // console.log(createFriendRequest)
// // // const sendRequest = await prisma.friendRequest.create({
// // //     data: {
// // //         senderId
// // //     }
// // // })

   

// //     console.log();
// // }

// // main().catch(e=>{console.log(e)})