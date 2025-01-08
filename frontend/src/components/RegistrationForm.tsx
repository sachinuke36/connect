import { useState } from "react"
import { useRegistration } from "../action/authHandlers";


const RegistrationForm = ({setIsAcc}:{setIsAcc:(value:boolean)=>void})=>{
    const [username, setUsername] = useState<string | undefined>("");
    const [fname, setFname] = useState<string | undefined>("");
    const [lname, setLname] = useState<string | undefined>("");
    const [password, setPassword] = useState<string | undefined>("");
    const [gender, setGender] = useState<string | undefined>("");


    const {register} = useRegistration();

    const handleSubmit = (e : React.FormEvent<HTMLFormElement> )=>{
        e.preventDefault();
        console.log("hii")
        register(username,password, fname,lname, gender );
    }

    return (
        <div>
            <form className="flex flex-col gap-4" onSubmit={(e)=>handleSubmit(e)}>
                    <div className="flex flex-col">
                        <label htmlFor="username">Username</label>
                        <input className="border p-1 px-5" value={username} onChange={(e)=>setUsername(e.target.value)} type="text" name="username"  required/>
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="fname">First Name</label>
                        <input className="border p-1 px-5" value={fname} onChange={(e)=>setFname(e.target.value)} type="text" name="fname" required />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="lname">Last Name</label>
                        <input className="border p-1 px-5" value={lname} onChange={(e)=>setLname(e.target.value)} type="text" name="lname" required />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="password">Password</label>
                        <input className="border p-1 px-5" value={password} onChange={(e)=>setPassword(e.target.value)} type="password" name="password" required/>
                    </div>
                    <div>
                       <select name="gender" value={gender} required onChange={(e) => setGender(e.target.value)} className="border p-1"  id="">
                        <option value="" disabled> Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                       </select>
                    </div>
                    <button className="border w-[200px] mx-auto p-2 rounded-md" type="submit"> Register</button>
                    <p className="my-3"><span>Have an account ? <button onClick={()=>setIsAcc(true)}>Login</button> </span></p>
                </form>
        </div>
    )
}

export default RegistrationForm