
import { useCallback, useEffect, useRef, useState } from "react";
import { useSocketContext } from "../contexts/SocketContext";
// import peer from "../services/peer";
import { useAppContext } from "../contexts/Contexts";
import { getUser } from "../action/authHandlers";




const Room = ()=>{
    const {socket,calling ,setCalling} = useSocketContext();
    const {selected} = useAppContext();
    const userId = getUser()
    let localStream :any = null;
    // const [localStream, setLocalstream] = useState<any>();
    const localVideoRef = useRef<HTMLVideoElement | null >(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null >(null);
    const [remoteStream, setRemoteStream] = useState<any>();

    const servers : RTCConfiguration = {
        iceServers : [ { urls : "stun:stun.l.google.com:19302"}]
    };

    

    const PeerConnection = (function(){
        let peerConnection: RTCPeerConnection | null = null;
        const createPeerConnection = ()=>{
            peerConnection = new RTCPeerConnection(servers);

            // add local stream to peer connection
            // console.log('LOCAL stream',localStream)
            if(localStream){
                localStream.getTracks().forEach((track:any )=> {
                    // console.log("track",track)
                    peerConnection?.addTrack(track, localStream)
                });
            }
           
            //listen to remote stream and add to peer connection
            peerConnection.ontrack = function(event:any){
                if (remoteVideoRef.current) {
                    // console.log('Remote track received:', event.track); // Log the track
                    // console.log("remote Stream",event.streams[0])
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            }

            // listen to ice candidate
            peerConnection.onicecandidate = function(event:any){
                // console.log("from ice candidate: ", event.candidate);
                if(event.candidate){
                    // socket.emit("icecandidate",{candidate: event.candidate, to: selected?.id})
                    socket.emit("icecandidate",{candidate: event.candidate, to: calling})
                    //new changes
                    // socket.on("user:joined",({userId}:{userId : string})=>{
                    //     socket.emit("icecandidate",{candidate: event.candidate, to: userId})
                    // });
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
        // console.log("from startCall",offer);
        // socket.emit("offer",{from:userId ,to:selected?.id ,offer: pc.localDescription});
        socket.emit("offer",{from:userId ,to:calling ,offer: pc.localDescription});
        //new changes
        // socket.on("user:joined",({userId}:{userId : string})=>{
        //  socket.emit("offer",{from:userId ,to:userId ,offer: pc.localDescription});
        // })
    },[localStream, socket, userId, selected])
    

    const startMyVideo = useCallback(async()=>{
        // console.log("my video started")
        try {
            const stream = await navigator.mediaDevices.getUserMedia({audio:true, video:true});
            // setLocalstream(stream);
            localStream = stream;
            // console.log(localStream)
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
            socket.emit("answer",{from, to, answer: pc.localDescription});
        });

        socket?.on("answer",async({from, to, answer}:any)=>{
                const pc = PeerConnection.getInstance()
                await pc.setRemoteDescription(answer);
        })

        socket?.on("icecandidate",async({candidate}:any)=>{
            // console.log("candidate",candidate);
            const pc = PeerConnection.getInstance();
            await pc.addIceCandidate(new RTCIceCandidate(candidate))
        });

        return ()=>{
            socket?.off("offer");
            socket?.off("answer");
            socket?.off("icecandidate")
        }
    },[socket]);


  
    

    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        // console.log("hii");
        (async () => {
            await startMyVideo();
            
                startCall();
              
          })();
    
      }, [ socket,  startMyVideo]);

      

    return(<div className="flex  gap-5 mt-10 mx-auto justify-center">
        {/* local video */}
        <video ref = {localVideoRef} controls width={300} height={300} playsInline muted autoPlay></video>
        {/* remote video */}
        <video ref={remoteVideoRef} playsInline controls  autoPlay></video>
    </div>)
}

export default Room;





// import { useCallback, useEffect, useRef, useState } from "react";
// import { useSocketContext } from "../contexts/SocketContext";
// import peer from "../services/peer";

// const Room = () => {
//   const { socket } = useSocketContext();
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//   const localVideoRef = useRef<HTMLVideoElement | null>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

//   const handleIncomingCall = useCallback(async ({ offer, from }:any) => {
//     const stream = await navigator.mediaDevices.getUserMedia({
//       audio: true,
//       video: true,
//     });
//     setLocalStream(stream);

//     // Add local tracks to the peer connection
//     stream.getTracks().forEach((track) => peer.peer.addTrack(track, stream));

//     // Create an answer for the received offer
//     const answer = await peer.getAnswer(offer);
//     socket.emit("call:accepted", { to: from, answer });
//   }, [socket]);

//   const handleCallAccepted = useCallback(
//     async ({ answer }:any) => {
//       await peer.setLocalDescription(answer);
//     },
//     [socket]
//   );

//   const handleRemoteTrack = useCallback((event:any) => {
//     const [remoteStream] = event.streams;
//     setRemoteStream(remoteStream);
//   }, []);

//   const startCall = useCallback(async () => {
//     if (!localStream) {
//       alert("Please enable your video first!");
//       return;
//     }

//     // Add local tracks to the peer connection
//     localStream.getTracks().forEach((track) => peer.peer.addTrack(track, localStream));

//     const offer = await peer.getOffer();
//     socket.emit("call:started", { offer });
//   }, [localStream, socket]);

//   useEffect(() => {
//     // Initialize local video
//     const startMyVideo = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           audio: true,
//           video: true,
//         });
//         setLocalStream(stream);
//       } catch (error) {
//         console.error("Error starting video:", error);
//       }
//     };

//     startMyVideo();
//   }, []);

//   useEffect(() => {
//     // Attach local stream to the video element
//     if (localVideoRef.current && localStream) {
//       localVideoRef.current.srcObject = localStream;
//     }
//   }, [localStream]);

//   useEffect(() => {
//     // Attach remote stream to the video element
//     if (remoteVideoRef.current && remoteStream) {
//       remoteVideoRef.current.srcObject = remoteStream;
//     }
//   }, [remoteStream]);

//   useEffect(() => {
//     // Set up peer connection event listeners
//     peer.peer.addEventListener("track", handleRemoteTrack);

//     // Socket event listeners
//     socket.on("call:incoming", handleIncomingCall);
//     socket.on("call:accepted", handleCallAccepted);

//     return () => {
//       socket.off("call:incoming", handleIncomingCall);
//       socket.off("call:accepted", handleCallAccepted);
//       peer.peer.removeEventListener("track", handleRemoteTrack);
//     };
//   }, [handleIncomingCall, handleCallAccepted, handleRemoteTrack, socket]);

//   return (
//     <div>
//       <h1>Video Call Room</h1>
//       <div>
//         <video ref={localVideoRef} width={320} height={240} autoPlay muted playsInline />
//         <video ref={remoteVideoRef} width={320} height={240} autoPlay playsInline />
//       </div>
//       <button onClick={startCall}>Start Call</button>
//     </div>
//   );
// };

// export default Room;








// import { useCallback, useEffect, useState } from "react";
// import { useSocketContext } from "../contexts/SocketContext";
// import { toast } from "react-toastify";
// import ReactPlayer from "react-player";
// import peer from "../services/peer";

// const Room = ()=>{
//     const {socket} = useSocketContext();
//     const [ remoteSocketId , setRemoteSocketId ] = useState<string | null>(null);
//     const [mystream, setMyStream] = useState<MediaStream | null>(null);
//     const [remoteStream, setRemoteStream] = useState<any>();

//     const handlUserJoined = useCallback(({userId, socketId}:{userId:string, socketId:string})=>{
//         console.log("hii")
//         toast.success("User Joined",{position:"top-right"});
//         setRemoteSocketId(socketId);
//         console.log({userId, socketId});
//     },[]);

//    const handleCallUser = useCallback(async()=>{
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true});
//     const offer = await peer.getOffer();
//     socket.emit("callinguser",{to: remoteSocketId, offer})
//     setMyStream(stream);
//    },[remoteSocketId, socket]);


// const sendStream = useCallback(() => {
//     if (mystream) {
//         mystream.getTracks().forEach((track) => {
//             // Check if track is already added
//             const senderExists = peer.peer.getSenders().some(sender => sender.track === track);
//             if (!senderExists) {
//                 peer.peer.addTrack(track, mystream);
//             }
//         });
//     }
// }, [mystream]);


//    const handleCallAccepted = useCallback(async({from, ans}:any)=>{
//     console.log("handleAccepted",ans)
//     await peer.setLocalDescription(ans);
//     sendStream()
//    },[socket, mystream])

//    const handleIncomingCall = useCallback(async({from, offer}:any)=>{
//     setRemoteSocketId(from);
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true});
//     setMyStream(stream);
//     const ans = await peer.getAnswer(offer);
//     socket?.emit("call:accepted", {to: from, ans})
//    },[socket])

//    const handleNegotiation = useCallback(
//     async()=>{
//         const offer = await peer.getOffer();
//         socket.emit("peer:nego:needed",{offer, to: remoteSocketId })
//     }
//    ,[remoteSocketId, socket])

//    const handleNegotiationIncomming = useCallback(async({from, offer}:any)=>{
//     const ans = await peer.getAnswer(offer);
//     socket.emit("peer:nego:done",{to : from, ans});

//    },[socket])

//    const handleNegotiationFinal = useCallback(async({ans}:any)=>{
//     console.log("handleNego",ans)
//     await peer.setLocalDescription(ans)
//    },[socket])


//    useEffect(()=>{
//     peer.peer.addEventListener("negotiationneeded",handleNegotiation)
//     return ()=>{
//         peer.peer.removeEventListener("negotiationneeded",handleNegotiation)
//     }
//    },[handleNegotiation])

//    useEffect(()=>{
//     peer.peer.addEventListener('track',async ev=>{
//         const remotStream = ev.streams;
//         setRemoteStream(remotStream[0])
//     })
//    },[])
// //    useEffect(()=>{
// //     sendStream()
// //    },[])

//     useEffect(()=>{
//         socket?.on("user:joined", handlUserJoined);
//         socket?.on("incoming:call",handleIncomingCall);
//         socket?.on("call:accepted",handleCallAccepted);
//         socket?.on("peer:nego:needed", handleNegotiationIncomming);
//         socket?.on("peer:nego:final", handleNegotiationFinal);
        

//         return(()=>{
//             socket?.off("user:joined", handlUserJoined);
//             socket?.off("incoming:call",handleIncomingCall);
//             socket?.off("call:accepted",handleCallAccepted);
//             socket?.off("peer:nego:needed", handleNegotiationIncomming);
//             socket?.off("peer:nego:final", handleNegotiationFinal);
//         })
//     },[handlUserJoined, socket, handleIncomingCall, handleCallAccepted]);


//     return <div className="flex flex-col gap-3">
//         <h1>Call room</h1>
//         <h2>{remoteSocketId ? "connected" : "No one in room"}</h2>
//         <button className="border w-[50px] p-1 rounded-md" onClick={handleCallUser}>call</button>
//         {mystream && <button className="border w-[50px] p-1 rounded-md" onClick={sendStream}>send Stream</button>}

//        <div className="flex">
//             {mystream && <ReactPlayer width="200px" height="100px" controls playing muted url={mystream}/>}
//             {remoteStream && <ReactPlayer width="200px" height="100px" controls playing muted url={remoteStream}/>}
//        </div>
//         <button className="border p-1 w-[50px] rounded-md" onClick={()=>setMyStream(null)}>end call</button>
//     </div>
// }

// export default Room;
















// import { useRef, useState } from "react"
// import { useSocketContext } from "../contexts/SocketContext";
// import { useAppContext } from "../contexts/Contexts";
// import { getUser } from "../action/authHandlers";

// const VideoCalling = () => {
//     const {socket} = useSocketContext();
//     const {selected} = useAppContext() 
//     const userId = getUser()
//     const loacalVideoRef = useRef<HTMLVideoElement | null>(null);
//     const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
//     const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

//     const servers : RTCConfiguration = {
//         iceServers : [ { urls : "stun:stun.l.google.com:19302"}]
//     };

//     const startCall = async()=>{
//         const pc = new RTCPeerConnection(servers);
//         setPeerConnection(pc);
//         try {
//             const localStream = await navigator.mediaDevices.getUserMedia({
//                 video: true,
//                 audio : true
//             });
//             if(loacalVideoRef.current){
//                 loacalVideoRef.current.srcObject = localStream
//             }
//             localStream.getTracks().forEach((track:any)=>pc.addTrack(track, localStream));

//             pc.onicecandidate = (event)=>{
//                 if(event.candidate){
//                     socket.emit("candidate",{candidate: event.candidate})
//                 }
//             }

//             pc.ontrack = (event)=>{
//                 if(remoteVideoRef.current){
//                     remoteVideoRef.current.srcObject = event.streams[0];
//                 }
//             }
//             const offer = await pc.createOffer();
//             await pc.setLocalDescription(offer);

//          if(selected && selected?.type !== "group")   socket.emit("offer",{offer, to : selected?.id});

//         } catch (error) {
//             console.log("Error in starting call: ",error)
//         }
//     }


//     socket.on("offer", async({offer}:{offer: RTCSessionDescriptionInit})=>{
//         const pc = new RTCPeerConnection(servers);
//         setPeerConnection(pc);
//         pc.onicecandidate = (event)=>{
//             if(event.candidate){
//                 socket.emit("candidate", {candidate : event.candidate});
//             }
//         };
//         pc.ontrack = (event) =>{
//             if(remoteVideoRef.current){
//                 remoteVideoRef.current.srcObject = event.streams[0];
//             }
//         };
//         try {
//             await pc.setRemoteDescription(new RTCSessionDescription(offer));
//             const localStream = await navigator.mediaDevices.getUserMedia({
//                 video : true,
//                 audio : true
//             });
//             if(loacalVideoRef.current){
//                 loacalVideoRef.current.srcObject = localStream
//             }
//             localStream.getTracks().forEach((track:any)=>pc.addTrack(track,localStream));
//             const answer = await pc.createAnswer();
//             await pc.setLocalDescription(answer);
//             socket.emit("answer",{answer, to:userId})
//         } catch (error) {
//             console.log("Error in handling offer : ", error)
//         }
//     });

//     socket.on("answer",({answer}:{answer: RTCSessionDescriptionInit})=>{
//         if(peerConnection){
//             peerConnection.setRemoteDescription(new RTCSessionDescription(answer)).catch((e)=>console.log(e));
//         }
//     });

//     socket.on("candidate", ({candidate}:{candidate : RTCIceCandidateInit})=>{
//         if(peerConnection){
//             peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch((e)=>console.log(e));
//         }
// })


//   return (
//     <div className="flex flex-col gap-2">
//       <div className="flex gap-2 mt-5 items-center justify-evenly">
//         <video ref={loacalVideoRef} autoPlay playsInline muted controls></video>
//         <video ref={remoteVideoRef} autoPlay playsInline muted controls></video>
//       </div>
//       <button className="border w-[100px] mx-auto bg-green-400 rounded-full" onClick={startCall}>Start Call</button>
//     </div>
//   )
// }

// export default VideoCalling
