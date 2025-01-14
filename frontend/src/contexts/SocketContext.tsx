import {createContext, ReactNode, useContext, useEffect, useState } from "react";
import { getUser } from "../action/authHandlers";
import { io, Socket } from "socket.io-client";
import { useAppContext } from "./Contexts";
import { toast } from "react-toastify";



const SocketContext = createContext<any>(null);

export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({children}:{children: ReactNode})=>{
    const [socket, setSocket] = useState<Socket | null>(null);
    const [calling, setCalling] = useState<string | null>(null);
    const [online, setOnline] = useState<string | null>(null);
    const userId = getUser();
    const {setFriendRequests, allUsers, setFriends,selected, getAllUsers, setChats, setGroupChats, setGroups} = useAppContext()

        useEffect(()=>{

            //socket connection
            if(userId){
                const socket = io("http://localhost:8000",{
                    query : {
                        userId : userId
                    }
                });
            setSocket(socket);

            // friend request sending
            socket.on("friend-request-sent", async({ senderId, receiverId }) => {
                setFriendRequests((prev : any)=>[...prev, {senderId, receiverId}]);
                if (!allUsers) await getAllUsers(); 
                const sender = allUsers?.find((u:any)=>u.userId === senderId)
                toast.info(`${sender.fname} ${sender.lname} sent you a friend request` ,{position: 'top-right'});
                console.log("Friend request received from:", senderId);
            });

            // accepting friend request
            socket.on("friend-request-accepted",async({message, userId: friendId})=>{
                if (!allUsers) await getAllUsers(); 
                const friend = allUsers?.find((u:any)=> u.userId === friendId);
                toast.success(`${friend.fname} ${friend.lname} accepted your friend request`, { position:"top-right"})
                if (friend) {
                    setFriends((prev: any) => [...prev, friend]);
                } else {
                    console.log("No friend found for friendId:", friendId);
                }
                console.log(message)
            });

            // messaging goes here
            socket.on("newMessage",({body, senderId, sent_at})=>{
                setChats((prev: any) => {
                    return [...prev, { senderId, body, sent_at }];
                });
                toast.info("message recieved" ,{position: 'top-right'});
                console.log("message recieved")
            })

            socket.on("newGroupMessage",({groupId, senderId, messageBody, sent_at})=>{
                setGroupChats((prev:any)=>[...prev, {groupId, senderId, messageBody, sent_at}])
            })

            socket.on("createGroup",({message, data})=>{
                console.log(data);
                toast.success(message,{position:"top-right"});
                setGroups((prev:any[])=>[...prev, data]);
            });

            socket.on("getOnlineUsers", (data)=>{
                setOnline(data);
            })


            }
            return ()=>{
                socket?.off("friend-request-sent");
                socket?.off("friend-request-accepted");
                socket?.off("newMessage");
                socket?.off("newGroupMessage");
                socket?.off("createGroup");
                socket?.off("getOnlineUsers");
                socket?.disconnect();
                setSocket(null);
            }
        },[userId, allUsers, getAllUsers, setFriendRequests, setFriends])


        useEffect(() => {
            if (socket && selected?.type === "group") {
                socket.emit("joinGroup", selected.id);
                // console.log(`Joined group with ID: ${selected.id}`);
            }
        }, [socket, selected]);


    return (<SocketContext.Provider value={{
        socket, setSocket, calling, setCalling, online
    }} >
            {children}
    </SocketContext.Provider>)
}