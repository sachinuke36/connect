import MiddleSection from "../components/MiddleSection";
import RightSection from "../components/RightSection";
import Shortcuts from "../components/Shortcuts";


const Home = ()=>{

    return (<div className="w-full h-[100vh] border  flex p-4">
        <Shortcuts/>
        <MiddleSection/>
        <RightSection />
    </div>)
}

export default Home;