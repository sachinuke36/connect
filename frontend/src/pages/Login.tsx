import { useState } from "react";
import LoginForm from "../components/LoginForm";
import RegistrationForm from "../components/RegistrationForm";


 const Login = ()=>{
    const [isAcc, setIsAcc] = useState<boolean>(true);

    return (
        <div className="w-full mt-[10%]">
            <div className="mx-auto w-[600px] border p-6">
             <h1 className="text-center text-[22px]">{isAcc ? "Login" : "Register"}</h1>
                {isAcc ? <LoginForm  setIsAcc={setIsAcc}/> : <RegistrationForm setIsAcc={setIsAcc}/>}
            </div>
        </div>
    )
}

export default Login;
