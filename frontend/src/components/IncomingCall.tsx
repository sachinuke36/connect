import { useNavigate } from "react-router-dom";
import { getUser } from "../action/authHandlers";
import { useSocketContext } from "../contexts/SocketContext"
import { useEffect } from "react";
import { useAppContext } from "../contexts/Contexts";


const IncomingCall = ({from, roomId, setShowCall}:{from: string , roomId:string, setShowCall:any} ) => {
    const {socket} = useSocketContext();
    const navigate = useNavigate();
    const {allUsers} = useAppContext()
    const userId = getUser();
    const fname = allUsers?.find((u:any)=>u.userId === from).fname;
    const lname = allUsers?.find((u:any)=>u.userId === from).lname;
    const handleAcceptCall = ()=>{
        setShowCall(false)
        socket?.emit("room:join",{to: from, from:userId, roomId});
        socket?.emit("accepted:call",{from, to: userId})
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
    <div className="z-10 absolute text-white  p-2 rounded-md top-2 right-2 bg-[#394855] flex flex-col gap-2 items-center justify-center">
      <p>Incomming call from {fname} {lname}</p>
      <button className=" p-1 text-green-900 rounded-md bg-green-600" onClick={handleAcceptCall}
      >accept</button>
    </div>
  )
}

export default IncomingCall
