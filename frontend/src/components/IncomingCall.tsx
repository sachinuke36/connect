import { useNavigate } from "react-router-dom";
import { getUser } from "../action/authHandlers";
import { useSocketContext } from "../contexts/SocketContext";
import { useAppContext } from "../contexts/Contexts";
import { FaPhone, FaPhoneSlash, FaVideo } from "react-icons/fa";

interface IncomingCallProps {
    from: string;
    roomId: string;
    setShowCall: (show: boolean) => void;
    callType?: "video" | "audio";
}

const IncomingCall = ({ from, roomId, setShowCall, callType = "video" }: IncomingCallProps) => {
    const { socket, setCalling } = useSocketContext();
    const navigate = useNavigate();
    const { allUsers } = useAppContext();
    const userId = getUser();

    const caller = allUsers?.find((u: { userId: string }) => u.userId === from);
    const callerName = caller ? `${caller.fname} ${caller.lname}` : "Unknown Caller";

    const handleAcceptCall = () => {
        setShowCall(false);
        // Set who we're in a call with (the caller's userId)
        setCalling(from);
        socket?.emit("room:join", { to: from, from: userId, roomId, type: callType });
        socket?.emit("accepted:call", { from, to: userId });
        // Navigate without initiator param - we are the receiver, pass remote user ID
        navigate(`/room/${roomId}?type=${callType}&remote=${from}`);
    };

    const handleDeclineCall = () => {
        setShowCall(false);
        socket?.emit("call-declined", { from, to: userId });
    };

    const isVideoCall = callType === "video";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-gradient-to-b from-[#1f3445] to-[#0d1f2d] p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 min-w-[280px] border border-[#2a4a5e]">
                <div className="relative">
                    <img
                        className="w-20 h-20 rounded-full border-4 border-green-500 animate-pulse"
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${caller?.fname || "user"}&backgroundColor=b6e3f4`}
                        alt="Caller avatar"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        {isVideoCall ? (
                            <FaVideo className="text-white text-xs" />
                        ) : (
                            <FaPhone className="text-white text-xs" />
                        )}
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-white text-lg font-bold">{callerName}</p>
                    <p className="text-gray-400 text-sm">
                        Incoming {isVideoCall ? "video" : "audio"} call...
                    </p>
                </div>

                <div className="flex gap-6 mt-2">
                    <button
                        onClick={handleDeclineCall}
                        className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all shadow-lg hover:scale-105"
                    >
                        <FaPhoneSlash className="text-white text-xl" />
                    </button>

                    <button
                        onClick={handleAcceptCall}
                        className="p-4 rounded-full bg-green-600 hover:bg-green-700 transition-all shadow-lg hover:scale-105 animate-bounce"
                    >
                        <FaPhone className="text-white text-xl" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncomingCall;
