import Modal from "./Modal"
import { useAppContext } from "../contexts/Contexts";
import { FaSearch } from "react-icons/fa";
import { useEffect, useState } from "react";
import GroupHandler from "../action/GroupHandler";
import { getUser } from "../action/authHandlers";
const CreateGroup = () => {
    const { isModalOpen, closeModal, friends, selected, updateGroup, groups, setUpdateGroup, allUsers } = useAppContext();
    const { createGroup, GroupUpdate } = GroupHandler()
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const [groupname, setGroupName] = useState<string>();
    const [groupDescription, setGroupDescription] = useState<string>();
    const userId = getUser();

    const initialize = () => {
        if (selected?.type === "group" && updateGroup) {
            const group = groups?.find((g: any) => g.groupId === selected?.id);
            setGroupName(group?.groupName || "");
            setGroupDescription(group?.description || "");
            setSelectedFriends(group?.membersIds || []);
        }
    }
    useEffect(() => {
        if (isModalOpen && updateGroup && selected?.type === "group" && groups?.length > 0) {
            initialize();
        }
    }, [isModalOpen, updateGroup, selected, groups]);


    const handlSelected = (userId: string) => {
        setSelectedFriends((prev) => prev?.includes(userId) ? prev.filter((id: string) => id !== userId) : [...prev, userId])
    }
    return (

        <Modal isOpen={isModalOpen} onClose={closeModal}>
            {
                    <> <div>{updateGroup ? "Update group" : "Create group"}</div>
                        <div className="border w-[50%] flex rounded-md" >
                            <input placeholder="search" className="border w-[80%] p-1 outline-none" type="search" name="search" />
                            <div className="flex justify-center items-center w-[20%]">  <button> <FaSearch /> </button> </div>
                        </div>
                        {/* List of all the friends to add to group */}
                        <div className="my-2 flex gap-3">
                            <input onChange={(e) => setGroupName(e.target.value)} value={groupname} className="border p-1 rounded-sm" type="text" name="groupname" placeholder="Enter group name" required id="" />
                            <input onChange={(e) => setGroupDescription(e.target.value)} value={groupDescription} className="border p-1 rounded-sm" type="text" name="groupdescriptio" placeholder="Enter group description (optional)" id="" />
                        </div>
                        <div className="my-2">
                            <label htmlFor="friends-select" className="block text-sm font-bold text-gray-700">
                                Add Friends
                            </label>
                            <div className="flex flex-col gap-2 mt-2">
                                {updateGroup ?
                                    Array.isArray(friends) &&
                                    friends?.map((f: any, k: any) => (
                                        <label key={k} className="flex items-center space-x-2">
                                            <input type="checkbox" disabled={f?.userId === userId} checked={selectedFriends.includes(f?.userId)} value={f?.userId} onChange={() => handlSelected(f?.userId)} />
                                            <span>{allUsers?.find((g: any) => g?.userId === f?.userId)?.fname}</span>
                                        </label>
                                    ))
                                    : Array.isArray(friends) &&
                                    friends.map((f: any) => (
                                        <label key={f.userId} className="flex items-center space-x-2">
                                            <input type="checkbox" value={f.userId} onChange={() => handlSelected(f.userId)} />
                                            <span>{f.fname}</span>
                                        </label>
                                    ))}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="mt-6 px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600" onClick={closeModal}>Close</button>
                            <button onClick={() => {
                                if (updateGroup) {
                                    GroupUpdate(selectedFriends, groupname!, groupDescription!);
                                } else {
                                    createGroup(selectedFriends, groupname!, groupDescription!);
                                }
                                closeModal();
                                setUpdateGroup(false)
                            }} className="mt-6 px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600" >{updateGroup ? "Update group" : "Create group"}</button>
                        </div> </>
            }
        </Modal>
    )
}

export default CreateGroup
