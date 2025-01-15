import { useAppContext } from '../contexts/Contexts';
import { RxCross1 } from "react-icons/rx";

const GroupInfo = () => {
 const { allUsers , selected, groups, setShowGroupInfo} = useAppContext();
 const groupMembers = groups?.find((g:any)=>g.groupId === selected?.id)?.membersIds.map((id:string)=>allUsers.find((f: any)=>f.userId === id))?.filter((member:any)=>member)
 const adminId = groups?.find((g:any)=> g.groupId === selected?.id)?.createdBy;
 const admin = allUsers?.find((u:any)=>u.userId === adminId)

  return (
    <div className='flex  sm:w-full bg-[#122532] text-white h-full flex-col py-3 items-center  gap-4'>
      <div onClick={()=>setShowGroupInfo(false)} className='flex items-center gap-3  w-full pl-3 cursor-pointer'><RxCross1 className='text-[25px]'/> <p>Group Info</p></div>
        {/* Image */}
        <div className=' rounded-full flex items-center justify-center font-extrabold text-[20px] sm:text-[46px] text-white bg-[#4487b3] w-[100px] h-[100px] sm:w-[200px] sm:h-[200px]'>{groups?.find((g:any)=>g?.groupId === selected?.id)?.groupName[0].toUpperCase()}</div>
        {/* Description */}
        <div className=' text-cyan-400 '>{groups?.find((g:any)=> g.groupId === selected?.id)?.groupName}</div>
        <div>
          {groups?.find((g:any)=> g.groupId === selected?.id)?.description}
        </div>

        {/* members list */}
        <div className='flex flex-col gap-3 w-full px-5'>
          <h1 className='font-extrabold f'>Group Members</h1>
            <div className='max-h-[440px] overflow-y-scroll'>
              {
              groupMembers?.sort((a: any, b: any) => {
                if (a.userId === adminId && b.userId !== adminId) return -1;
                if (a.userId !== adminId && b.userId === adminId) return 1;
                if (a.fname < b.fname) return -1;
                if (a.fname > b.fname) return 1;
            
                return 0; 
              }).map((m:any, k:any)=>(<div className='border border-[#344a5a] border-x-0 w-full p-2 hover:bg-[#435c71] cursor-pointer' key={k}>
              <p>{m?.fname} {m?.lname}   <span className={(m?.userId === adminId) ? 'bg-[#435c71] rounded-md px-2 py-1 text-cyan-400' :""}>{m?.userId === adminId && "admin"}</span></p>
            </div>))
            }

            </div>
        </div>
    </div>
  )
}

export default GroupInfo
