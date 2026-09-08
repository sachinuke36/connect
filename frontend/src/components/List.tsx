import { getUser } from "../action/authHandlers";
import friendRequestHandler from "../action/friendRequestHandler";
import { useAppContext } from "../contexts/Contexts";
import { MdGroups } from "react-icons/md";
import { useSocketContext } from "../contexts/SocketContext";

interface User {
    userId: string;
    fname: string;
    lname: string;
    gender: "MALE" | "FEMALE";
    username: string;
}

interface Group {
    groupId: string;
    groupName: string;
}

const List = ({ search }: { search: string }) => {
    const { friends, allUsers, showItems, selected, setSelected, friendRequests, groups } = useAppContext();
    const { sendRequest, acceptRequest } = friendRequestHandler();
    const notFriends = allUsers?.filter((u: User) => !(friends?.some((friend: User) => friend.userId === u.userId)));
    const userId = getUser();
    const { online } = useSocketContext();

    const getList = () => {
        if (showItems === "FRIENDS") return friends;
        if (showItems === "NONFRIENDS") return notFriends;
        if (showItems === "GROUPS") return [];
        return [];
    };

    const list = getList();

    const buttonObject: { [id: string]: string } = {};
    notFriends?.forEach((i: User) => {
        const isReceiver = friendRequests?.some(
            (req: { senderId: string; receiverId: string }) => req.senderId === i.userId && req.receiverId === userId
        );
        const isSender = friendRequests?.some(
            (req: { senderId: string; receiverId: string }) => req.senderId === userId && req.receiverId === i.userId
        );

        if (isReceiver) {
            buttonObject[i.userId] = "Accept";
        } else if (isSender) {
            buttonObject[i.userId] = "Request Sent";
        } else {
            buttonObject[i.userId] = "Add Friend";
        }
    });

    const currentUser = allUsers?.find((u: User) => u.userId === userId);

    if (showItems === "") {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold text-white">
                        {currentUser?.fname?.[0]?.toUpperCase() || "U"}
                    </span>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                    Welcome, {currentUser?.fname} {currentUser?.lname}!
                </h2>
                <p className="text-gray-400 text-sm">Select a conversation to start chatting</p>
            </div>
        );
    }

    if (showItems === "GROUPS") {
        if (!groups || groups.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <MdGroups className="text-4xl mb-2" />
                    <p>No groups found</p>
                    <p className="text-sm">Create a new group to get started</p>
                </div>
            );
        }

        return (
            <div className="py-2">
                {groups.map((group: Group) => (
                    <div
                        key={group.groupId}
                        onClick={() => setSelected({ type: "group", id: group.groupId })}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-[#1f3445] ${
                            selected?.id === group.groupId ? "bg-[#1f3445] border-l-4 border-cyan-500" : ""
                        }`}
                    >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <MdGroups className="text-white text-xl" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-white">{group.groupName}</p>
                            <p className="text-xs text-gray-400">Group chat</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (showItems === "FRIENDS" && (!friends || friends.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 p-4">
                <p className="text-center">No friends yet</p>
                <p className="text-sm text-center">Add friends to start chatting!</p>
            </div>
        );
    }

    const filteredList = list?.filter((item: User) =>
        item?.fname.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="py-2">
            {filteredList?.map((user: User) => {
                const isOnline = online?.includes(user.userId);
                const isSelected = selected?.id === user.userId;

                return (
                    <div
                        key={user.username}
                        onClick={() => setSelected({ type: "chats", id: user.userId })}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-[#1f3445] ${
                            isSelected ? "bg-[#1f3445] border-l-4 border-cyan-500" : ""
                        }`}
                    >
                        <div className="relative">
                            <img
                                loading="lazy"
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fname}&backgroundColor=b6e3f4`}
                                alt={user.fname}
                                className="w-12 h-12 rounded-full border-2 border-[#2a4a5e]"
                            />
                            {isOnline && (
                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#071928]" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">
                                {user.fname} {user.lname}
                            </p>
                            <p className={`text-xs ${isOnline ? "text-green-400" : "text-gray-400"}`}>
                                {isOnline ? "Online" : "Offline"}
                            </p>
                        </div>

                        {showItems === "NONFRIENDS" && user.userId !== userId && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (buttonObject[user.userId] === "Add Friend") {
                                        sendRequest(user.userId);
                                    } else if (buttonObject[user.userId] === "Accept") {
                                        acceptRequest(user.userId);
                                    }
                                }}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                    buttonObject[user.userId] === "Accept"
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : buttonObject[user.userId] === "Request Sent"
                                        ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                                        : "bg-cyan-600 hover:bg-cyan-700 text-white"
                                }`}
                                disabled={buttonObject[user.userId] === "Request Sent"}
                            >
                                {buttonObject[user.userId]}
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default List;
