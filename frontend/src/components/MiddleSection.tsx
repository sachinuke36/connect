import { FaSearch } from "react-icons/fa";
import List from "./List";
import { useState } from "react";


const MiddleSection = ()=>{
    const [search, setSearch] = useState<string>("");
    return (
        <div className="w-[30%] bg-[#071928] text-white flex flex-col   items-center">
            <div className="w-full  py-5 flex justify-center align-center">
                <div className="border border-[#1f3445] w-[50%] flex rounded-md" >
                    <input placeholder="search" value={search} onChange={(e)=>setSearch(e.target.value)} className="bg-[#1f3445] w-[80%] p-1 outline-none" type="search" name="search"/>
                    <div className="flex bg-[#1f3445] justify-center items-center w-[20%]">  <button> <FaSearch className="text-[#8aa4ba]" /> </button> </div>
                </div>
            </div>


                <div className="overflow-y-scroll w-full">
                    <List search={search}/>
                </div>
        </div>
    )
}

export default MiddleSection;


