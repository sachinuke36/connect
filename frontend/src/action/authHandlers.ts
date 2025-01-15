import { useState } from "react";
import { requestAction, requestType } from "../types/request.types";
import { useAuth } from "../contexts/AuthContexts";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export const useLogin = ()=>{
    const {BACKEND_URL, user, setIsLoggedIn } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(false);
    const login = async (username:string | undefined, password:string | undefined) : Promise<any>=>{
        const loginData : requestAction = { type: requestType.login, payload: { username, password}};

        // const success = handlInputErrors(loginData);
        setLoading(true);

        try {
           const res = await fetch(BACKEND_URL+"/api/login",{
            method: "POST",
            headers: { "Content-Type": "application/json"},
            mode: 'no-cors',
            credentials : "include",
            body: JSON.stringify(loginData.payload)
           })
           const data = await res.json();
           if(data.success){
            setIsLoggedIn(true);
            localStorage.setItem("user",JSON.stringify(data.data));
            navigate("/");
            window.location.reload();
           }
           console.log(user);
            
        } catch (error) {
            console.log("Error in Login");
        }finally{
            setLoading(false);
        }
    }
    return { login, loading}
}



export const useRegistration = ()=>{
    const {BACKEND_URL, user, setIsLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);

    const register = async (username:string | undefined, password:string | undefined, fname: string | undefined, lname: string | undefined, gender: string | undefined)=>{
        
        const registrationData : requestAction = { type: requestType.registration, payload: { username, password, fname, lname, gender}};

        const success = handlInputErrors(registrationData);
        if(!success) return;
        setLoading(true);

        try {
            const res = await fetch(BACKEND_URL+"/api/register",{
                method: "POST",
                headers: { "Content-Type": "application/json"},
                credentials : "include",
                body: JSON.stringify(registrationData.payload)
               })
               const data = await res.json();
               if(data.success){
                setIsLoggedIn(true);
                navigate("/");
                window.location.reload();
                localStorage.setItem("user",JSON.stringify(data.data));
               }
               console.log(user);
            
        } catch (error) {
            console.log("Error in Login");
        }finally{
            setLoading(false);
        }

    }
    return { register, loading}
}

export const logout = ()=>{
    localStorage.removeItem("user");
    Cookies.remove("authToken");
    window.location.reload();
}

export const getUser = ()=>{
    const userString = localStorage.getItem("user");
    if(!userString) return 
    const userId : string = (JSON.parse(userString)).userId;
    return userId
}



const handlInputErrors = (req:requestAction)=>{
    if(req.type === "LOGIN" && (!req.payload.username || !req.payload.password) ) return false;
    if(req.type === "REGISTER" && (!req.payload.username || !req.payload.password || !req.payload.fname || !req.payload.lname ) ) return false;
    return true;
}