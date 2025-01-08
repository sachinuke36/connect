import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import { getCookies, useAuth } from "./contexts/AuthContexts"
import { useEffect } from "react"
import CreateGroup from "./components/CreateGroup"
// import Login from "./pages/Login"

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
                    <Route path="/h" element={<h1>hii</h1>}/>
                    

                  </> 
          }
         <Route path="*"  element={ isLoggedIn ? <Home/> : <Login/>} ></Route>
         
      </Routes>
      <CreateGroup/>
    </>
  )
}

export default App
