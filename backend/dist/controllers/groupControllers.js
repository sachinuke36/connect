"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Group = void 0;
const authControllers_1 = require("./authControllers");
const db_config_1 = require("../db/db.config");
const socketHandler_1 = require("../socketHandler");
class Group {
    io;
    constructor(io) {
        this.io = io;
        this.createGroup = this.createGroup.bind(this);
        this.getGroup = this.getGroup.bind(this);
        this.getGroupMembers = this.getGroupMembers.bind(this);
        this.leaveGroup = this.leaveGroup.bind(this);
        this.removeUserFromGroup = this.removeUserFromGroup.bind(this);
    }
    async createGroup(req, res) {
        let { userId: adminId, membersIds, groupName, groupDescription } = req.body;
        if (!adminId || !membersIds || !groupName)
            return;
        if (!Array.isArray(membersIds))
            return res.json({ error: "Invalid request" });
        membersIds.push(adminId);
        try {
            const response = await db_config_1.prisma.group.create({
                data: { groupName, description: groupDescription, membersIds, createdBy: adminId }
            });
            console.log(response);
            const user = (await (0, authControllers_1.getAllUsers)()).find((u) => u.userId === adminId);
            console.log("user", user);
            membersIds.forEach((membersId) => {
                if (membersId !== adminId) {
                    const memberSocketId = (0, socketHandler_1.getReceiverSocketId)(membersId);
                    this.io.to(memberSocketId).emit("createGroup", { message: `${user?.fname} added you to ${groupName}`, data: { groupName, description: groupDescription, membersIds, createdBy: adminId } });
                }
            });
            return res.status(200).json({ message: "Group created successfully !" });
        }
        catch (error) {
            console.log(error);
            throw new Error("Something went wrong! ");
        }
    }
    async getGroup(req, res) {
        const { userId } = req.body;
        if (!userId)
            return;
        try {
            const users = await (0, authControllers_1.getAllUsers)();
            const groups = await db_config_1.prisma.group.findMany({ where: { membersIds: { has: userId } } });
            // const groupMembers = users.filter(u=> group.membersIds.includes(u.userId));
            return res.json({ message: "group information fetched successfully!", data: groups });
        }
        catch (error) {
            console.log("Error in getGroup", error);
            throw new Error("Something went wrong!");
        }
    }
    async getGroupMembers(groupId) {
        if (!groupId)
            return null;
        try {
            const users = await (0, authControllers_1.getAllUsers)();
            const group = await db_config_1.prisma.group.findFirst({ where: { groupId } });
            const groupMembers = users.filter(u => group?.membersIds.includes(u.userId));
            return groupMembers;
        }
        catch (error) {
            console.log("Error in getGroupMembers", error);
            throw new Error("Something went wrong!");
        }
    }
    async removeUserFromGroup(req, res) {
        const { adminId, userId, groupId } = req.body;
        if (!adminId || !userId || !groupId)
            return res.json({ error: "Missing fields" });
        try {
            const group = await db_config_1.prisma.group.findUnique({ where: { groupId } });
            if (!group || group.createdBy !== adminId)
                return res.status(403).json({ message: "Unauthorized" });
            const response = await db_config_1.prisma.group.update({ where: { groupId },
                data: {
                    membersIds: {
                        set: group.membersIds.filter((id) => id !== userId)
                    }
                } });
            return res.json({ message: "User removed successfully!", data: response });
        }
        catch (error) {
            console.log("Error in removeUserFromGroup : ", error);
            throw new Error("Something went wrong!");
        }
    }
    async leaveGroup(req, res) {
        const { groupId, userId } = req.body;
        if (!userId || !groupId)
            return res.json({ error: "Missing fields" });
        try {
            const group = await db_config_1.prisma.group.findUnique({ where: { groupId } });
            if (!group)
                return;
            // if(group || group.membersIds.find((id)=>id === userId)) return res.json({error: "Invalid input"});
            if (group.createdBy === userId) {
                const response = await db_config_1.prisma.group.delete({ where: { groupId } });
                return res.json({ message: "group deleted successfully!", data: response });
            }
            else {
                const response = await db_config_1.prisma.group.update({ where: { groupId },
                    data: {
                        membersIds: {
                            set: group.membersIds.filter((id) => id !== userId)
                        }
                    } });
                return res.json({ message: "left the group successfully!", data: response });
            }
        }
        catch (error) {
            console.log("Error in leveGroup : ", error);
            throw new Error("Something went wrong!");
        }
    }
    async updateGroup(req, res) {
        const { userId, groupId, groupName, description, membersIds } = req.body;
        if (!userId || !groupId)
            return;
        try {
            let group = await db_config_1.prisma.group.findUnique({ where: { groupId } });
            if (!group)
                return res.status(404).json({ error: "Group not found!" });
            if (userId !== group.createdBy || !userId || !group.membersIds.includes(userId))
                return res.status(403).json({ error: "Unauthorized or user already in group!" });
            const response = await db_config_1.prisma.group.update({ where: { groupId },
                data: { membersIds: { set: membersIds }, groupName, description } });
            return res.status(200).json({ message: "updated group successfully!", data: response });
        }
        catch (error) {
            console.log("Error in updating groupInfo!", error);
            throw new Error("Something went wrong!");
        }
    }
}
exports.Group = Group;
//# sourceMappingURL=groupControllers.js.map