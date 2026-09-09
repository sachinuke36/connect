import { useCallback, useEffect, useRef, useState } from "react";
import { useSocketContext } from "../contexts/SocketContext";
import { useAppContext } from "../contexts/Contexts";
import { getUser } from "../action/authHandlers";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaPhoneSlash, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhone } from "react-icons/fa";
import { IoVolumeMute, IoVolumeHigh } from "react-icons/io5";
import { toast } from "react-toastify";

const Room = () => {
    const { socket, calling } = useSocketContext();
    const { allUsers } = useAppContext();
    const userId = getUser();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isInitiator = searchParams.get("initiator") === "true";
    const callType = searchParams.get("type") || "video";
    const isAudioCall = callType === "audio";
    // Get remote user ID from URL params (more reliable than context state)
    const remoteIdFromUrl = searchParams.get("remote");
    const remoteId = remoteIdFromUrl || calling;

    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const callInfoRef = useRef<string[]>([]);
    const iceCandidatesQueue = useRef<RTCIceCandidateInit[]>([]);
    const hasInitialized = useRef<boolean>(false);
    const callStartTimeRef = useRef<number | null>(null);

    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
    const [isVideoOff, setIsVideoOff] = useState<boolean>(isAudioCall);
    const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);
    const [connectionStatus, setConnectionStatus] = useState<string>("Connecting...");
    const [remoteUserId, setRemoteUserId] = useState<string | null>(calling);
    const [callDuration, setCallDuration] = useState<string>("00:00");

    // ICE servers configuration - TURN servers are required for production
    const turnUsername = import.meta.env.VITE_TURN_USERNAME;
    const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL;

    // Debug: log TURN configuration
    console.log("[WebRTC] TURN configured:", !!turnUsername && !!turnCredential);

    const servers: RTCConfiguration = {
        iceServers: [
            // STUN servers
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            // TURN servers - using Metered.ca
            {
                urls: "turn:sachinuke36.relay.metered.ca:80",
                username: turnUsername,
                credential: turnCredential,
            },
            {
                urls: "turn:sachinuke36.relay.metered.ca:80?transport=tcp",
                username: turnUsername,
                credential: turnCredential,
            },
            {
                urls: "turn:sachinuke36.relay.metered.ca:443",
                username: turnUsername,
                credential: turnCredential,
            },
            {
                urls: "turns:sachinuke36.relay.metered.ca:443?transport=tcp",
                username: turnUsername,
                credential: turnCredential,
            },
        ],
        iceCandidatePoolSize: 10,
        iceTransportPolicy: turnUsername ? "all" : "all", // Use "relay" to force TURN for testing
    };

    // Call duration timer
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;

        if (isConnected && callStartTimeRef.current) {
            interval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - callStartTimeRef.current!) / 1000);
                const minutes = Math.floor(elapsed / 60).toString().padStart(2, "0");
                const seconds = (elapsed % 60).toString().padStart(2, "0");
                setCallDuration(`${minutes}:${seconds}`);
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isConnected]);

    const createPeerConnection = useCallback((targetUserId: string) => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }

        const pc = new RTCPeerConnection(servers);

        pc.ontrack = (event) => {
            console.log("Received remote track:", event.streams[0]);
            if (isAudioCall) {
                if (remoteAudioRef.current && event.streams[0]) {
                    remoteAudioRef.current.srcObject = event.streams[0];
                }
            } else {
                if (remoteVideoRef.current && event.streams[0]) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate && socket && targetUserId) {
                console.log("Sending ICE candidate to:", targetUserId);
                socket.emit("icecandidate", { candidate: event.candidate, to: targetUserId });
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log("[WebRTC] ICE connection state:", pc.iceConnectionState);
            if (pc.iceConnectionState === "failed") {
                console.error("[WebRTC] ICE connection failed - TURN server may not be working");
                setConnectionStatus("Connection failed - retrying...");
                // Try to restart ICE
                pc.restartIce();
            }
        };

        pc.onicegatheringstatechange = () => {
            console.log("[WebRTC] ICE gathering state:", pc.iceGatheringState);
        };

        pc.onsignalingstatechange = () => {
            console.log("[WebRTC] Signaling state:", pc.signalingState);
        };

        pc.onconnectionstatechange = () => {
            console.log("Connection state:", pc.connectionState);
            switch (pc.connectionState) {
                case "connected":
                    setConnectionStatus("Connected");
                    setIsConnected(true);
                    callStartTimeRef.current = Date.now();
                    toast.success("Call connected!", { position: "top-right", autoClose: 2000 });
                    break;
                case "disconnected":
                    setConnectionStatus("Disconnected");
                    toast.warning("Call disconnected", { position: "top-right" });
                    break;
                case "failed":
                    setConnectionStatus("Connection failed");
                    toast.error("Connection failed. Please try again.", { position: "top-right" });
                    break;
                case "connecting":
                    setConnectionStatus("Connecting...");
                    break;
            }
        };

        peerConnectionRef.current = pc;
        return pc;
    }, [socket, isAudioCall]);

    const startMyMedia = useCallback(async () => {
        try {
            const constraints = isAudioCall
                ? { audio: true, video: false }
                : { audio: true, video: true };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            localStreamRef.current = stream;

            if (!isAudioCall && localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            return stream;
        } catch (error: unknown) {
            console.error("Error accessing media devices:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            if (errorMessage.includes("Permission denied") || errorMessage.includes("NotAllowedError")) {
                toast.error("Microphone access denied. Please allow access to continue.", { position: "top-right" });
                setConnectionStatus("Mic access denied");
            } else if (errorMessage.includes("NotFoundError")) {
                toast.error("No microphone found on this device.", { position: "top-right" });
                setConnectionStatus("No media devices found");
            } else {
                toast.error("Failed to access microphone.", { position: "top-right" });
                setConnectionStatus("Media access failed");
            }
            return null;
        }
    }, [isAudioCall]);

    const startCall = useCallback(async (stream: MediaStream, targetUserId: string) => {
        if (!stream || !socket || !targetUserId) {
            console.error("Cannot start call: missing stream, socket, or target user");
            return;
        }

        console.log("Starting call to:", targetUserId);
        const pc = createPeerConnection(targetUserId);

        stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
        });

        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            console.log("Sending offer to:", targetUserId);
            socket.emit("offer", { from: userId, to: targetUserId, offer: pc.localDescription });
        } catch (error) {
            console.error("Error creating offer:", error);
        }
    }, [socket, userId, createPeerConnection]);

    const endCallHandler = useCallback(() => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                track.stop();
            });
            localStreamRef.current = null;
        }

        if (socket && callInfoRef.current.length > 0) {
            socket.emit("call-ended", { callInfo: callInfoRef.current });
        }

        navigate("/");
    }, [socket, navigate]);

    const toggleAudio = useCallback(() => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioMuted(!audioTrack.enabled);
            }
        }
    }, []);

    const toggleVideo = useCallback(() => {
        if (localStreamRef.current && !isAudioCall) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    }, [isAudioCall]);

    const toggleSpeaker = useCallback(() => {
        if (isAudioCall && remoteAudioRef.current) {
            remoteAudioRef.current.muted = !remoteAudioRef.current.muted;
            setIsSpeakerMuted(!isSpeakerMuted);
        } else if (remoteVideoRef.current) {
            remoteVideoRef.current.muted = !remoteVideoRef.current.muted;
            setIsSpeakerMuted(!isSpeakerMuted);
        }
    }, [isAudioCall, isSpeakerMuted]);

    useEffect(() => {
        // Prevent re-initialization if already set up
        if (hasInitialized.current || peerConnectionRef.current) {
            console.log("Already initialized or has peer connection, skipping");
            return;
        }

        // Prevent initialization without required params
        if (!remoteId || !socket) {
            console.log("[WebRTC] Missing remoteId or socket, skipping initialization");
            console.log("[WebRTC] remoteId:", remoteId, "socket:", !!socket);
            return;
        }

        // Check socket connection status
        console.log("[WebRTC] Socket connected:", socket.connected);
        console.log("[WebRTC] Socket ID:", socket.id);

        hasInitialized.current = true;
        let mounted = true;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        let offerSent = false;
        let callAccepted = !isInitiator; // Receiver doesn't need to wait for accepted:call

        // Set remote user ID immediately
        setRemoteUserId(remoteId);

        const handleUserReady = async ({ from }: { from: string }) => {
            console.log("Received user:ready from:", from, "expecting:", remoteId);
            if (from === remoteId && mounted && !offerSent && callAccepted && localStreamRef.current && !peerConnectionRef.current) {
                offerSent = true;
                console.log("Receiver is ready, sending offer now");
                await startCall(localStreamRef.current, remoteId);
            }
        };

        const handleAcceptedCall = async () => {
            console.log("Call accepted by receiver");
            callAccepted = true;
            setConnectionStatus("Call accepted, connecting...");

            // Now check if user:ready was already received
            if (mounted && !offerSent && localStreamRef.current && !peerConnectionRef.current) {
                // Give receiver a moment to set up, then send offer
                timeoutId = setTimeout(async () => {
                    if (mounted && !offerSent && localStreamRef.current && !peerConnectionRef.current) {
                        offerSent = true;
                        console.log("Sending offer after call accepted");
                        await startCall(localStreamRef.current, remoteId);
                    }
                }, 1000);
            }
        };

        // Set up listeners BEFORE starting media to avoid race condition
        if (isInitiator) {
            socket.on("user:ready", handleUserReady);
            socket.on("accepted:call", handleAcceptedCall);
        }

        const initializeCall = async () => {
            console.log("[WebRTC] Initializing call, isInitiator:", isInitiator, "remoteId:", remoteId, "type:", callType);
            console.log("[WebRTC] ICE servers configured:", servers.iceServers?.length);
            const stream = await startMyMedia();

            if (!stream || !mounted) {
                hasInitialized.current = false;
                return;
            }

            if (isInitiator) {
                console.log("I am the initiator, waiting for receiver to accept:", remoteId);
                setConnectionStatus("Ringing...");

            } else {
                console.log("I am the receiver, signaling ready to:", remoteId);
                setConnectionStatus("Connecting...");

                // Send ready signal immediately
                socket.emit("user:ready", { to: remoteId, from: userId });

                // Send again after delay in case first was too early
                timeoutId = setTimeout(() => {
                    if (mounted) {
                        socket.emit("user:ready", { to: remoteId, from: userId });
                    }
                }, 500);
            }
        };

        initializeCall();

        return () => {
            mounted = false;
            socket.off("user:ready", handleUserReady);
            socket.off("accepted:call", handleAcceptedCall);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isInitiator, remoteId, socket, userId, startMyMedia, startCall, callType]);

    useEffect(() => {
        if (!socket) return;

        const handleOffer = async ({ from, to, offer }: { from: string; to: string; offer: RTCSessionDescriptionInit }) => {
            console.log("[WebRTC] Received offer from:", from, "isInitiator:", isInitiator);

            // Only the receiver should process offers
            if (isInitiator) {
                console.log("[WebRTC] Ignoring offer - I am the initiator");
                return;
            }

            if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
                console.log("[WebRTC] Already have remote description, ignoring duplicate offer");
                return;
            }

            setRemoteUserId(from);

            const stream = localStreamRef.current || await startMyMedia();
            if (!stream) {
                console.error("No local stream available");
                return;
            }

            const pc = createPeerConnection(from);

            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            try {
                await pc.setRemoteDescription(new RTCSessionDescription(offer));

                while (iceCandidatesQueue.current.length > 0) {
                    const candidate = iceCandidatesQueue.current.shift();
                    if (candidate) {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                }

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                callInfoRef.current = [from, to];
                console.log("Sending answer to:", from);
                socket.emit("answer", { from: to, to: from, answer: pc.localDescription });
            } catch (error) {
                console.error("Error handling offer:", error);
            }
        };

        const handleAnswer = async ({ from, to, answer }: { from: string; to: string; answer: RTCSessionDescriptionInit }) => {
            console.log("[WebRTC] Received answer from:", from, "isInitiator:", isInitiator);

            // Only the initiator (caller) should process answers
            if (!isInitiator) {
                console.log("[WebRTC] Ignoring answer - I am not the initiator");
                return;
            }

            if (!peerConnectionRef.current) {
                console.error("[WebRTC] No peer connection when receiving answer");
                return;
            }

            // Check signaling state instead of just remoteDescription
            if (peerConnectionRef.current.signalingState !== "have-local-offer") {
                console.log("[WebRTC] Ignoring answer - signaling state is:", peerConnectionRef.current.signalingState);
                return;
            }

            try {
                console.log("[WebRTC] Setting remote description (answer)");
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
                console.log("[WebRTC] Remote description set successfully");

                // Process queued ICE candidates
                while (iceCandidatesQueue.current.length > 0) {
                    const candidate = iceCandidatesQueue.current.shift();
                    if (candidate) {
                        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                }

                callInfoRef.current = [from, to];
            } catch (error) {
                console.error("[WebRTC] Error handling answer:", error);
            }
        };

        const handleIceCandidate = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
            console.log("Received ICE candidate");
            if (!peerConnectionRef.current || !peerConnectionRef.current.remoteDescription) {
                iceCandidatesQueue.current.push(candidate);
                return;
            }

            try {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error("Error adding ICE candidate:", error);
            }
        };

        const handleCallEnded = () => {
            endCallHandler();
        };

        // Debug: log all answer events received
        const debugAnswerListener = (data: any) => {
            console.log("[WebRTC DEBUG] Raw answer event received:", data);
        };
        socket.on("answer", debugAnswerListener);

        socket.on("offer", handleOffer);
        socket.on("answer", handleAnswer);
        socket.on("icecandidate", handleIceCandidate);
        socket.on("call-ended", handleCallEnded);

        // Re-register socket mapping when joining call room
        if (userId) {
            console.log("[WebRTC] Re-registering socket for call, userId:", userId);
            socket.emit("register-user", { userId });
        }

        return () => {
            socket.off("answer", debugAnswerListener);
            socket.off("offer", handleOffer);
            socket.off("answer", handleAnswer);
            socket.off("icecandidate", handleIceCandidate);
            socket.off("call-ended", handleCallEnded);
        };
    }, [socket, startMyMedia, createPeerConnection, endCallHandler, isInitiator, userId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            console.log("Component unmounting, cleaning up...");
            hasInitialized.current = false;
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop());
                localStreamRef.current = null;
            }
        };
    }, []);

    const remoteUser = allUsers?.find((u: { userId: string; fname: string; lname: string }) => u.userId === (remoteUserId || remoteId));
    const callerName = remoteUser ? `${remoteUser.fname} ${remoteUser.lname}` : "Connecting...";

    // Audio call UI
    if (isAudioCall) {
        return (
            <div className="flex flex-col h-screen bg-gradient-to-b from-[#0a1929] via-[#0d2137] to-[#0a1929]">
                {/* Hidden audio element for remote audio */}
                <audio ref={remoteAudioRef} autoPlay />

                {/* Header */}
                <div className="flex items-center justify-center pt-8 pb-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isConnected ? "bg-green-500/20" : "bg-yellow-500/20"}`}>
                        <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-yellow-500 animate-pulse"}`} />
                        <span className={`text-sm font-medium ${isConnected ? "text-green-400" : "text-yellow-400"}`}>
                            {connectionStatus}
                        </span>
                    </div>
                </div>

                {/* Main content - Avatar and info */}
                <div className="flex-1 flex flex-col items-center justify-center px-4">
                    {/* Avatar with pulse animation when connecting */}
                    <div className={`relative ${!isConnected ? "animate-pulse" : ""}`}>
                        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-1">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${remoteUser?.fname || "user"}&backgroundColor=b6e3f4`}
                                alt={callerName}
                                className="w-full h-full rounded-full bg-[#1f3445]"
                            />
                        </div>
                        {/* Phone icon badge */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 rounded-full p-3 shadow-lg">
                            <FaPhone className="text-white text-lg" />
                        </div>
                    </div>

                    {/* Caller info */}
                    <h2 className="text-2xl font-bold text-white mt-8">{callerName}</h2>
                    <p className="text-gray-400 mt-1">Audio Call</p>

                    {/* Call duration */}
                    {isConnected && (
                        <div className="mt-4 px-4 py-2 bg-white/10 rounded-full">
                            <span className="text-cyan-400 font-mono text-lg">{callDuration}</span>
                        </div>
                    )}

                    {/* Audio wave animation when connected */}
                    {isConnected && (
                        <div className="flex items-center gap-1 mt-6">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-cyan-500 rounded-full animate-pulse"
                                    style={{
                                        height: `${20 + Math.random() * 20}px`,
                                        animationDelay: `${i * 0.1}s`,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="pb-12 pt-6">
                    <div className="flex justify-center gap-6">
                        {/* Mute button */}
                        <button
                            onClick={toggleAudio}
                            className={`p-5 rounded-full transition-all transform hover:scale-105 ${
                                isAudioMuted
                                    ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30"
                                    : "bg-white/10 hover:bg-white/20"
                            }`}
                        >
                            {isAudioMuted ? (
                                <FaMicrophoneSlash className="text-white text-2xl" />
                            ) : (
                                <FaMicrophone className="text-white text-2xl" />
                            )}
                        </button>

                        {/* Speaker button */}
                        <button
                            onClick={toggleSpeaker}
                            className={`p-5 rounded-full transition-all transform hover:scale-105 ${
                                isSpeakerMuted
                                    ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30"
                                    : "bg-white/10 hover:bg-white/20"
                            }`}
                        >
                            {isSpeakerMuted ? (
                                <IoVolumeMute className="text-white text-2xl" />
                            ) : (
                                <IoVolumeHigh className="text-white text-2xl" />
                            )}
                        </button>

                        {/* End call button */}
                        <button
                            onClick={endCallHandler}
                            className="p-5 rounded-full bg-red-600 hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg shadow-red-600/30"
                        >
                            <FaPhoneSlash className="text-white text-2xl" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Video call UI
    return (
        <div className="flex flex-col h-screen bg-[#0a0a0a]">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-3">
                    <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${remoteUser?.fname || "user"}&backgroundColor=b6e3f4`}
                        alt={callerName}
                        className="w-10 h-10 rounded-full border-2 border-white/20"
                    />
                    <div>
                        <h2 className="text-white font-semibold">{callerName}</h2>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`} />
                            <span className={`text-xs ${isConnected ? "text-green-400" : "text-yellow-400"}`}>
                                {isConnected ? callDuration : connectionStatus}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Video area */}
            <div className="flex-1 relative">
                {/* Remote video (full screen) */}
                <video
                    className="absolute inset-0 w-full h-full object-cover"
                    ref={remoteVideoRef}
                    playsInline
                    autoPlay
                />

                {/* Remote video placeholder when not connected */}
                {!isConnected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e]">
                        <div className="text-center">
                            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-1 animate-pulse">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${remoteUser?.fname || "user"}&backgroundColor=b6e3f4`}
                                    alt={callerName}
                                    className="w-full h-full rounded-full bg-[#1f3445]"
                                />
                            </div>
                            <p className="text-white font-medium">{callerName}</p>
                            <p className="text-gray-400 text-sm mt-1">{connectionStatus}</p>
                        </div>
                    </div>
                )}

                {/* Local video (picture-in-picture) */}
                <div className="absolute top-20 right-4 w-32 sm:w-40 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
                    {isVideoOff ? (
                        <div className="w-full h-full bg-[#1f3445] flex items-center justify-center">
                            <div className="text-center">
                                <FaVideoSlash className="text-white/50 text-2xl mx-auto mb-1" />
                                <p className="text-white/50 text-xs">Camera Off</p>
                            </div>
                        </div>
                    ) : (
                        <video
                            className="w-full h-full object-cover"
                            ref={localVideoRef}
                            playsInline
                            autoPlay
                            muted
                        />
                    )}
                    <div className="absolute bottom-2 left-2 right-2 bg-black/50 rounded-lg px-2 py-1">
                        <p className="text-white text-xs text-center">You</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 pb-8 pt-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex justify-center gap-4">
                    {/* Mute button */}
                    <button
                        onClick={toggleAudio}
                        className={`p-4 rounded-full transition-all transform hover:scale-105 ${
                            isAudioMuted
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-white/20 hover:bg-white/30"
                        }`}
                    >
                        {isAudioMuted ? (
                            <FaMicrophoneSlash className="text-white text-xl" />
                        ) : (
                            <FaMicrophone className="text-white text-xl" />
                        )}
                    </button>

                    {/* Video toggle button */}
                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-full transition-all transform hover:scale-105 ${
                            isVideoOff
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-white/20 hover:bg-white/30"
                        }`}
                    >
                        {isVideoOff ? (
                            <FaVideoSlash className="text-white text-xl" />
                        ) : (
                            <FaVideo className="text-white text-xl" />
                        )}
                    </button>

                    {/* Speaker button */}
                    <button
                        onClick={toggleSpeaker}
                        className={`p-4 rounded-full transition-all transform hover:scale-105 ${
                            isSpeakerMuted
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-white/20 hover:bg-white/30"
                        }`}
                    >
                        {isSpeakerMuted ? (
                            <IoVolumeMute className="text-white text-xl" />
                        ) : (
                            <IoVolumeHigh className="text-white text-xl" />
                        )}
                    </button>

                    {/* End call button */}
                    <button
                        onClick={endCallHandler}
                        className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg shadow-red-600/30"
                    >
                        <FaPhoneSlash className="text-white text-xl" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Room;
