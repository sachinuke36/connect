import React, { useEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";
import { useAppContext } from "../contexts/Contexts";
import chatHandler from "../action/chatHandler";
import GroupChatHandler from "../action/GroupChatHandler";
import { getUser } from "../action/authHandlers";
import { SlOptionsVertical } from "react-icons/sl";
import { ImCross } from "react-icons/im";
import GroupHandler from "../action/GroupHandler";
import GroupInfo from "./GroupInfo";


const RightSection = () => {
    const { friends, chats, selected, BACKEND_URL, grouChats, groups, showGroupInfo, setShowGroupInfo, setUpdateGroup, openModal } = useAppContext();
    const { sendGroupChat } = GroupChatHandler();
    const { leaveGroup } = GroupHandler();
    const {sendChat} = chatHandler()
    const userId = getUser()
    const [messageBody, setMessageBody] = useState<string>("");
    const [showOptions, setShowOptions] = useState<boolean>(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const friend = friends?.find((f: any) => f?.userId == selected?.id)
    const group = groups?.find((g: any) => g?.groupId == selected?.id);

    const handleClick = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selected?.type === "chats") await sendChat(messageBody, selected?.id, BACKEND_URL);
        else await sendGroupChat(messageBody, selected?.id)
        setMessageBody("");

    }

    useEffect(()=>{setShowOptions(false)},[selected]);
    useEffect(()=>setShowGroupInfo(false),[selected?.type])

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chats]);


    return (
        <>
            <div className={`flex flex-col  border rounded-r-md relative ${"flex-1"}`}>

                {/* Top section */}
                <div className="border h-[8%] flex flex-col  justify-center">
                    <div className="px-2">
                        {selected?.type === "chats" ?
                            <>To : <span className="text-red-500">{friend?.fname} {friend?.lname}</span></>
                            : <div  className="flex items-center justify-between">
                                <div onClick={() => setShowGroupInfo(true)} className="flex w-full items-center gap-2">
                                    <div className="border rounded-full w-[40px] h-[40px]"></div>
                                    <div className="flex flex-col">
                                        <p className="text-red-500">{group?.groupName}</p>
                                        {selected?.type === "group" && <p className="text-[12px]"> click here for group info</p>}
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
                        }} className="hover:bg-slate-300 w-full text-center border">Leave Group</li>
                        <li className="hover:bg-slate-300 w-full text-center border" >Group Info</li>
                        {((selected?.type === "group") && (groups?.find((g:any)=>g.groupId === selected?.id)?.createdBy === userId)) && <li onClick={()=>{setUpdateGroup(true)
                            openModal()
                        }} className="hover:bg-slate-300 w-full text-center border">Edit Group</li>}
                    </ul>
                </div>}

                {/* Chat Section */}
                <div ref={chatContainerRef}
                    className="h-[82%] p-2 flex flex-col gap-2 overflow-y-auto">
                    {(selected?.type === "chats") ?
                        chats?.map((chat: any, index: number) => {
                            const isSender = chat.senderId === userId;
                            return (
                                <div
                                    key={index}
                                    className={`border max-w-max rounded-full p-2 text-center ${isSender
                                        ? "bg-blue-100 self-end text-blue-700"
                                        : "bg-gray-100 self-start text-gray-700"
                                        }`}
                                >
                                    {chat.body}
                                </div>
                            );
                        }) : (
                            grouChats?.map((chat: any, index: number) => {
                                const isSender = chat.senderId === userId;

                                return (
                                    <div
                                        key={index}
                                        className={`border max-w-max rounded-full p-2 text-center ${isSender
                                            ? "bg-blue-100 self-end text-blue-700"
                                            : "bg-gray-100 self-start text-gray-700"
                                            }`}
                                    >
                                        <p className="text-[10px] text-red-500">{
                                            friends?.find((f: any) => f.userId === chat.senderId)
                                                ? `${friends.find((f: any) => f.userId === chat.senderId)?.fname}`
                                                : "you"
                                        }</p>
                                        <p>{chat.messageBody}</p>
                                    </div>
                                );
                            })
                        )
                    }
                </div>

                {/* bottom section */}
                <form className="h-[10%] flex w-full border items-center justify-center gap-3" onSubmit={(e) => handleClick(e)}>
                    <input className="border w-[70%]  p-1 rounded-md" type="text" value={messageBody} onChange={(e) => setMessageBody(e.target.value)} name="message" />
                    <button type="submit"> <IoSend className="text-[30px]" /> </button>
                </form>
            </div>

            <div className={`${showGroupInfo ? "w-[20%]" : "w-0"} border"`}>
                {showGroupInfo && <GroupInfo />}
            </div>
        </>
    )
}

export default RightSection;



