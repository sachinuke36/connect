import { FaSearch } from "react-icons/fa";
import List from "./List";


const MiddleSection = ()=>{
    return (
        <div className="w-[30%]  flex flex-col  border  items-center">
            <div className="w-full border py-5 flex justify-center align-center">
                <div className="border w-[50%] flex rounded-md" >
                    <input placeholder="search" className="border w-[80%] p-1 outline-none" type="search" name="search"/>
                    <div className="flex justify-center items-center w-[20%]">  <button> <FaSearch /> </button> </div>
                </div>
            </div>


                <div className="overflow-y-scroll w-full">
                    <List/>
                </div>
        </div>
    )
}

export default MiddleSection;


