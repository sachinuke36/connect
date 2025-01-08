import { useCallback, useEffect } from "react";
import { useAppContext } from "../contexts/Contexts"
import { getUser } from "./authHandlers";

const GroupChatHandler = () => {
    const {BACKEND_URL, selected, setSelected} = useAppContext();
    
    const getGroupChats = useCallback(async()=>{
        try {
            if(selected?.type === "group"){
                const res = await fetch(BACKEND_URL + "/api/getgroupchats",{
                    method: "POST",
                    credentials : "include",
                    headers : {"Content-Type":"application/json"},
                    body : JSON.stringify({groupId : selected?.id})
                })
                const data = (await res.json()).data;
                console.log(data)
            }
        } catch (error) {
            console.log("Error in getGroupChats", error)
        }
    },[selected,setSelected, BACKEND_URL ])

     useEffect(() => {
          if(selected?.type === "group") getGroupChats();
        }, [getGroupChats, selected]);



    

 const sendGroupChat = async(messageBody:string,groupId:string,)=>{
    const userId = getUser()
    try {
        const res = await fetch(BACKEND_URL + "/api/sendgroupchat",{
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json"},
            body : JSON.stringify({ groupId, senderId : userId ,messageBody })
        })
        const data = (await res.json()).data;
        console.log(data);
    } catch (error) {
        console.log("Error in sendChat",error);
        throw new Error("Something went wrong!")
    }
}

  return { getGroupChats, sendGroupChat}
}

export default GroupChatHandler