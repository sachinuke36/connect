import { useAppContext } from "../contexts/Contexts";
import { useSocketContext } from "../contexts/SocketContext";
import { getUser } from "./authHandlers";


const chatHandler = () => {
    const {socket} = useSocketContext();
    const {chats, setChats} = useAppContext();
    const sendChat = async(messageBody:string,friendId:string, BACKEND_URL:string )=>{
        if(!friendId) return;
        const user = localStorage.getItem("user");
        const userId = getUser()
        if(!user) return;
        const username = (JSON.parse(user)).username;
        console.log({username, friendId, messageBody})
        try {
            const res = await fetch(BACKEND_URL + "/api/sendChat",{
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json"},
                body : JSON.stringify({ username, friendId, messageBody })
            })
            const data = (await res.json()).data;
            socket?.emit("newMessage",{ username, friendId, messageBody })
            setChats((prev:any)=>[...prev, {senderId:userId, body: messageBody, sent_at: Date.now() }]);
            console.log(data);
        } catch (error) {
            console.log("Error in sendChat",error);
            throw new Error("Something went wrong!")
        }
    }
  return  {sendChat}
  
}

export default chatHandler




 