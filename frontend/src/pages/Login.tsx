import { useState } from "react";
import LoginForm from "../components/LoginForm";
import RegistrationForm from "../components/RegistrationForm";
import { BsChatDots } from "react-icons/bs";

const Login = () => {
    const [isAcc, setIsAcc] = useState<boolean>(true);

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#0a1929] via-[#0d2137] to-[#071928] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-4">
                        <BsChatDots className="text-3xl text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Connect</h1>
                    <p className="text-gray-400">
                        {isAcc ? "Welcome back! Please sign in to continue" : "Create an account to get started"}
                    </p>
                </div>

                <div className="bg-gradient-to-b from-[#1f3445] to-[#162736] rounded-2xl p-6 sm:p-8 border border-[#2a4a5e] shadow-2xl">
                    <h2 className="text-xl font-semibold text-white text-center mb-6">
                        {isAcc ? "Sign In" : "Create Account"}
                    </h2>
                    {isAcc ? <LoginForm setIsAcc={setIsAcc} /> : <RegistrationForm setIsAcc={setIsAcc} />}
                </div>
            </div>
        </div>
    );
};

export default Login;
