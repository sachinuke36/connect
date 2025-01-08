import { prisma } from '../db/db.config';
import express from 'express'
import { Group } from './groupControllers';
export class groupChat{

    constructor(){
        this.sendGroupChat = this.sendGroupChat.bind(this)
    }

    async sendGroupChat(req: express.Request, res: express.Response):Promise<any>{
        const { groupId, senderId,messageBody } = req.body;
        try {
            const response = await prisma.groupChat.create({data:{
                groupId,
                senderId ,
                messageBody 
            }})
            return res.status(200).json({message:"message sent successfully!", data: response})
        } catch (error) {
            console.log("Error in sendgroupchat",error);
            throw new Error("Something went wrong!")
        }
    }

    async getGroupChats(req: express.Request, res: express.Response):Promise<any>{
        const {groupId} = req.body;
        try {
            const groupChats = await prisma.groupChat.findMany({where: {groupId}});
            return res.json({message:" groupChats fetched successfully!", data: groupChats});
        } catch (error) {
            console.log("Error in getGroupChats",error);
            throw new Error("Something went wrong!")
        }
    }

}