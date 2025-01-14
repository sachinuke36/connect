import React, { useCallback, useEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";
import { useAppContext } from "../contexts/Contexts";
import chatHandler from "../action/chatHandler";
import GroupChatHandler from "../action/GroupChatHandler";
import { getUser } from "../action/authHandlers";
import { SlOptionsVertical } from "react-icons/sl";
import { ImCross } from "react-icons/im";
import GroupHandler from "../action/GroupHandler";
import GroupInfo from "./GroupInfo";
import { useNavigate } from "react-router-dom";
import { useSocketContext } from "../contexts/SocketContext";
import { FaVideo } from "react-icons/fa";
import { getTime } from "../constants/formatTimeDate";


const RightSection = () => {
    const { friends, chats, selected, BACKEND_URL, grouChats, groups, showGroupInfo, setShowGroupInfo, setUpdateGroup, openModal, setGroupChats } = useAppContext();
    const { sendGroupChat } = GroupChatHandler();
    const { leaveGroup } = GroupHandler();
    const {sendChat} = chatHandler();
    const {socket } = useSocketContext()
    const userId = getUser()
    const [messageBody, setMessageBody] = useState<string>("");
    const [showOptions, setShowOptions] = useState<boolean>(false);
    const lastMessageRef = useRef<HTMLDivElement>(null);
    const friend = friends?.find((f: any) => f?.userId == selected?.id)
    const group = groups?.find((g: any) => g?.groupId == selected?.id);
    const navigate = useNavigate();

    const handleClick = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selected?.type === "chats") await sendChat(messageBody, selected?.id, BACKEND_URL);
        else await sendGroupChat(messageBody, selected?.id)
        setMessageBody("");

    }
    

    const handleCall = useCallback(()=>{
        const roomId = crypto.randomUUID();
        socket.emit("room:join",{to : selected?.id, from: userId, roomId });
    },[socket, selected]);

    const handleRoomJoin = useCallback((data : {to:string, from:string, roomId:string})=>{
        navigate(`/room/${data.roomId}`);
    },[])

    useEffect(()=>{
        socket.on("room:join",(data: any)=>{
            handleRoomJoin(data)
        })
        return (()=> socket?.off("room:join"))
    },[socket, selected, handleRoomJoin, navigate])

    useEffect(()=>{setShowOptions(false)},[selected]);
    useEffect(()=>setShowGroupInfo(false),[selected?.type])

    

    useEffect(()=>{
        setTimeout(()=>{
            lastMessageRef.current?.scrollIntoView({behavior: "smooth"});
        },100)
    },[chats, grouChats])


    return (
        <>
            <div className={`flex flex-col  rounded-r-md relative ${"flex-1"}`}>

                {/* Top section */}
                <div className=" h-[8%] bg-[#1f3442] text-white flex flex-col  justify-center">
                    <div className="px-2">
                        {selected?.type === "chats" ?
                            <div className="flex w-full justify-between px-2">
                                <div className="flex gap-3 items-center"> <img className="w-10 border border-cyan-800 rounded-full" src={`https://avatar.iran.liara.run/public/${friend?.gender === "MALE" ? "boy" :"girl"}?username=${friend?.fname}`} alt="" /> <p className="text-white font-extrabold">{friend?.fname} {friend?.lname}</p></div> <button className="p-1 " onClick={handleCall}><FaVideo className="text-[26px] hover:text-[30px] text-[#508bd8]"/></button></div>
                            : <div  className="flex items-center justify-between">
                                <div onClick={() => setShowGroupInfo(true)} className="flex w-full items-center gap-2">
                                    <div className="border text-center flex items-center justify-center font-extrabold bg-white text-cyan-950 rounded-full w-[40px] h-[40px]">{group?.groupName[0].toUpperCase()}</div>
                                    <div className="flex flex-col">
                                        <p className="text-white font-extrabold">{group?.groupName}</p>
                                        {selected?.type === "group" && <p className="text-[12px] text-cyan-300"> click here for group info</p>}
                                    </div>
                                </div>
                                {selected?.type === "group" && <p className="cursor-pointer" onClick={() => setShowOptions(prev => !prev)}>{showOptions ? <ImCross /> : <SlOptionsVertical />} </p>}
                            </div>}
                    </div>
                </div>
                {showOptions && <div className="absolute border  z-10 w-[30%] bg-white right-0 top-[5.5%]">
                    <ul className="flex flex-col items-center justify-center text-center">
                        <li onClick={() => {
                            leaveGroup();
                            setShowOptions(prev => !prev);
                        }} className="hover:bg-slate-300 w-full text-center border p-1">Leave Group</li>
                        {((selected?.type === "group") && (groups?.find((g:any)=>g.groupId === selected?.id)?.createdBy === userId)) && <li onClick={()=>{setUpdateGroup(true)
                            openModal()
                        }} className="hover:bg-slate-300 w-full text-center border">Edit Group</li>}
                    </ul>
                </div>}

                {/* Chat Section */}
                <div
                    className=" h-[82%] p-2 flex flex-col gap-2 bg-[#0c1317]  overflow-y-auto">
                    {(selected?.type === "chats") ?
                        chats?.map((chat: any, index: number) => {
                            const isSender = chat.senderId === userId;
                            const timeAgo = getTime(new Date(chat?.sent_at))?.timeAgo

                            return (
                                <div ref={lastMessageRef}
                                    key={index}
                                    className={` max-w-[50%] rounded-md p-2 text-center ${isSender
                                        ? "bg-white self-end text-[#2b475f]"
                                        : "bg-[#223b5d] self-start text-white"
                                        }`}
                                >
                                    <p>{chat.body}</p>
                                    <p className={`text-[9px] ${isSender ? "text-green-700" :"text-green-500" }`}>{timeAgo}</p>
                                </div>
                            );
                        }) : (
                            
                            <div className="flex h-full flex-col gap-2 overflow-y-auto" >
                                {
                                    grouChats?.map((chat: any, index: number) => {
                                        const isSender = chat.senderId === userId;
                                        const timeAgo = getTime(new Date(chat?.sent_at)).timeAgo
                                        return (
                                            <div  ref={lastMessageRef} key={index} className={`max-w-[50%] rounded-md p-2 ${isSender ? "bg-white self-end text-[#2b475f]" : "bg-[#223b5d] self-start text-white" }`}>
                                                <p className="text-[10px] font-bold text-cyan-300">{
                                                    friends?.find((f: any) => f.userId === chat.senderId)
                                                        ? `${friends.find((f: any) => f.userId === chat.senderId)?.fname}`
                                                        : <span className="text-orange-600">you</span>
                                                }</p>
                                                <p>{chat.messageBody}</p>
                                                <p className={`text-[9px] ${isSender ? "text-green-700" :"text-green-500" }`}>{timeAgo}</p>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        )
                    }
                </div>

                {/* bottom section */}
                <form className="h-[10%] flex w-full  bg-[#1f3445] items-center justify-center gap-3" onSubmit={(e) => handleClick(e)}>
                    <input className="border border-[#1f3450]  w-[70%] bg-[#2e4c65] outline-none text-white  p-3 rounded-md" type="text" value={messageBody} onChange={(e) => setMessageBody(e.target.value)} name="message" />
                    <button type="submit"> <IoSend className="text-[30px] text-[#508bd8]" /> </button>
                </form>
            </div>

            <div className={`${showGroupInfo ? "w-[20%]" : "w-0"} border"`}>
                {showGroupInfo && <GroupInfo />}
            </div>
        </>
    )
}

export default RightSection;



