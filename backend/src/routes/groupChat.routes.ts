import { groupChat } from "../controllers/groupChatControllers";
import { Router } from "express";

const groupchats = new groupChat();

export default (router: Router)=>{
    router.post("/sendgroupchat",groupchats.sendGroupChat);
    router.post("/getgroupchats",groupchats.getGroupChats)
}