import { IoMdPerson } from "react-icons/io";
import { MdGroups2 } from "react-icons/md";
import { CiLogout } from "react-icons/ci";
import { logout } from "../action/authHandlers";
import { IoMdPersonAdd } from "react-icons/io";
import { useAppContext } from "../contexts/Contexts";
import friendRequestHandler from "../action/friendRequestHandler";
import { MdOutlineGroupAdd } from "react-icons/md";
import { useState } from "react";
import GroupHandler from "../action/GroupHandler";


const Shortcuts = () => {

  const { setShowItems, openModal } = useAppContext();
  const { getFriendRequest } = friendRequestHandler();
  const {getGroups} = GroupHandler()
  


  return (
    <div className="w-[5%]  flex flex-col items-center border rounded-l-md pt-6 justify-between gap-4">
      <div className="flex flex-col gap-3 items-center justify-center">
        <IoMdPerson onClick={() => setShowItems("FRIENDS")} className="text-[30px]" />
          
        <MdGroups2 onClick={() => {
          setShowItems("GROUPS");
          getGroups()}
        } className="text-[30px]" />

        <IoMdPersonAdd onClick={() => {
          setShowItems("NONFRIENDS");
          getFriendRequest()
        }} className="text-[30px]" />
        <MdOutlineGroupAdd onClick={openModal} className="text-[30px]" />


      </div>
      <div className="pb-2">
        <CiLogout onClick={logout} className="text-[30px]" />
      </div>
    </div>
  )
}

export default Shortcuts;