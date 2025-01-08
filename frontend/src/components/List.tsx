import { getUser } from "../action/authHandlers";
import friendRequestHandler from "../action/friendRequestHandler";
// import  sendRequest  from "../action/friendRequestHandler";
import { useAppContext } from "../contexts/Contexts"

const List = () => {
   
    const {friends, allUsers, showItems, selected, setSelected, friendRequests, groups} = useAppContext();
    const { sendRequest, acceptRequest} = friendRequestHandler()
    const notFriends = allUsers?.filter((u:any)=> !(friends?.some((friend:any)=>friend.userId === u.userId)));
    const getList =()=>{
        if(showItems === "FRIENDS") return friends;
        if(showItems === "NONFRIENDS") return notFriends;
        if(showItems === "GROUPS") return []
    }
    const List = getList();
    const  userId  = getUser();

    const buttonObject : {[id:string]:string} = {};
    notFriends?.forEach((i: any) => {
        const isReceiver = friendRequests?.some(
            (req: any) => req.senderId === i.userId && req.receiverId === userId
        );
        const isSender = friendRequests?.some(
            (req: any) => req.senderId === userId && req.receiverId === i.userId
        );

        if (isReceiver) {
            buttonObject[i.userId] = "Accept";
        } else if (isSender) {
            buttonObject[i.userId] = "Request Sent";
        } else {
            buttonObject[i.userId] = "Add Friend";
        }
    });
    
    return (
        <>
            {
                (showItems === "GROUPS") ?
                groups?.map((i: any, k:any) =>
                    <div className={`flex w-full py-2 border flex-col  ${(selected?.id === i.groupId) ? "bg-slate-400" : null}`} onClick={() => setSelected({type:"group",id:i.groupId})} key={k}>
                        <div className="flex px-2 items-center gap-3">
                            <div className="rounded-[50%] border h-[30px] w-[30px]"></div>
                            <div>{i.groupName}</div>
                        </div>
                    </div>
                ) : (
                    List?.map((i: any) =>
                        <div className={`flex w-full py-2 border flex-col  ${(selected?.id === i.userId) ? "bg-slate-400" : null}`} onClick={() => setSelected({type:"chats", id:i.userId})} key={i.username}>
                            <div className="flex px-2 items-center gap-3">
                                <div className="rounded-[50%] border h-[30px] w-[30px]"></div>
                                <div>{i.fname} {i.lname}</div>
                            <div>{(showItems === "NONFRIENDS") && (i.userId !== userId) ? 
                            <button onClick={()=>{
                                
                                if(buttonObject[i.userId] === "Add Friend"){
                                    sendRequest(i.userId);
                                }else if(buttonObject[i.userId] === "Accept"){
                                    acceptRequest(i.userId);
                                }
                            }} className="border p-1 rounded-md">{buttonObject[i.userId]}</button>
                             : null }</div>
                            </div>
                        </div>
                    )
                )
            }
        </>
    )
}

export default List
