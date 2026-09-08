import { useCallback, useState } from 'react';
import { useAppContext } from '../contexts/Contexts'
import { getUser } from './authHandlers'
import { useSocketContext } from '../contexts/SocketContext';
import { toast } from 'react-toastify';

const GroupHandler = () => {
    const {BACKEND_URL, setGroups, selected, setSelected} = useAppContext();
    const {socket} = useSocketContext()
    const userId =  getUser();
    const [loading, setLoading] = useState(false);


    const createGroup = useCallback(async(selectedFriends : string[], groupname : string, groupDescription : string)=>{
        try {
            setLoading(true);
            const res = await fetch(BACKEND_URL + "/api/creategroup",{
                method: "POST",
                headers: {"Content-Type":"application/json"},
                credentials: "include",
                body : JSON.stringify({ userId, membersIds : selectedFriends, groupName : groupname, groupDescription})
            });
            const result = await res.json();

            if (res.ok && result.data) {
                // Add the new group to local state
                setGroups((prev: any[]) => [...prev, result.data]);
                socket?.emit('createGroup', { userId, membersIds: selectedFriends, groupName: groupname, groupDescription });
                toast.success("Group created successfully!", { position: "top-right" });
            } else {
                toast.error(result.message || "Failed to create group", { position: "top-right" });
            }
        } catch (error) {
            console.error("Error creating group:", error);
            toast.error("Failed to create group", { position: "top-right" });
        } finally {
            setLoading(false);
        }
    },[BACKEND_URL, userId, socket, setGroups]);

    const getGroups = useCallback(async()=>{
        try {
            setLoading(true);
            const res = await fetch(BACKEND_URL + "/api/getgroup",{
                method: "POST",
                headers: {"Content-Type":"application/json"},
                credentials: "include",
                body : JSON.stringify({ userId })
            });
            const result = await res.json();

            if (res.ok && result.data) {
                setGroups(result.data);
            }
        } catch (error) {
            console.error("Error in getGroups", error);
            toast.error("Failed to fetch groups", { position: "top-right" });
        } finally {
            setLoading(false);
        }
    },[BACKEND_URL, userId, setGroups])

    const leaveGroup = useCallback(async()=>{
        const userId = getUser();
        const groupId = selected?.id;
        try {
            setLoading(true);
            const res = await fetch(BACKEND_URL + "/api/leavegroup",{
                method : "POST",
                credentials: "include",
                headers: {"Content-Type":"application/json"},
                body : JSON.stringify({groupId, userId})
            });
            const result = await res.json();

            if (res.ok) {
                // Remove group from local state
                setGroups((prev: any[]) => prev.filter(g => g.groupId !== groupId));
                setSelected(null);
                toast.success("You left the group", { position: "top-right" });
            } else {
                toast.error(result.message || "Failed to leave group", { position: "top-right" });
            }
        } catch (error) {
            console.error("Error in leaveGroup", error);
            toast.error("Failed to leave group", { position: "top-right" });
        } finally {
            setLoading(false);
        }
    },[selected, BACKEND_URL, setGroups, setSelected]);

    const GroupUpdate = useCallback(async(selectedFriends:string[], groupname:string, groupDescription:string)=>{
        if(selected?.type === "group"){
            try {
                setLoading(true);
                const userId = getUser();
                const groupId = selected?.id;
                const res = await fetch(BACKEND_URL + "/api/updategroup",{
                    method : "POST",
                    credentials: "include",
                    headers: {"Content-Type":"application/json"},
                    body : JSON.stringify({groupId, userId, groupName: groupname, description: groupDescription, membersIds: selectedFriends})
                 });
                const result = await res.json();

                if (res.ok) {
                    // Update group in local state
                    setGroups((prev: any[]) => prev.map(g =>
                        g.groupId === groupId
                            ? { ...g, groupName: groupname, description: groupDescription, membersIds: selectedFriends }
                            : g
                    ));
                    toast.success("Group updated successfully!", { position: "top-right" });
                } else {
                    toast.error(result.message || "Failed to update group", { position: "top-right" });
                }
            } catch (error) {
                console.error("Error in updating group!", error);
                toast.error("Failed to update group", { position: "top-right" });
            } finally {
                setLoading(false);
            }
        }
    }, [selected, BACKEND_URL, setGroups]);

  return {createGroup, getGroups, leaveGroup, GroupUpdate, loading}
}

export default GroupHandler
