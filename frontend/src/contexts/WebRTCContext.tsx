// import { createContext, ReactNode, useContext, useRef, useState } from "react";
// import { useSocketContext } from "./SocketContext";
// import { useAppContext } from "./Contexts";
// import { getUser } from "../action/authHandlers";


// const WebRTCContext = createContext(null);
// const useWebRTCContext = useContext(WebRTCContext);

// export const WebRTCContextProvider = ({children}:{children: ReactNode})=>{
//     const {socket} = useSocketContext();
//         const {selected} = useAppContext() 
//         const userId = getUser()
//         const loacalVideoRef = useRef<HTMLVideoElement | null>(null);
//         const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
//         const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

//         const servers : RTCConfiguration = {
//             iceServers : [ { urls : "stun:stun.l.google.com:19302"}]
//         };

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

//     const values = {
//         loacalVideoRef, remoteVideoRef, peerConnection, setPeerConnection, startCall
//     }

//     return <WebRTCContext.Provider value={values}>
//         {children}
//     </WebRTCContext.Provider>
// }