import { useCallback } from "react";
import { getUser } from "./authHandlers";
import { useAppContext } from "../contexts/Contexts";
import { useSocketContext } from "../contexts/SocketContext";

const friendRequestHandler = () => {
const {BACKEND_URL, setFriendRequests, allUsers, setFriends, getAllUsers } = useAppContext();
const {socket} = useSocketContext()
const userId = getUser();

 const sendRequest = useCallback(async(receiverId : string)=>{
    try {
        const res = await fetch(  BACKEND_URL+ "/api/addFriend", {
            method : "POST",
            credentials : "include",
            headers: { "Content-Type": "application/json"},
            body : JSON.stringify({userId,receiverId })
        });
        const data = (await res.json()).data;
        // console.log(data);
        socket?.emit("friend-request-sent", { senderId: userId, receiverId });
        setFriendRequests((prev: any) => [
            ...prev,
            { senderId: userId, receiverId }
        ]);


    } catch (error) {
        console.log("Error in SendRequest!", error);
    }
    
},[]);

 const getFriendRequest = useCallback(async()=>{
    try {
        const res = await fetch(  BACKEND_URL+ "/api/getFriendRequest", {
            method : "POST",
            credentials : "include",
            headers: { "Content-Type": "application/json"},
            body : JSON.stringify({userId})
        });
        const data = (await res.json()).data;
        // console.log("from friendRequestHander",data);
        setFriendRequests(data);
        return data;
    } catch (error) {
        console.log("Error in SendRequest!", error);
    }
},[]);

const acceptRequest = useCallback(async(senderId:string)=>{
    try {
        const res = await fetch(BACKEND_URL + "/api/acceptFriendRequest",{
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json"},
            body : JSON.stringify({senderId, userId})
        });
        const data = (await res.json()).data;
        if(!allUsers) await getAllUsers()

        if(allUsers){
            const friend = allUsers?.find((u:any)=> u.userId === senderId);
            setFriends((prev: any) => [...prev, friend]);
            console.log("friend from acceptRequest : ", friend);
        }

        socket?.emit("friend-request-accepted", { senderId, userId });
        // set the friends state here
        
        // const friend = allUsers?.find((u:any)=> u.userId === senderId);
        // setFriends((prev: any) => [...prev, friend]);
        console.log(data,"from acceptRequest");
    } catch (error) {
        console.log("Error in acceptRequest!", error);
    }
},[socket, userId, allUsers, setFriends, getAllUsers])
  
return {sendRequest, getFriendRequest, acceptRequest}
}

export default friendRequestHandler


