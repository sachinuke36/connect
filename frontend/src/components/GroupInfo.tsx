import { useAppContext } from "../contexts/Contexts";
import { IoClose } from "react-icons/io5";
import { MdGroups, MdAdminPanelSettings } from "react-icons/md";

interface User {
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
    createdBy: string;
}

const GroupInfo = () => {
    const { allUsers, selected, groups, setShowGroupInfo } = useAppContext();

    const currentGroup = groups?.find((g: Group) => g.groupId === selected?.id);
    const groupMembers = currentGroup?.membersIds
        .map((id: string) => allUsers?.find((u: User) => u.userId === id))
        .filter((member: User | undefined): member is User => !!member);
    const adminId = currentGroup?.createdBy;

    const sortedMembers = groupMembers?.sort((a: User, b: User) => {
        if (a.userId === adminId && b.userId !== adminId) return -1;
        if (a.userId !== adminId && b.userId === adminId) return 1;
        return a.fname.localeCompare(b.fname);
    });

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-[#122532] to-[#0a1929] text-white">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-[#2a4a5e]">
                <button
                    onClick={() => setShowGroupInfo(false)}
                    className="p-2 hover:bg-[#2a4a5e] rounded-lg transition-colors"
                >
                    <IoClose className="text-xl" />
                </button>
                <p className="font-semibold">Group Info</p>
            </div>

            {/* Group Avatar & Name */}
            <div className="flex flex-col items-center py-6 px-4 border-b border-[#2a4a5e]">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                    <span className="text-4xl font-bold text-white">
                        {currentGroup?.groupName?.[0]?.toUpperCase()}
                    </span>
                </div>
                <h2 className="text-xl font-bold text-white">{currentGroup?.groupName}</h2>
                {currentGroup?.description && (
                    <p className="text-sm text-gray-400 text-center mt-2">{currentGroup.description}</p>
                )}
                <div className="flex items-center gap-2 mt-3 text-sm text-cyan-400">
                    <MdGroups className="text-lg" />
                    <span>{groupMembers?.length || 0} members</span>
                </div>
            </div>

            {/* Members List */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 py-3 border-b border-[#2a4a5e]">
                    <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wide">
                        Members
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#2a4a5e]">
                    {sortedMembers?.map((member: User) => {
                        const isAdmin = member.userId === adminId;
                        return (
                            <div
                                key={member.userId}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-[#1f3445] transition-colors"
                            >
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.fname}&backgroundColor=b6e3f4`}
                                    alt={member.fname}
                                    className="w-10 h-10 rounded-full border border-[#2a4a5e]"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white truncate">
                                        {member.fname} {member.lname}
                                    </p>
                                    {isAdmin && (
                                        <p className="text-xs text-cyan-400">Group Admin</p>
                                    )}
                                </div>
                                {isAdmin && (
                                    <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                                        <MdAdminPanelSettings className="text-cyan-400" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default GroupInfo;
