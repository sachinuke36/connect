import MiddleSection from "../components/MiddleSection";
import RightSection from "../components/RightSection";
import Shortcuts from "../components/Shortcuts";


const Home = ()=>{

    return (<div className="w-[100vw] h-[100vh]   flex ">
        <Shortcuts/>
        <MiddleSection/>
        <RightSection />
    </div>)
}

export default Home;