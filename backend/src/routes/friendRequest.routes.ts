import { Friend } from "../controllers/friendManagement";
import { Router } from "express";
import { io } from "../socketHandler";

const friend = new Friend(io);

export default (router: Router)=>{
  router.post("/addFriend", friend.sendFriendRequest);
  router.post("/getFriendRequest", friend.getFriendRequests);
  router.post("/acceptFriendRequest",friend.acceptRequest);
  router.post("/rejectFriendRequest",friend.rejectFriendRequest);
  router.post("/getFriends",friend.getFriends)
}