"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
exports.deleteUsers = deleteUsers;
exports.getUser = getUser;
exports.getAllUsers = getAllUsers;
exports.fetchAllUsers = fetchAllUsers;
const bcryptjs_1 = __importStar(require("bcryptjs"));
const db_config_1 = require("../db/db.config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
async function login(req, res, next) {
    if (!req.body) {
        return res.status(400).json({ error: "Request body is missing" });
    }
    const { username, password } = req.body;
    if (!username || !password)
        throw new Error("Username and Password are Required");
    try {
        const user = await db_config_1.prisma.user.findFirst({ where: { username } });
        if (!user)
            throw new Error("User Not found !");
        const isMatch = await bcryptjs_1.default.compare(password, user?.password);
        if (isMatch) {
            // next()
            setCookies(user, res);
        }
    }
    catch (error) {
        console.log("Error in Login");
        next(error);
    }
}
async function register(req, res) {
    const { fname, lname, username, gender, password } = req.body;
    if (!fname || !lname || !username || !gender || !password)
        throw new Error("Please input all fields.");
    try {
        const user = await db_config_1.prisma.user.findUnique({ where: { username } });
        if (user)
            return res.json({ message: "User already exists,Please login !" });
        const hashedPass = await generateHash(password);
        await db_config_1.prisma.user.create({
            data: {
                username,
                fname,
                lname,
                gender: gender,
                password: hashedPass
            }
        });
        const newUser = await db_config_1.prisma.user.findFirst({ where: { username } });
        setCookies(newUser, res);
    }
    catch (error) {
        console.log(error);
        throw new Error("Something went wrong !");
    }
}
async function deleteUsers(req, res) {
    await db_config_1.prisma.user.deleteMany({});
}
async function getUser(username, userId) {
    if (!userId) {
        const user = await db_config_1.prisma.user.findFirst({ where: { username }, select: {
                fname: true,
                lname: true,
                username: true,
                gender: true,
                password: false,
                userId: true
            } });
        if (!user)
            return null;
        return user;
    }
    else {
        const user = await db_config_1.prisma.user.findFirst({ where: { userId }, select: {
                fname: true,
                lname: true,
                username: true,
                gender: true,
                password: false,
                userId: true
            } });
        return user;
    }
}
async function getAllUsers() {
    const users = await db_config_1.prisma.user.findMany({ where: {}, select: {
            fname: true,
            lname: true,
            username: true,
            gender: true,
            password: false,
            userId: true,
        } });
    return users;
}
async function fetchAllUsers(req, res) {
    const users = await db_config_1.prisma.user.findMany({ where: {}, select: {
            fname: true,
            lname: true,
            username: true,
            gender: true,
            password: false,
            userId: true,
        } });
    return res.json({ message: "all users fetched successfully!", data: users });
}
async function generateHash(password) {
    const salt = await (0, bcryptjs_1.genSalt)(10);
    const hashedPass = await bcryptjs_1.default.hash(password, salt);
    return hashedPass;
}
async function setCookies(user, res) {
    const JWT_SECRET = process.env.JWT_SECRET || "sachin";
    const u = await getUser(user.username);
    const token = await jsonwebtoken_1.default.sign({ username: user.username }, JWT_SECRET, { expiresIn: "1d" });
    return res.status(200).cookie("authToken", token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24,
    }).json({ data: u, success: true });
}
//# sourceMappingURL=authControllers.js.map