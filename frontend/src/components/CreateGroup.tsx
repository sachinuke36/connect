import Modal from "./Modal";
import { useAppContext } from "../contexts/Contexts";
import { useEffect, useState } from "react";
import GroupHandler from "../action/GroupHandler";
import { getUser } from "../action/authHandlers";
import { MdGroups } from "react-icons/md";

interface Friend {
    userId: string;
    fname: string;
    lname: string;
    gender: "MALE" | "FEMALE";
}

interface Group {
    groupId: string;
    groupName: string;
    description?: string;
    membersIds: string[];
}

const CreateGroup = () => {
    const { isModalOpen, closeModal, friends, selected, updateGroup, groups, setUpdateGroup, allUsers, setShowItems } = useAppContext();
    const { createGroup, GroupUpdate, loading } = GroupHandler();
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const [groupname, setGroupName] = useState<string>("");
    const [groupDescription, setGroupDescription] = useState<string>("");
    const [search, setSearch] = useState<string>("");
    const userId = getUser();

    const initialize = () => {
        if (selected?.type === "group" && updateGroup) {
            const group = groups?.find((g: Group) => g.groupId === selected?.id);
            setGroupName(group?.groupName || "");
            setGroupDescription(group?.description || "");
            setSelectedFriends(group?.membersIds || []);
        }
    };

    useEffect(() => {
        if (isModalOpen && updateGroup && selected?.type === "group" && groups?.length > 0) {
            initialize();
        }
        if (isModalOpen && !updateGroup) {
            setGroupName("");
            setGroupDescription("");
            setSelectedFriends([]);
            setSearch("");
        }
    }, [isModalOpen, updateGroup, selected, groups]);

    const handleSelected = (friendId: string) => {
        setSelectedFriends((prev) =>
            prev?.includes(friendId) ? prev.filter((id: string) => id !== friendId) : [...prev, friendId]
        );
    };

    const handleSubmit = () => {
        if (!groupname.trim()) return;

        if (updateGroup) {
            GroupUpdate(selectedFriends, groupname, groupDescription);
        } else {
            createGroup(selectedFriends, groupname, groupDescription);
        }
        setGroupDescription("");
        setGroupName("");
        setSelectedFriends([]);
        closeModal();
        setUpdateGroup(false);
    };

    const filteredFriends = friends?.filter((f: Friend) =>
        f.fname.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 border-b border-[#2a4a5e] pb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <MdGroups className="text-white text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {updateGroup ? "Update Group" : "Create New Group"}
                        </h2>
                        <p className="text-sm text-gray-400">
                            {updateGroup ? "Modify your group settings" : "Add friends to your new group"}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <input
                        onChange={(e) => setGroupName(e.target.value)}
                        value={groupname}
                        className="w-full bg-[#0c1317] text-white placeholder-gray-400 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/50 border border-[#2a4a5e]"
                        type="text"
                        name="groupname"
                        placeholder="Group name *"
                        required
                    />
                    <input
                        onChange={(e) => setGroupDescription(e.target.value)}
                        value={groupDescription}
                        className="w-full bg-[#0c1317] text-white placeholder-gray-400 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/50 border border-[#2a4a5e]"
                        type="text"
                        name="groupdescription"
                        placeholder="Group description (optional)"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                        Add Members
                    </label>
                    <input
                        placeholder="Search friends..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#0c1317] text-white placeholder-gray-400 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/50 border border-[#2a4a5e] mb-3"
                        type="search"
                    />
                    <div className="max-h-48 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-[#2a4a5e]">
                        {filteredFriends?.map((friend: Friend) => {
                            const friendData = allUsers?.find((u: Friend) => u.userId === friend.userId);
                            const isChecked = selectedFriends.includes(friend.userId);
                            const isDisabled = updateGroup && friend.userId === userId;

                            return (
                                <label
                                    key={friend.userId}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                                        isChecked ? "bg-cyan-600/20 border border-cyan-500" : "bg-[#0c1317] border border-[#2a4a5e] hover:border-[#3a5a7e]"
                                    } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    <input
                                        type="checkbox"
                                        disabled={isDisabled}
                                        checked={isChecked}
                                        onChange={() => handleSelected(friend.userId)}
                                        className="w-4 h-4 accent-cyan-500"
                                    />
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friendData?.fname}&backgroundColor=b6e3f4`}
                                        alt={friendData?.fname}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <span className="text-white">
                                        {friendData?.fname} {friendData?.lname}
                                    </span>
                                </label>
                            );
                        })}
                        {filteredFriends?.length === 0 && (
                            <p className="text-center text-gray-400 py-4">No friends found</p>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        className="flex-1 px-4 py-3 text-white bg-[#2a4a5e] rounded-xl hover:bg-[#3a5a7e] transition-colors font-medium"
                        onClick={() => {
                            closeModal();
                            setShowItems("FRIENDS");
                            setUpdateGroup(false);
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!groupname.trim() || loading}
                        className="flex-1 px-4 py-3 text-white bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl hover:opacity-90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>{updateGroup ? "Updating..." : "Creating..."}</span>
                            </div>
                        ) : (
                            updateGroup ? "Update Group" : "Create Group"
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CreateGroup;
