import {createContext, ReactNode, useContext, useEffect, useState } from "react";
import { getUser } from "../action/authHandlers";
import { io, Socket } from "socket.io-client";
import { useAppContext } from "./Contexts";
import { toast } from "react-toastify";



const SocketContext = createContext<any>(null);

export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({children}:{children: ReactNode})=>{
    const [socket, setSocket] = useState<Socket | null>(null);
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
            socket.on("newMessage",({body, senderId})=>{
                setChats((prev: any) => {
                    return [...prev, { senderId, body }];
                });
                toast.info("message recieved" ,{position: 'top-right'});
                console.log("message recieved")
            })

            socket.on("newGroupMessage",({groupId, senderId, messageBody})=>{
                setGroupChats((prev:any)=>[...prev, {groupId, senderId, messageBody}])
            })

            socket.on("createGroup",({message, data})=>{
                console.log(data);
                toast.success(message,{position:"top-right"});
                setGroups((prev:any[])=>[...prev, data]);
            })


            }
            return ()=>{
                socket?.disconnect();
                setSocket(null);
            }
        },[userId, allUsers, getAllUsers, setFriendRequests, setFriends])


        useEffect(() => {
            if (socket && selected?.type === "group") {
                socket.emit("joinGroup", selected.id);
                console.log(`Joined group with ID: ${selected.id}`);
            }
        }, [socket, selected]);


    return (<SocketContext.Provider value={{
        socket, setSocket
    }} >
            {children}
    </SocketContext.Provider>)
}