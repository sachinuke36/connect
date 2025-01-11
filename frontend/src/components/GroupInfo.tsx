import { useAppContext } from '../contexts/Contexts';

const GroupInfo = () => {
 const { allUsers , selected, groups, setShowGroupInfo} = useAppContext();
 const groupMembers = groups?.find((g:any)=>g.groupId === selected?.id)?.membersIds.map((id:string)=>allUsers.find((f: any)=>f.userId === id))?.filter((member:any)=>member)
 const adminId = groups?.find((g:any)=> g.groupId === selected?.id)?.createdBy;
 const admin = allUsers?.find((u:any)=>u.userId === adminId)

  return (
    <div className='flex border h-full flex-col py-3 items-center  gap-4'>
      <div onClick={()=>setShowGroupInfo(false)} className='flex item-left w-full pl-3 cursor-pointer'>X</div>
        {/* Image */}
        <div className='border rounded-full w-[200px] h-[200px]'></div>
        {/* Description */}
        <div className=' text-orange-800 '>{groups?.find((g:any)=> g.groupId === selected?.id)?.groupName}</div>
        <div>
          {groups?.find((g:any)=> g.groupId === selected?.id)?.description}
        </div>

        {/* members list */}
        <div className='flex flex-col gap-3 w-full text-center'>
          <h1 className='font-extrabold f'>Group Members</h1>
            <div className='border max-h-[440px] overflow-y-scroll'>
              {
              groupMembers?.map((m:any, k:any)=>(<div className='border w-full p-2 hover:bg-slate-400 cursor-pointer' key={k}>
              <p>{m?.fname} {m?.lname} <span className={(m?.userId === adminId) ? 'border p-1 text-red-300' :""}>{m?.userId === adminId && "admin"}</span></p>
            </div>))
            }

            </div>
        </div>
    </div>
  )
}

export default GroupInfo
