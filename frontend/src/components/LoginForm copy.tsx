import {  useState } from "react";
import { useLogin } from "../action/authHandlers";


const LoginForm = ({ setIsAcc}:{setIsAcc:(value:boolean)=>void})=>{
    const [username, setUsername] = useState<string | undefined>("");
    const [password, setPassword] = useState<string | undefined>("");
    const {login, loading} =  useLogin();

const handleLogin = async( e : React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
   await login(username, password);
}

    return (
        <div>
            <form className="flex flex-col gap-4" onSubmit={(e)=>handleLogin(e)}>
                    <div className="flex flex-col">
                        <label htmlFor="username">Username</label>
                        <input className="border p-1 px-5" value={username} onChange={(e:any)=>setUsername(e.target.value)} type="text" name="username" required />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="password">Password</label>
                        <input className="border p-1 px-5" value={password} onChange={(e:any)=>setPassword(e.target.value)} type="password" name="password" required/>
                    </div>
                    <button disabled={loading} className={` border w-[200px] mx-auto p-2 rounded-md `} type="submit" >
                        {
                            loading ? <svg className="animate-spin mx-auto border-t-2 border-r-2 rounded-full border-green-600 h-5 w-5 " viewBox="0 0 24 24"/> :
                            <span>Login </span> 
                        }
                         
                    </button>
                </form>
                <p className="my-3"><span>Don't have an account ? <button onClick={()=>setIsAcc(false)}>Register</button> </span></p>
        </div>
    )
}

export default LoginForm;