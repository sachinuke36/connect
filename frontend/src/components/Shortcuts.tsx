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
  const {getGroups} = GroupHandler();
  useEffect(()=>{
    setShowGroupInfo(false);
  },[showItems])
  


  return (
    <div className="w-full absolute sm:relative bottom-0  h-[50px] sm:h-full flex sm:w-[5%]  sm:flex bg-[#1f3445] text-[#8aa4ba]   sm:flex-col items-center   sm:pt-6 justify-evenly pr-5 sm:pr-0 sm:justify-between sm:gap-4">
      <div className="flex w-full justify-evenly sm:flex-col gap-3 items-center sm:justify-center">
        <IoMdPerson onClick={() => setShowItems("FRIENDS")} className={`text-[30px] cursor-pointer ${showItems === "FRIENDS" ? " border-b-2 border-cyan-600" :""}`} />          
        <MdGroups2 onClick={() => {
          setShowItems("GROUPS");
          getGroups()}
        } className={`text-[30px] cursor-pointer ${showItems === "GROUPS" ? " border-b-2 border-cyan-600" :""}`}/>

        <IoMdPersonAdd onClick={() => {
          setShowItems("NONFRIENDS");
          getFriendRequest()
        }} className={`text-[30px] cursor-pointer ${showItems === "NONFRIENDS" ? " border-b-2 border-cyan-600" :""}`} />
        <MdOutlineGroupAdd onClick={()=>{openModal();
           setShowItems("CREATEGROUP")}} className={`text-[30px] cursor-pointer ${showItems === "CREATEGROUP" ? " border-b-2 border-cyan-600" :""}`} />


      </div>
      <div className="pb-2">
        <CiLogout onClick={logout} className="text-[30px] cursor-pointer" />
      </div>
    </div>
  )
}

export default Shortcuts;