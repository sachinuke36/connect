import { Route, Routes, useNavigate } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import { getCookies, useAuth } from "./contexts/AuthContexts"
import { useCallback, useEffect, useState } from "react"
import CreateGroup from "./components/CreateGroup"
// import Login from "./pages/Login"
import { ToastContainer, toast } from 'react-toastify';
import Room from "./components/VideoCalling"
import { useSocketContext } from "./contexts/SocketContext"
import IncomingCall from "./components/IncomingCall"
import { getUser } from "./action/authHandlers"


const App = () => {
  const { isLoggedIn, setIsLoggedIn} = useAuth();
  const {calling, setCalling} = useSocketContext();
  const userId = getUser()
  const cookies = getCookies();
  console.log(cookies)
  const {socket} = useSocketContext();
  const [showCall, setShowCall] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string>("");
  const [from, setFrom] = useState<string>("");

  useEffect(()=>{
    if(cookies) setIsLoggedIn(true);
    else setIsLoggedIn(false);
  },[cookies]);

  const handleIncomingCall = useCallback((data:any)=>{
    setFrom(data.from);
    setCalling(data.from)
    setRoomId(data.roomId)
    setShowCall(true);
    console.log("this is the setShow", showCall)
    console.log(data);
  },[])

  useEffect(()=>{
    socket?.on("incoming:call",handleIncomingCall);
    socket?.on("accepted:call",()=>{
      setShowCall(false);
    });
    
    return ()=>{    
      socket?.off("incoming:call",handleIncomingCall);
      socket?.off("accepted:call");
    }
  },[socket, handleIncomingCall])
 
  

  
  
  return (
    <div className="w-full h-full">
      <Routes>
        { !isLoggedIn ? <>
                    <Route path="/login" element={<Login/>}/>
                   </>
                : 
                  <>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/room/:id" element ={<Room/>}/>
                  </> 
          }
         <Route path="*"  element={ isLoggedIn ? <Home/> : <Login/>} ></Route>
         
      </Routes>
      <CreateGroup/>
      {showCall && <IncomingCall  from={from} roomId={roomId} setShowCall={setShowCall} />    }
      <ToastContainer/>
    </div>
  )
}

export default App
