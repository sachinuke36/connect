import { io } from "../socketHandler";
import { Group } from "../controllers/groupControllers";
import { Router } from "express";

const group = new Group(io);

export default (router: Router)=>{
    router.post("/creategroup",group.createGroup);
    router.post("/getgroup",group.getGroup);
    router.post("/removeuserfromgroup", group.removeUserFromGroup);
    router.post("/leavegroup",group.leaveGroup);
    router.post("/updategroup",group.updateGroup);
}