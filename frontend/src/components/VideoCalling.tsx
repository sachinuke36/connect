
import { useCallback, useEffect, useRef, useState } from "react";
import { useSocketContext } from "../contexts/SocketContext";
import { useAppContext } from "../contexts/Contexts";
import { getUser } from "../action/authHandlers";




const Room = ()=>{
    const {socket,calling } = useSocketContext();
    const {selected, allUsers} = useAppContext();
    const userId = getUser();
    // const navigate = useNavigate();
    let localStream :any = null;
    let callInfo : string[] = [];
    const localVideoRef = useRef<HTMLVideoElement | null >(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null >(null);
    const [endCall, setEndCall] = useState<boolean>(false);
    const servers : RTCConfiguration = {
        iceServers : [ { urls : "stun:stun.l.google.com:19302"}]
    };


    const PeerConnection = (function(){
        let peerConnection: RTCPeerConnection | null = null;
        const createPeerConnection = ()=>{
            peerConnection = new RTCPeerConnection(servers);

            // add local stream to peer connection
            if(localStream){
                localStream.getTracks().forEach((track:any )=> {
                    peerConnection?.addTrack(track, localStream)
                });
            }
           
            //listen to remote stream and add to peer connection
            peerConnection.ontrack = function(event:any){
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            }

            // listen to ice candidate
            peerConnection.onicecandidate = function(event:any){
                if(event.candidate){
                    socket.emit("icecandidate",{candidate: event.candidate, to: calling})
                }
            }
            return peerConnection;
        }
        return {
            getInstance : ()=>{
                if(!peerConnection){
                    peerConnection = createPeerConnection()
                }
                return peerConnection;
            }
        }
    })();

     const startCall = useCallback(async()=>{
        if (!localStream) {
            console.error("Local stream not initialized");
            return;
        }

        const pc = PeerConnection.getInstance();
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer",{from:userId ,to:calling ,offer: pc.localDescription});
    },[localStream, socket, userId, selected]);

    const endCallHandler = useCallback(()=>{
        const pc = PeerConnection.getInstance();
        if(pc){
            pc.close();
            socket?.emit("call-ended",{callInfo})
        }
        // console.log(pc);
        setEndCall(false);
    },[])
    

    const startMyVideo = useCallback(async()=>{
        try {
            const stream = await navigator.mediaDevices.getUserMedia({audio:true, video:true});
            localStream = stream;
            if (localStream && localVideoRef.current) {
                localVideoRef.current.srcObject = localStream;
            }

        } catch (error) {
            console.log("error in start my video: ", error);
        }
    },[socket, localVideoRef ])

   
    useEffect(()=>{
        socket?.on("offer",async({from, to, offer}:any)=>{
            const pc = PeerConnection.getInstance();
            await pc.setRemoteDescription(offer);
            const ans = await pc.createAnswer();
            await pc.setLocalDescription(ans);
            callInfo = [from, to];
            socket.emit("answer",{from, to, answer: pc.localDescription});
        });

        socket?.on("answer",async({from, to, answer}:any)=>{
                const pc = PeerConnection.getInstance()
                await pc.setRemoteDescription(answer);
                setEndCall(true);
                callInfo = [from, to];
                socket.emit("end-call",{from, to})
        })

        socket?.on("icecandidate",async({candidate}:any)=>{
            const pc = PeerConnection.getInstance();
            await pc.addIceCandidate(new RTCIceCandidate(candidate))
        });
        socket?.on("end-call",()=>{
            setEndCall(true);
        });
        socket?.on("call-ended",()=>{
            endCallHandler();
            
        })

        return ()=>{
            socket?.off("offer");
            socket?.off("answer");
            socket?.off("icecandidate");
            socket?.off("end-call")
        }
    },[socket]);


  
    

    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        (async () => {
            await startMyVideo();
            
                startCall();
              
          })();
    
      }, [ socket,  startMyVideo]);

      

    return(<div className="flex flex-col gap-4 h-[100vh] bg-[#06121c]" >
        <div className="flex  gap-5 mt-10 mx-auto justify-center">
        {/* local video */}
        <div>
            <video className="border rounded-md" ref = {localVideoRef} controls width={300} height={300} playsInline muted autoPlay></video>
            <p className="text-center text-white text-2xl font-extrabold">You</p>
        </div>
        {/* remote video */}
        <div>
            <video className="border rounded-md" ref={remoteVideoRef} playsInline controls  autoPlay></video>
            <p className="text-center text-2xl text-white font-extrabold">{allUsers?.find((u:any)=>u.userId === calling)?.fname}</p>
        </div>

        </div>
       {endCall && <button onClick={endCallHandler} className=" p-1 w-[100px] mx-auto rounded-sm bg-red-400 text-red-950 hover:text-white hover:bg-red-700">End-call</button>}

    </div>)
}

export default Room;





