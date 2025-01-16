
import { createContext, ReactNode, useContext, useEffect, useState, useCallback } from "react";
import { getUser } from "../action/authHandlers";
// import { getFriendRequest } from "../action/friendRequestHandler";
type items = "FRIENDS" | "GROUPS" | "NONFRIENDS" | "CREATEGROUP" | ""
 


export const AppContext = createContext<any>(null);

export const useAppContext = () => useContext(AppContext);

export const AppContexProvider = ({ children }: { children: ReactNode }) => {
    const [selected, setSelected] = useState<any>(null);
    const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
    const [friends, setFriends] = useState<any>(null);
    const [allUsers, setAllUsers] = useState<any>(null);
    const [chats, setChats] = useState<any>(null);
    const [addFriends, setAddFriends] = useState<boolean>(false);
    const [showItems, setShowItems] = useState<items>("")
    const [friendRequests, setFriendRequests] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [groups, setGroups] = useState<any[]>([]);
    const [grouChats, setGroupChats] = useState<any>(null);
    const [showGroupInfo, setShowGroupInfo] = useState<boolean>(false);
    const [updateGroup, setUpdateGroup] = useState<boolean>(false);
    
    let userString = localStorage.getItem("user");

    const getFriends = useCallback(async () => {
        if (!userString) return;
        try {
            const user = JSON.parse(userString);
            const res = await fetch(BACKEND_URL + "/api/getFriends", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username: user?.username }),
            });
            const data = await res.json();
            console.log(data);
            setFriends(data.data);
        } catch (error) {
            console.log("Error in getChats");
        }
    }, [addFriends, showItems, friendRequests, BACKEND_URL, userString]); 

    const fetChats = useCallback(async () => {
        if (!userString) return;
        const username = JSON.parse(userString).username;
        const friendUserId = selected?.id;
        const res = await fetch(BACKEND_URL + "/api/getchats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username, friendUserId }),
        });
        const data = await res.json();
        setChats(data.data);
    }, [selected, userString, BACKEND_URL]); 


    const getGroupChats = useCallback(async()=>{
        try {
            if(selected?.type === "group"){
                const res = await fetch(BACKEND_URL + "/api/getgroupchats",{
                    method: "POST",
                    credentials : "include",
                    headers: { "Content-Type": "application/json" },
                    body : JSON.stringify({groupId : selected?.id})
                })
                const data = (await res.json()).data;
                 setGroupChats(data);
                console.log("hii")
                console.log(data)
            }
        } catch (error) {
            console.log("Error in getGroupChats", error)
        }
    },[selected, userString, BACKEND_URL ])

    const getAllUsers = useCallback(async () => {
        try {
            const res = await fetch(BACKEND_URL + "/api/fetchallusers", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", 
            });
            const data = await res.json();
            if (res.ok) {
                setAllUsers(data.data); 
            } else {
                console.log("Failed to fetch users");
            }
        } catch (error) {
            console.error(error);
        } 
    }, [addFriends, showItems, friendRequests, BACKEND_URL, userString]); 

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);


    useEffect(() => {
            getFriends();
    }, [getFriends, userString]); // Dependency is the memoized function getChats

    useEffect(() => {
      if(selected?.type === "chats") fetChats();
    }, [fetChats, selected]); // Dependency is the memoized function fetChats

    useEffect(() => {
        getAllUsers(); // Call the memoized function
    }, [getAllUsers, userString]);

    useEffect(() => {
        if(selected?.type === "group") getGroupChats();
      }, [getGroupChats, selected]);

    return (
        <AppContext.Provider
            value={{
                selected,
                setSelected,
                setFriends,
                friends,
                chats,
                setChats,
                BACKEND_URL,
                addFriends,
                setAddFriends,
                allUsers,
                setAllUsers,
                showItems, setShowItems,
                friendRequests, setFriendRequests,
                openModal, closeModal,
                isModalOpen, setIsModalOpen,
                groups, setGroups,
                grouChats, setGroupChats,
                showGroupInfo, setShowGroupInfo,
                updateGroup, setUpdateGroup, getAllUsers,getFriends

            }}
        >
            {children}
        </AppContext.Provider>
    );
};































// import { createContext, ReactNode, useContext, useEffect, useState } from "react";

// export const AppContext = createContext<any>(null);

// export const useAppContext = ()=> useContext(AppContext);

// export const AppContexProvider = ({children}:{children: ReactNode})=>{
//     const [selected, setSelected] = useState<string | undefined>("");
//     const BACKEND_URL = "http://localhost:8000"
//     const [friends, setFriends] = useState<any>(null);
//     const [allUsers, setAllUsers] = useState<any>(null);
//     const [chats, setChats] = useState();
//     const [addFriends, setAddFriends] = useState<boolean>(false);
//     let userString = localStorage.getItem("user");

//         useEffect(()=>{
//             const getChats = async()=>{
                
//                 if(!userString) return
//                 try {
//                     const user = JSON.parse(userString);
//                     const res = await fetch(BACKEND_URL + "/api/getFriends",{
//                         method:"POST",
//                         headers: { "Content-Type": "application/json"},
//                         credentials:"include",
//                         body : JSON.stringify({username: user?.username})
//                     });
//                     const data = await res.json()
//                     setFriends(data.data);
//                 } catch (error) {
//                     console.log("Error in getChats");
//                 }
                
//             }
//             getChats();
//         },[setFriends]);


//     useEffect(()=>{
//         const fetChats = async()=>{
//             if(!userString) return;
//             const username = JSON.parse(userString).username;
//             const friendUserId = selected;
//             console.log(selected)
//             const res = await fetch(BACKEND_URL + "/api/getchats",{
//                 method: "POST",
//                 headers: { "Content-Type": "application/json"},
//                 credentials: "include",
//                 body: JSON.stringify({username, friendUserId})
//             });
//             const data = await res.json();
//             setChats(data.data)
//         }
//         fetChats()
//     },[selected])

    











//    return ( <AppContext.Provider value={{selected,
//     setSelected, setFriends, friends, chats,
//     setChats, BACKEND_URL, addFriends, setAddFriends}}>
//             {children}
//          </AppContext.Provider>)
// }