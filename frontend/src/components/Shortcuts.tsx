import { IoMdPerson } from "react-icons/io";
import { MdGroups2 } from "react-icons/md";
import { CiLogout } from "react-icons/ci";
import { logout } from "../action/authHandlers";
import { IoMdPersonAdd } from "react-icons/io";
import { useAppContext } from "../contexts/Contexts";
import friendRequestHandler from "../action/friendRequestHandler";
import { MdOutlineGroupAdd } from "react-icons/md";
import GroupHandler from "../action/GroupHandler";
import { useEffect } from "react";

const Shortcuts = () => {
    const { setShowItems, openModal, showItems, setShowGroupInfo } = useAppContext();
    const { getFriendRequest } = friendRequestHandler();
    const { getGroups } = GroupHandler();

    useEffect(() => {
        setShowGroupInfo(false);
    }, [showItems]);

    const navItems = [
        {
            icon: IoMdPerson,
            key: "FRIENDS",
            onClick: () => setShowItems("FRIENDS"),
            tooltip: "Friends"
        },
        {
            icon: MdGroups2,
            key: "GROUPS",
            onClick: () => {
                setShowItems("GROUPS");
                getGroups();
            },
            tooltip: "Groups"
        },
        {
            icon: IoMdPersonAdd,
            key: "NONFRIENDS",
            onClick: () => {
                setShowItems("NONFRIENDS");
                getFriendRequest();
            },
            tooltip: "Add Friends"
        },
        {
            icon: MdOutlineGroupAdd,
            key: "CREATEGROUP",
            onClick: () => {
                openModal();
                setShowItems("CREATEGROUP");
            },
            tooltip: "Create Group"
        }
    ];

    return (
        <div className="order-last sm:order-first w-full sm:w-16 h-16 sm:h-full flex sm:flex-col items-center justify-between bg-gradient-to-b from-[#1f3445] to-[#162736] border-t sm:border-t-0 sm:border-r border-[#2a4a5e]">
            <div className="flex sm:flex-col w-full sm:w-auto justify-evenly sm:justify-start items-center gap-1 sm:gap-2 sm:pt-6">
                {navItems.map(({ icon: Icon, key, onClick, tooltip }) => (
                    <button
                        key={key}
                        onClick={onClick}
                        title={tooltip}
                        className={`p-3 rounded-xl transition-all duration-200 hover:bg-[#2a4a5e] group relative ${
                            showItems === key
                                ? "bg-[#2a4a5e] text-cyan-400"
                                : "text-[#8aa4ba] hover:text-white"
                        }`}
                    >
                        <Icon className="text-2xl sm:text-[26px]" />
                        {showItems === key && (
                            <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full" />
                        )}
                    </button>
                ))}
            </div>

            <div className="pr-2 sm:pr-0 sm:pb-6">
                <button
                    onClick={logout}
                    title="Logout"
                    className="p-3 rounded-xl text-[#8aa4ba] hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
                >
                    <CiLogout className="text-2xl sm:text-[26px]" />
                </button>
            </div>
        </div>
    );
};

export default Shortcuts;