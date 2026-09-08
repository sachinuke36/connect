import { FaSearch } from "react-icons/fa";
import List from "./List";
import { useState } from "react";
import { useAppContext } from "../contexts/Contexts";

const MiddleSection = () => {
    const [search, setSearch] = useState<string>("");
    const { selected } = useAppContext();

    return (
        <div className={`w-full sm:w-80 lg:w-96 ${selected ? "hidden sm:flex" : "flex"} bg-[#071928] text-white flex-col border-r border-[#1f3445]`}>
            <div className="p-4 border-b border-[#1f3445]">
                <h1 className="text-xl font-bold text-white mb-4">Messages</h1>
                <div className="relative">
                    <input
                        placeholder="Search conversations..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#1f3445] text-white placeholder-gray-400 p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                        type="search"
                        name="search"
                    />
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1f3445] scrollbar-track-transparent">
                <List search={search} />
            </div>
        </div>
    );
};

export default MiddleSection;


