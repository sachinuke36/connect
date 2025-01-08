import { Friend } from "../controllers/friendManagement";
import { Router } from "express";

const friend = new Friend();

export default (router: Router)=>{
  router.post("/addFriend", friend.sendFriendRequest);
  router.post("/getFriendRequest", friend.getFriendRequests);
  router.post("/acceptFriendRequest",friend.acceptRequest);
  router.post("/rejectFriendRequest",friend.rejectFriendRequest);
  router.post("/getFriends",friend.getFriends)
}