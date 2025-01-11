import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import { getCookies, useAuth } from "./contexts/AuthContexts"
import { useEffect } from "react"
import CreateGroup from "./components/CreateGroup"
// import Login from "./pages/Login"
import { ToastContainer, toast } from 'react-toastify';


const App = () => {
  const { isLoggedIn, setIsLoggedIn} = useAuth();
  const cookies = getCookies();

  useEffect(()=>{
    if(cookies) setIsLoggedIn(true);
    else setIsLoggedIn(false);
  
  },[cookies])
 
  
  
  return (
    <>
      <Routes>
        { !isLoggedIn ? <>
                    <Route path="/login" element={<Login/>}/>
                   </>
                : 
                  <>
                    <Route path="/" element={<Home/>}/>
                  </> 
          }
         <Route path="*"  element={ isLoggedIn ? <Home/> : <Login/>} ></Route>
         
      </Routes>
      <CreateGroup/>
      <ToastContainer/>
    </>
  )
}

export default App
