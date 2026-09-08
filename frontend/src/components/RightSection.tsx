import React, { useCallback, useEffect, useRef, useState } from "react";
import { IoChevronBack, IoSend } from "react-icons/io5";
import { useAppContext } from "../contexts/Contexts";
import chatHandler from "../action/chatHandler";
import GroupChatHandler from "../action/GroupChatHandler";
import { getUser } from "../action/authHandlers";
import { SlOptionsVertical } from "react-icons/sl";
import { IoClose } from "react-icons/io5";
import GroupHandler from "../action/GroupHandler";
import GroupInfo from "./GroupInfo";
import { useNavigate } from "react-router-dom";
import { useSocketContext } from "../contexts/SocketContext";
import { FaVideo, FaPhone } from "react-icons/fa";
import { BsCheck, BsCheckAll } from "react-icons/bs";
import { getTime } from "../constants/formatTimeDate";
import { BsChatDots } from "react-icons/bs";

interface Chat {
    senderId: string;
    body: string;
    sent_at: string;
    status?: "SENT" | "DELIVERED" | "SEEN";
}

interface GroupChat {
    groupId: string;
    senderId: string;
    messageBody: string;
    sent_at: string;
}

interface Friend {
    userId: string;
    fname: string;
    lname: string;
    gender: "MALE" | "FEMALE";
}

interface Group {
    groupId: string;
    groupName: string;
    createdBy: string;
}

const RightSection = () => {
    const { friends, chats, selected, setSelected, BACKEND_URL, grouChats, groups, showGroupInfo, setShowGroupInfo, setUpdateGroup, openModal } = useAppContext();
    const { sendGroupChat, loading } = GroupChatHandler();
    const { leaveGroup } = GroupHandler();
    const { sendChat, loading: loadingSendChat } = chatHandler();
    const { socket, online, setCalling, typingUsers } = useSocketContext();
    const userId = getUser();
    const [messageBody, setMessageBody] = useState<string>("");
    const [showOptions, setShowOptions] = useState<boolean>(false);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);
    const friend = friends?.find((f: Friend) => f?.userId === selected?.id);
    const group = groups?.find((g: Group) => g?.groupId === selected?.id);
    const navigate = useNavigate();

    const isRemoteUserTyping = selected?.type === "chats" && typingUsers.includes(selected?.id);

    const handleClick = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageBody.trim()) return;

        // Stop typing indicator when sending
        if (isTyping && selected?.type === "chats") {
            socket?.emit("typing:stop", { to: selected?.id, from: userId });
            setIsTyping(false);
        }

        if (selected?.type === "chats") await sendChat(messageBody, selected?.id, BACKEND_URL);
        else await sendGroupChat(messageBody, selected?.id);
        setMessageBody("");
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageBody(e.target.value);

        if (selected?.type !== "chats") return;

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Start typing
        if (!isTyping && e.target.value) {
            setIsTyping(true);
            socket?.emit("typing:start", { to: selected?.id, from: userId });
        }

        // Stop typing after 2 seconds of no input
        typingTimeoutRef.current = setTimeout(() => {
            if (isTyping) {
                setIsTyping(false);
                socket?.emit("typing:stop", { to: selected?.id, from: userId });
            }
        }, 2000);
    };

    const handleVideoCall = useCallback(() => {
        const roomId = crypto.randomUUID();
        const remoteId = selected?.id;
        setCalling(remoteId);
        socket?.emit("room:join", { to: remoteId, from: userId, roomId, type: "video" });
        navigate(`/room/${roomId}?initiator=true&type=video&remote=${remoteId}`);
    }, [socket, selected, userId, setCalling, navigate]);

    const handleAudioCall = useCallback(() => {
        const roomId = crypto.randomUUID();
        const remoteId = selected?.id;
        setCalling(remoteId);
        socket?.emit("room:join", { to: remoteId, from: userId, roomId, type: "audio" });
        navigate(`/room/${roomId}?initiator=true&type=audio&remote=${remoteId}`);
    }, [socket, selected, userId, setCalling, navigate]);


    useEffect(() => {
        setShowOptions(false);
    }, [selected]);

    useEffect(() => {
        setShowGroupInfo(false);
    }, [selected?.type]);

    useEffect(() => {
        const timer = setTimeout(() => {
            lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        return () => clearTimeout(timer);
    }, [chats, grouChats]);

    const isFriendOnline = friend && online?.includes(friend.userId);

    if (!selected) {
        return (
            <div className="hidden sm:flex flex-1 flex-col items-center justify-center bg-[#0c1317] text-gray-400">
                <div className="w-24 h-24 rounded-full bg-[#1f3445] flex items-center justify-center mb-4">
                    <BsChatDots className="text-4xl text-cyan-500" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Welcome to Connect</h2>
                <p className="text-center max-w-sm">Select a conversation from the sidebar to start chatting with your friends</p>
            </div>
        );
    }

    return (
        <>
            <div className={`flex-1 flex flex-col ${showGroupInfo ? "hidden sm:flex" : "flex"} bg-[#0c1317]`}>
                {/* Header */}
                <div className="h-16 bg-gradient-to-r from-[#1f3445] to-[#162736] flex items-center px-4 border-b border-[#2a4a5e]">
                    {selected?.type === "chats" ? (
                        <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    className="sm:hidden p-2 hover:bg-[#2a4a5e] rounded-lg transition-colors"
                                    onClick={() => setSelected("")}
                                >
                                    <IoChevronBack className="text-white text-xl" />
                                </button>
                                <div className="relative">
                                    <img
                                        className="w-10 h-10 rounded-full border-2 border-[#2a4a5e]"
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friend?.fname}&backgroundColor=b6e3f4`}
                                        alt={friend?.fname}
                                    />
                                    {isFriendOnline && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1f3445]" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-white font-semibold">{friend?.fname} {friend?.lname}</p>
                                    <p className={`text-xs ${isRemoteUserTyping ? "text-cyan-400" : isFriendOnline ? "text-green-400" : "text-gray-400"}`}>
                                        {isRemoteUserTyping ? "typing..." : isFriendOnline ? "Online" : "Offline"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    className="p-2.5 hover:bg-[#2a4a5e] rounded-full transition-all hover:scale-105"
                                    onClick={handleAudioCall}
                                    title="Start audio call"
                                >
                                    <FaPhone className="text-lg text-cyan-400" />
                                </button>
                                <button
                                    className="p-2.5 hover:bg-[#2a4a5e] rounded-full transition-all hover:scale-105"
                                    onClick={handleVideoCall}
                                    title="Start video call"
                                >
                                    <FaVideo className="text-xl text-cyan-400" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex w-full items-center justify-between">
                            <div
                                onClick={() => setShowGroupInfo(true)}
                                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                <button
                                    className="sm:hidden p-2 hover:bg-[#2a4a5e] rounded-lg transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelected("");
                                    }}
                                >
                                    <IoChevronBack className="text-white text-xl" />
                                </button>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">
                                        {group?.groupName[0]?.toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-white font-semibold">{group?.groupName}</p>
                                    <p className="text-xs text-cyan-400">Tap for group info</p>
                                </div>
                            </div>
                            <button
                                className="p-2 hover:bg-[#2a4a5e] rounded-lg transition-colors"
                                onClick={() => setShowOptions((prev) => !prev)}
                            >
                                {showOptions ? (
                                    <IoClose className="text-white text-xl" />
                                ) : (
                                    <SlOptionsVertical className="text-white" />
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Options dropdown */}
                {showOptions && (
                    <div className="absolute right-4 top-20 z-20 bg-[#1f3445] rounded-lg shadow-xl border border-[#2a4a5e] overflow-hidden min-w-[150px]">
                        <button
                            onClick={() => {
                                leaveGroup();
                                setShowOptions(false);
                            }}
                            className="w-full px-4 py-3 text-left text-white hover:bg-[#2a4a5e] transition-colors"
                        >
                            Leave Group
                        </button>
                        {selected?.type === "group" && group?.createdBy === userId && (
                            <button
                                onClick={() => {
                                    setUpdateGroup(true);
                                    openModal();
                                    setShowOptions(false);
                                }}
                                className="w-full px-4 py-3 text-left text-white hover:bg-[#2a4a5e] transition-colors border-t border-[#2a4a5e]"
                            >
                                Edit Group
                            </button>
                        )}
                    </div>
                )}

                {/* Messages area */}
                <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1f3445] scrollbar-track-transparent">
                    {selected?.type === "chats" ? (
                        <div className="flex flex-col gap-3">
                            {chats?.map((chat: Chat, index: number) => {
                                const isSender = chat.senderId === userId;
                                const timeAgo = getTime(new Date(chat?.sent_at))?.timeAgo;

                                return (
                                    <div
                                        ref={lastMessageRef}
                                        key={index}
                                        className={`max-w-[75%] sm:max-w-[60%] ${isSender ? "self-end" : "self-start"}`}
                                    >
                                        <div
                                            className={`px-4 py-2.5 rounded-2xl ${
                                                isSender
                                                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-md"
                                                    : "bg-[#1f3445] text-white rounded-bl-md"
                                            }`}
                                        >
                                            <p className="break-words">{chat.body}</p>
                                        </div>
                                        <div className={`flex items-center gap-1 mt-1 ${isSender ? "justify-end" : "justify-start"}`}>
                                            <p className="text-[10px] text-gray-500">{timeAgo}</p>
                                            {isSender && (
                                                <span className={`${
                                                    chat.status === "SEEN"
                                                        ? "text-blue-400"
                                                        : chat.status === "DELIVERED"
                                                            ? "text-gray-400"
                                                            : "text-gray-500"
                                                }`}>
                                                    {chat.status === "SENT" ? (
                                                        <BsCheck className="text-sm" />
                                                    ) : (
                                                        <BsCheckAll className="text-sm" />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {grouChats?.map((chat: GroupChat, index: number) => {
                                const isSender = chat.senderId === userId;
                                const timeAgo = getTime(new Date(chat?.sent_at))?.timeAgo;
                                const senderFriend = friends?.find((f: Friend) => f.userId === chat.senderId);

                                return (
                                    <div
                                        ref={lastMessageRef}
                                        key={index}
                                        className={`max-w-[75%] sm:max-w-[60%] ${isSender ? "self-end" : "self-start"}`}
                                    >
                                        <div
                                            className={`px-4 py-2.5 rounded-2xl ${
                                                isSender
                                                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-md"
                                                    : "bg-[#1f3445] text-white rounded-bl-md"
                                            }`}
                                        >
                                            {!isSender && (
                                                <p className="text-xs font-semibold text-cyan-400 mb-1">
                                                    {senderFriend?.fname || "Unknown"}
                                                </p>
                                            )}
                                            <p className="break-words">{chat.messageBody}</p>
                                        </div>
                                        <p className={`text-[10px] mt-1 ${isSender ? "text-right" : "text-left"} text-gray-500`}>
                                            {timeAgo}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Input area */}
                <form
                    className="h-20 bg-gradient-to-r from-[#1f3445] to-[#162736] flex items-center px-4 gap-3 border-t border-[#2a4a5e]"
                    onSubmit={handleClick}
                >
                    <input
                        className="flex-1 bg-[#0c1317] text-white placeholder-gray-400 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all border border-[#2a4a5e]"
                        type="text"
                        placeholder="Type a message..."
                        value={messageBody}
                        onChange={handleTyping}
                        name="message"
                    />
                    <button
                        disabled={loadingSendChat || loading || !messageBody.trim()}
                        type="submit"
                        className="p-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading || loadingSendChat ? (
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            <IoSend className="text-xl text-white" />
                        )}
                    </button>
                </form>
            </div>

            {/* Group Info Sidebar */}
            {showGroupInfo && (
                <div className="w-full sm:w-80 border-l border-[#2a4a5e] bg-[#071928]">
                    <GroupInfo />
                </div>
            )}
        </>
    );
};

export default RightSection;



