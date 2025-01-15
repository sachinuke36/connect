import { Conversation, Message, User } from '@prisma/client';
import { prisma } from '../db/db.config';
import express from 'express'
import { getAllUsers, getUser } from './authControllers';
import { Server } from "socket.io";
import { getReceiverSocketId } from '../socketHandler';

export class Chat{
    private chats: Message[];
    private io: Server;
    constructor(io: Server){
        this.chats = [];
        this.io = io
        this.getConversationLists = this.getConversationLists.bind(this);
        this.createConversation = this.createConversation.bind(this);
        this.getChats = this.getChats.bind(this);
        this.sendChat = this.sendChat.bind(this);
        this.getConversationsOfUser = this.getConversationsOfUser.bind(this);
    }
   async createConversation(user : Partial<User>, friendId:string){
    if(!user) return;
    try {
            let conversation = await prisma.conversation.findFirst({where: {
                participantIds: { hasEvery : [user.userId!, friendId]}
            }})
        
            if(!conversation){
                conversation = await prisma.conversation.create({data:{
                    participantIds: [user.userId!,friendId],
                    participants: { connect: [{ userId: user.userId }, { userId: friendId }] }
                }})
            }
            return conversation
    } catch (error) {
        console.log("Error in createConversation: ", error)
    }
   }

   async getConversationsOfUser(user: Partial<User>):Promise<Conversation[]>{
        let conversation = await prisma.conversation.findMany({
            where: {
                participantIds : {
                    hasSome : [user.userId!]
                }
            }
        });
        return conversation;
   }

   async sendChat(req: express.Request, res: express.Response):Promise<any>{
        const { username, friendId, messageBody } = req.body;
        // const friendId = (await getUser(friendUsername)).userId
        try {
                const user = await getUser(username);
                if(!user) return;
                const conversation = await this.createConversation(user,friendId);
                const message = await prisma.message.create({
                            data: {
                                conversationId : conversation?.conversationId!,
                                senderId : user.userId!,
                                body : messageBody!
                            }
                        });
                    // socket connection for message goes here
                    const friendSocketId = getReceiverSocketId(friendId);
                        this.io.to(friendSocketId).emit("newMessage",{senderId: user.userId, body:messageBody, sent_at: Date.now()})
                return res.json({message: " Message Sent Successfully !", data: message});
        } catch (error) {
            console.log("Error in sendChat: ",error);
            throw new Error("Error in sending Message");
        }
   }

   async getChats(req : express.Request, res: express.Response):Promise<any>{
        const { friendUserId: friendId, username } = req.body;

        if(!friendId || !username) return res.json({error: "Provide all details"})
        // const friendId = (await getUser(friendUserId)).userId
        const user = await getUser(username);
        if(!user) return;
        const conversationId = (await this.createConversation(user, friendId))?.conversationId;
        this.chats = await prisma.message.findMany({
            where: {conversationId}
        });
        return res.json({message:"Chats fetched successfully!",data:this.chats});
   }

   async getConversationLists(req:express.Request, res: express.Response):Promise<any>{
        const { username } = req.body;
        try {
            const user = await getUser(username);
            if(!user) return
            const users = await getAllUsers();
            const conversationIds = (await this.getConversationsOfUser(user)).map((i)=>i.conversationId) // where user is involved
            const messages = await prisma.message.findMany({
                where: {conversationId: {in : conversationIds}}
            });
            const senderIds = messages.map((m)=>{
                if(m.senderId !== user.userId) return m.senderId
            });
            const friendNames = users.filter((u)=> senderIds.includes(u.userId));
            return res.json({messages: "conversationsLists fetched successfully!",data:friendNames});
        } catch (error) {
            console.log("Error in getConversationLists : ",error);
            throw new Error("Something went wrong!");
        }   
   }

}
