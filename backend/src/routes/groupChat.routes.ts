import { io } from "../socketHandler";
import { groupChat } from "../controllers/groupChatControllers";
import { Router } from "express";

const groupchats = new groupChat(io);

export default (router: Router)=>{
    router.post("/sendgroupchat",groupchats.sendGroupChat);
    router.post("/getgroupchats",groupchats.getGroupChats)
}