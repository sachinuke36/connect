import { useState } from "react";
import { useRegistration } from "../action/authHandlers";
import { FiUser, FiLock, FiMail } from "react-icons/fi";
import { BsPerson } from "react-icons/bs";

interface RegistrationFormProps {
    setIsAcc: (value: boolean) => void;
}

const RegistrationForm = ({ setIsAcc }: RegistrationFormProps) => {
    const [username, setUsername] = useState<string>("");
    const [fname, setFname] = useState<string>("");
    const [lname, setLname] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [gender, setGender] = useState<string>("");

    const { register, loading } = useRegistration();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        register(username, password, fname, lname, gender);
    };

    const inputClasses = "w-full bg-[#0c1317] text-white placeholder-gray-500 pl-10 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/50 border border-[#2a4a5e] transition-all";

    return (
        <div>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2">
                    <label htmlFor="username" className="text-sm font-medium text-gray-300">
                        Username
                    </label>
                    <div className="relative">
                        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            className={inputClasses}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            type="text"
                            name="username"
                            placeholder="Choose a username"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="fname" className="text-sm font-medium text-gray-300">
                            First Name
                        </label>
                        <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                className={inputClasses}
                                value={fname}
                                onChange={(e) => setFname(e.target.value)}
                                type="text"
                                name="fname"
                                placeholder="First name"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="lname" className="text-sm font-medium text-gray-300">
                            Last Name
                        </label>
                        <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                className={inputClasses}
                                value={lname}
                                onChange={(e) => setLname(e.target.value)}
                                type="text"
                                name="lname"
                                placeholder="Last name"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-300">
                        Password
                    </label>
                    <div className="relative">
                        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            className={inputClasses}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            required
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="gender" className="text-sm font-medium text-gray-300">
                        Gender
                    </label>
                    <div className="relative">
                        <BsPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            name="gender"
                            value={gender}
                            required
                            onChange={(e) => setGender(e.target.value)}
                            className={`${inputClasses} appearance-none cursor-pointer`}
                        >
                            <option value="" disabled>Select your gender</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                        </select>
                    </div>
                </div>

                <button
                    disabled={loading}
                    className="w-full mt-2 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                >
                    {loading ? (
                        <svg className="animate-spin mx-auto h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    ) : (
                        "Create Account"
                    )}
                </button>
            </form>

            <p className="mt-6 text-center text-gray-400">
                Already have an account?{" "}
                <button
                    onClick={() => setIsAcc(true)}
                    className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                    Sign in
                </button>
            </p>
        </div>
    );
};

export default RegistrationForm;