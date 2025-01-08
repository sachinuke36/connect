import { IoMdPerson } from "react-icons/io";
import { MdGroups2 } from "react-icons/md";
import { CiLogout } from "react-icons/ci";
import { logout } from "../action/authHandlers";
import { IoMdPersonAdd } from "react-icons/io";
import { useAppContext } from "../contexts/Contexts";
import friendRequestHandler from "../action/friendRequestHandler";
import { MdOutlineGroupAdd } from "react-icons/md";
import GroupHandler from "../action/GroupHandler";


const Shortcuts = () => {

  const { setShowItems, openModal, showItems } = useAppContext();
  const { getFriendRequest } = friendRequestHandler();
  const {getGroups} = GroupHandler()
  


  return (
    <div className="w-[5%]  flex flex-col items-center border rounded-l-md pt-6 justify-between gap-4">
      <div className="flex flex-col gap-3 items-center justify-center">
        <IoMdPerson onClick={() => setShowItems("FRIENDS")} className={`text-[30px] ${showItems === "FRIENDS" ? " border-b-2 border-cyan-600" :""}`} />
          
        <MdGroups2 onClick={() => {
          setShowItems("GROUPS");
          getGroups()}
        } className={`text-[30px] ${showItems === "GROUPS" ? " border-b-2 border-cyan-600" :""}`}/>

        <IoMdPersonAdd onClick={() => {
          setShowItems("NONFRIENDS");
          getFriendRequest()
        }} className={`text-[30px] ${showItems === "NONFRIENDS" ? " border-b-2 border-cyan-600" :""}`} />
        <MdOutlineGroupAdd onClick={()=>{openModal();
           setShowItems("CREATEGROUP")}} className={`text-[30px] ${showItems === "CREATEGROUP" ? " border-b-2 border-cyan-600" :""}`} />


      </div>
      <div className="pb-2">
        <CiLogout onClick={logout} className="text-[30px]" />
      </div>
    </div>
  )
}

export default Shortcuts;