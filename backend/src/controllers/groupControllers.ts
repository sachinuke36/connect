import express from 'express'
import { getAllUsers, getUser } from './authControllers';
import { prisma } from '../db/db.config';
import { User } from '@prisma/client';
import { Server } from 'socket.io';
import { getReceiverSocketId } from '../socketHandler';

export class Group{
    private io : Server
    constructor(io:Server) {
        this.io = io;
        this.createGroup = this.createGroup.bind(this);
        this.getGroup = this.getGroup.bind(this);
        this.getGroupMembers = this.getGroupMembers.bind(this);
        this.leaveGroup = this.leaveGroup.bind(this);
        this.removeUserFromGroup = this.removeUserFromGroup.bind(this);
    }

    async createGroup(req: express.Request, res: express.Response):Promise<any>{
        let { userId : adminId , membersIds, groupName, groupDescription} = req.body;
        // const users = await getAllUsers();
        // let membersIds = users.filter((u)=>members.includes(u.username)).map((u)=>u.userId)
        if(!Array.isArray(membersIds)) return res.json({error: "Invalid request"});
        // const adminId = (await getUser(username)).userId;
        membersIds.push(adminId);
        try {
            const response = await prisma.group.create({
                data: { groupName, description: groupDescription, membersIds, createdBy: adminId}
            });
            console.log(response);
            const user = (await getAllUsers()).find((u:any)=>u.userId === adminId);
            console.log("user", user);
            membersIds.forEach((membersId:string)=>{
                    if(membersId !== adminId){
                        const memberSocketId = getReceiverSocketId(membersId);
                        this.io.to(memberSocketId).emit("createGroup",{message:`${user?.fname} added you to ${groupName}`, data: { groupName, description: groupDescription, membersIds, createdBy: adminId}})
                    }
            })
            return res.status(200).json({message: "Group created successfully !"})
        } catch (error) {
            console.log(error);
            throw new Error("Something went wrong! ");
        }
    }

    async getGroup(req: express.Request, res: express.Response):Promise<any>{
        const { userId } = req.body;
        try {
        const users = await getAllUsers();
        const groups = await prisma.group.findMany({where: {membersIds: {has: userId}}});
        // const groupMembers = users.filter(u=> group.membersIds.includes(u.userId));
        return res.json({message:"group information fetched successfully!",data:groups})
        } catch (error) {
            console.log("Error in getGroup",error);
            throw new Error("Something went wrong!");
        }   
    }

    async getGroupMembers(groupId:string):Promise<Partial<User>[]>{
        try {
            const users = await getAllUsers();
            const group = await prisma.group.findFirst({where: {groupId}});
            const groupMembers = users.filter(u=> group.membersIds.includes(u.userId));
            return groupMembers;
        } catch (error) {
            console.log("Error in getGroupMembers", error);
            throw new Error("Something went wrong!");
        }
    }

    async removeUserFromGroup(req:express.Request, res:express.Response):Promise<any>{
        const { adminId, userId, groupId } = req.body;
        if(!adminId || !userId || !groupId) return res.json({error:"Missing fields"});
        try {
            const group = await prisma.group.findUnique({where:{groupId}});
            if(!group || group.createdBy !== adminId) return res.status(403).json({message: "Unauthorized"});
            const response = await prisma.group.update({where:{groupId},
            data:{
                membersIds: {
                    set : group.membersIds.filter((id:string)=>id !== userId)
                }
            }});
            return res.json({message:"User removed successfully!", data: response});
        } catch (error) {
            console.log("Error in removeUserFromGroup : ",error);
            throw new Error("Something went wrong!");
        }
    }

    async leaveGroup(req: express.Request, res: express.Response):Promise<any>{
        const {groupId, userId} = req.body;
        if(!userId || !groupId) return res.json({error:"Missing fields"});
        try {
            const group = await prisma.group.findUnique({where: {groupId}});
            // if(group || group.membersIds.find((id)=>id === userId)) return res.json({error: "Invalid input"});
            if(group.createdBy === userId){
                const response = await prisma.group.delete({where:{groupId}});
                return res.json({message: "group deleted successfully!",data: response});
            }else{
                const response = await prisma.group.update({where:{groupId},
                    data: {
                        membersIds : {
                            set: group.membersIds.filter((id:string)=> id !== userId)
                        }
                    }});
                return res.json({message: "left the group successfully!",data: response});
            }
            
        } catch (error) {
            console.log("Error in leveGroup : ",error);
            throw new Error("Something went wrong!");
        }
    }

    async updateGroup(req: express.Request, res: express.Response):Promise<any>{
        const {userId, groupId, groupName, description, membersIds} = req.body;
        try {
            let group = await prisma.group.findUnique({where:{groupId}});
            if(!group) return res.status(404).json({error: "Group not found!"});
            if(userId !== group.createdBy || !userId || !group.membersIds.includes(userId)) return res.status(403).json({error: "Unauthorized or user already in group!"});
            const response = await prisma.group.update({where:{groupId},
            data: { membersIds : {set: membersIds }, groupName, description }});
            return res.status(200).json({message: "updated group successfully!", data: response});
        } catch (error) {
            console.log("Error in updating groupInfo!",error);
            throw new Error("Something went wrong!");
        }
    }
}