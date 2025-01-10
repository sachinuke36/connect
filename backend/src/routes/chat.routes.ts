import { io } from "../socketHandler";
import { Chat } from "../controllers/chatManagement";
import { Router } from "express";

const chat = new Chat(io);

export default (router: Router)=>{
    router.post("/sendChat",chat.sendChat);
    router.post("/getchats",chat.getChats);
    router.get("/getConvesations",chat.getConversationLists);
    
}