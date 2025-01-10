import {createContext, ReactNode, useContext, useEffect, useState } from "react";
import { getUser } from "../action/authHandlers";
import { io, Socket } from "socket.io-client";
import { useAppContext } from "./Contexts";



const SocketContext = createContext<any>(null);

export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({children}:{children: ReactNode})=>{
    const [socket, setSocket] = useState<Socket | null>(null);
    const userId = getUser();
    const {setFriendRequests, allUsers, setFriends, getAllUsers, setChats} = useAppContext()

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
            socket.on("friend-request-sent", ({ senderId, receiverId }) => {
                setFriendRequests((prev : any)=>[...prev, {senderId, receiverId}]);
                console.log("Friend request received from:", senderId);
            });

            // accepting friend request
            socket.on("friend-request-accepted",async({message, userId: friendId})=>{
                if (!allUsers) await getAllUsers(); 
                const friend = allUsers?.find((u:any)=> u.userId === friendId);
                if (friend) {
                    setFriends((prev: any) => [...prev, friend]);
                } else {
                    console.log("No friend found for friendId:", friendId);
                }
                console.log(message)
            });

            // messaging goes here
            socket.on("newMessage",({body, senderId})=>{
                // setChats((prev:any)=>[...prev, {senderId, body }]);
                setChats((prev: any) => {
                    const isDuplicate = prev.some(
                        (chat: any) => chat.body === body && chat.senderId === senderId
                    );
                    if (isDuplicate) return prev; // Avoid duplication
                    return [...prev, { senderId, body }];
                });
                console.log("message recieved")
            })

            }
            return ()=>{
                socket?.disconnect();
                setSocket(null);
            }
        },[userId, allUsers, getAllUsers, setFriendRequests, setFriends])


    return (<SocketContext.Provider value={{
        socket, setSocket
    }} >
            {children}
    </SocketContext.Provider>)
}