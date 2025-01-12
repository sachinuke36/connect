import { FaSearch } from "react-icons/fa";
import List from "./List";


const MiddleSection = ()=>{
    return (
        <div className="w-[30%] bg-[#071928] text-white flex flex-col   items-center">
            <div className="w-full  py-5 flex justify-center align-center">
                <div className="border border-[#1f3445] w-[50%] flex rounded-md" >
                    <input placeholder="search" className="bg-[#1f3445] w-[80%] p-1 outline-none" type="search" name="search"/>
                    <div className="flex bg-[#1f3445] justify-center items-center w-[20%]">  <button> <FaSearch className="text-[#8aa4ba]" /> </button> </div>
                </div>
            </div>


                <div className="overflow-y-scroll w-full">
                    <List/>
                </div>
        </div>
    )
}

export default MiddleSection;


