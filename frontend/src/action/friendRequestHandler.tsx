import { useCallback } from "react";
import { getUser } from "./authHandlers";
import { useAppContext } from "../contexts/Contexts";

const friendRequestHandler = () => {
const {BACKEND_URL, setFriendRequests } = useAppContext()
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
        console.log(data,"from acceptRequest");
    } catch (error) {
        console.log("Error in acceptRequest!", error);
    }
},[])
  
return {sendRequest, getFriendRequest, acceptRequest}
}

export default friendRequestHandler


