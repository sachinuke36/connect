import { useNavigate } from "react-router-dom";
import { getUser } from "../action/authHandlers";
import { useSocketContext } from "../contexts/SocketContext"
import { useEffect } from "react";


const IncomingCall = ({from, roomId, setShowCall}:{from: string , roomId:string, setShowCall:any} ) => {
    const {socket} = useSocketContext();
    const navigate = useNavigate();
    const userId = getUser()
    const handleAcceptCall = ()=>{
        setShowCall(false)
        socket?.emit("room:join",{to: from, from:userId, roomId});
        navigate("/room/"+ roomId);
    }
    useEffect(()=>{
        socket?.on("incoming:call",(data:any)=>{
            console.log("incoming call: ",data)
        })
        return ()=>{
            socket?.off("incoming:call")
        }
    },[socket])


  return (
    <div className="z-10 absolute border p-2 rounded-md top-2 right-2 bg-white flex flex-col gap-2 items-center justify-center">
      <p>Incomming call from {from}</p>
      <button className="border p-1 rounded-md bg-green-700" onClick={handleAcceptCall}
      >accept</button>
    </div>
  )
}

export default IncomingCall
