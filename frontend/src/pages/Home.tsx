import MiddleSection from "../components/MiddleSection";
import RightSection from "../components/RightSection";
import Shortcuts from "../components/Shortcuts";

const Home = () => {
    return (
        <div className="w-screen h-screen flex flex-col sm:flex-row overflow-hidden bg-[#071928]">
            <Shortcuts />
            <MiddleSection />
            <RightSection />
        </div>
    );
};

export default Home;