import { createContext, ReactNode, useContext, useState } from "react";


export const AuthContext = createContext<any>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({children}:{children: ReactNode}) =>{
    const [user, setUser] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
    return <AuthContext.Provider value={{user, setUser, BACKEND_URL, isLoggedIn, setIsLoggedIn}}> {children}</AuthContext.Provider>
}

export const getCookies = ()=>{
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === "authToken") {
            return decodeURIComponent(value);
        }
    }
}
