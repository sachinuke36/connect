import { User } from "@prisma/client";
import { prisma } from "../db/db.config";
import express from "express"
import { getAllUsers, getUser } from "./authControllers";
import { Server } from "socket.io";
import { getReceiverSocketId } from "../socketHandler";


export class Friend{
    private io : Server;
    constructor(io : Server) {
        this.io = io
        this.sendFriendRequest = this.sendFriendRequest.bind(this);
        this.acceptRequest = this.acceptRequest.bind(this);
        this.rejectFriendRequest = this.rejectFriendRequest.bind(this);
        this.isFriend = this.isFriend.bind(this);
    }
    

   async sendFriendRequest(req:express.Request, res:express.Response):Promise<any>{
        const { userId:senderId, receiverId } = req.body;
        if(!senderId || !receiverId) return;
        try {
            const isFriend = await this.isFriend(senderId, receiverId);
            if(isFriend) return res.json({message:"Already friends !"});
            const sendRequest = await prisma.friendRequest.create({
            data : { senderId, receiverId }
            });
            const receiverSocketId = getReceiverSocketId(receiverId);
            this.io.to(receiverSocketId).emit("friend-request-sent", { senderId, receiverId });
            return res.json({message: "friend request sent successfully!", data: sendRequest});
        } catch (error) {
            console.log("Error in sending friend request! : ", error)
            throw new Error("Something went wrong!")
        }
    }

    async acceptRequest(req: express.Request, res: express.Response):Promise<any>{
        const { senderId, userId} = req.body;
        if(!senderId || !userId) return;
        try {
          
            const friendRequest = await prisma.friendRequest.update({
            where:{ receiverId_senderId: {receiverId: userId, senderId: senderId}},
            data:{
                status: "ACCEPTED"
            }}) 
            const senderSocketId = getReceiverSocketId(senderId);
            this.io.to(senderSocketId).emit("friend-request-accepted",{message: "friend request accepted", userId})
            return res.json({message: " friend requested accepted!", data: friendRequest});
        } catch (error) {
            console.log("Error in accepting Friend Request: ",error);
            throw new Error("Something went wrong !");
        }
    }
    
    async rejectFriendRequest(req: express.Request, res: express.Response):Promise<any>{
        const { senderId, username } = req.body;
        if(!senderId || !username) return;
        try {
            const user = await prisma.user.findFirst({where: {username}});
            if(!user) return res.json({message: "No user found !"});
            const friendRequest = await prisma.friendRequest.update({
            where:{ receiverId_senderId: {receiverId: user.userId, senderId: senderId}},
            data:{
                status: "REJECTED"
            }}) 
        } catch (error) {
            console.log("Error in accepting Friend Request: ",error);
            throw new Error("Something went wrong !");
        }
    }

    async isFriend(senderId: string, receiverId:string):Promise<boolean>{
        try {
            const isFriend = await prisma.friendRequest.findFirst({
                where:{ OR: [{ senderId,receiverId }, {senderId: receiverId, receiverId: senderId}],
                status: "ACCEPTED"
             },
            })
            return Boolean(isFriend)
        } catch (error) {
            console.log("Error in isFriend");
            throw new Error("Something went wrong!");
        }
        
    }

    async getFriendRequests(req: express.Request, res:express.Response):Promise<any>{
        const { userId } = req.body;
        if(!userId) return;
        try {
            let friendRequests = await prisma.friendRequest.findMany({
                where: {OR:[{ receiverId : userId},{senderId: userId}],
            status: "PENDING"}
            });
            const friendRequestIds = friendRequests.map((i)=>i.senderId);
            return res.json({message:"Friend Request Ids", data: friendRequests});
        } catch (error) {
            console.log("Error in getFriendRequests : ",error);
        }
    }

    async getFriends(req: express.Request, res: express.Response):Promise<any>{
        const { username } = req.body;
        if(!username) return;
        const userId = (await getUser(username))?.userId;
        if(!userId) return;
            try {
                const friends = await prisma.friendRequest.findMany({
                where: { OR : [{senderId : userId}, {receiverId: userId}],
                status: "ACCEPTED" }});
                const friendsIds = friends.map((i)=>{
                    if(i.receiverId === userId) return i.senderId;
                    else return i.receiverId;
                });
                const allusers = await getAllUsers();
                if(!allusers) return;
                const friendNames = allusers.filter((u)=>friendsIds.includes(u.userId!))
                return res.json({messsage: "friendslists fetched successfully!", data: friendNames})
            } catch (error) {
                console.log("Error in getFriends", error);
                throw new Error("Something went wrong!");
            }
    }


}