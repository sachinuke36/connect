import { useCallback } from 'react';
import { useAppContext } from '../contexts/Contexts'
import { getUser } from './authHandlers'

const GroupHandler = () => {
    const {BACKEND_URL, groups, setGroups, selected} = useAppContext()
    const userId =  getUser();


    const createGroup = useCallback(async(selectedFriends : string[], groupname : string, groupDescription : string)=>{
        const res = await fetch(BACKEND_URL + "/api/creategroup",{
            method: "POST",
            headers: {"Content-Type":"application/json"},
            credentials: "include",
            body : JSON.stringify({ userId, membersIds : selectedFriends, groupName : groupname, groupDescription})
        });
        const data = (await res.json()).message;
        console.log(data);
    },[BACKEND_URL]);

    const getGroups = useCallback(async()=>{
        try {
            const res = await fetch(BACKEND_URL + "/api/getgroup",{
                method: "POST",
                headers: {"Content-Type":"application/json"},
                credentials: "include",
                body : JSON.stringify({ userId })
            });
        const data = (await res.json()).data;
         setGroups(data)
        console.log(groups);
        } catch (error) {
            console.log("Error in getGroups",error);
        }
    },[])

    const leaveGroup = useCallback(async()=>{
        const userId = getUser();
        const groupId = selected?.id;
        try {
            const res = await fetch(BACKEND_URL + "/api/leavegroup",{
                method : "POST",
                credentials: "include",
                headers: {"Content-Type":"application/json"},
                body : JSON.stringify({groupId, userId})
            });
            const data = (await res.json()).data;
            console.log(data)
        } catch (error) {
            console.log("Error in leaveGroup", error);
        }
    },[selected]);

    const GroupUpdate = async(selectedFriends:string[], groupname:string, groupDescription:string)=>{
        if(selected?.type === "group"){
            try {
                const userId = getUser();
                const groupId = selected?.id;
                const res = await fetch(BACKEND_URL + "/api/updategroup",{
                    method : "POST",
                    credentials: "include",
                    headers: {"Content-Type":"application/json"},
                    body : JSON.stringify({groupId, userId, groupName: groupname, description: groupDescription, membersIds: selectedFriends})
                 });
            const data = (await res.json()).data;
            console.log(data)
            } catch (error) {
                console.log("Error in updating group!",error);
            }
        }

    }

  return {createGroup, getGroups, leaveGroup, GroupUpdate}
}

export default GroupHandler
