import {NextFunction, Request, Response} from "express"
import  bcrypt, { genSalt } from 'bcryptjs'
import { prisma } from "../db/db.config";
import jwt from 'jsonwebtoken'

export type gender= "MALE" | "FEMALE";

interface LoginRequest extends Request {
    body: {
      username: string;
      password: string;
    };
}
interface RegisterRequest extends Request {
    body: {
      username: string;
      password: string;
      fname : string;
      lname : string;
      gender : gender;
    };
}

export interface User{
    username: string;
    password: string;
    userId: string;
    fname: string;
    lname: string;
    gender : gender
}


    export async function login(req:Request, res: Response, next:NextFunction):Promise<any>{
        if (!req.body) {
            return res.status(400).json({ error: "Request body is missing" });
        }
        const {username, password} = req.body;
        if(!username || !password) throw new Error("Username and Password are Required");
        try {
                const user = await prisma.user.findFirst({where: { username}});
                if(!user) throw new Error("User Not found !")
                const isMatch = await bcrypt.compare(password, user?.password);
                if(isMatch){
                    // next()
                    setCookies(user,res);
                }
        } catch (error) {
            console.log("Error in Login");
            next(error)
        }
    }


    export async function register(req : RegisterRequest, res: Response):Promise<any>{
        const { fname, lname, username, gender, password} = req.body;
        if( !fname || !lname || !username || !gender || !password ) throw new Error("Please input all fields.");
        try {
                const user = await prisma.user.findUnique({where:{username}});
                if(user) return res.json({message:"User already exists,Please login !"});
                const hashedPass = await generateHash(password);
                await prisma.user.create({
                    data: {
                        username,
                        fname,
                        lname,
                        gender : gender,
                        password : hashedPass
                    }
                })
                const newUser = await prisma.user.findFirst({where: { username}});
                setCookies(newUser as User,res);
        } catch (error) {
            console.log(error)
            throw new Error("Something went wrong !")
        }
    }

    export async function deleteUsers(req: Request, res: Response){
        await prisma.user.deleteMany({});
    }

    export async function getUser(username:string, userId?:string):Promise<Partial<User>|null>{
       if(!userId) {
        const user = await prisma.user.findFirst({where: { username},select:{
            fname: true,
            lname: true,
            username : true,
            gender : true,
            password : false,
            userId: true
        }});
        if(!user) return null;
        return user
        }
       else {
        const user = await prisma.user.findFirst({where: { userId}, select:{
            fname: true,
            lname: true,
            username : true,
            gender : true,
            password : false,
            userId: true
        }});
        return user;
       }
    }
    export async function getAllUsers():Promise<Partial<User>[]>{
        const users = await prisma.user.findMany({where:{}, select:{
            fname: true,
            lname: true,
            username : true,
            gender : true,
            password : false,
            userId: true,
        }});
        return users;
    }

    export async function fetchAllUsers(req: Request,res: Response):Promise<any>{
        const users = await prisma.user.findMany({where:{}, select:{
            fname: true,
            lname: true,
            username : true,
            gender : true,
            password : false,
            userId: true,
        }}); 
        return res.json({message: "all users fetched successfully!", data: users});
    }


   async function generateHash(password:string):Promise<string>{
        const salt = await genSalt(10);
        const hashedPass = await bcrypt.hash(password,salt);
        return hashedPass;
    }


    async function setCookies( user : User, res : Response){
        const JWT_SECRET = process.env.JWT_SECRET || "sachin" ;
        const u = await getUser(user.username);
        const token = await jwt.sign({username: user.username},JWT_SECRET,{expiresIn:"1d"});
          return  res.status(200).cookie("authToken", token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV !== "development", 
            sameSite:'none', 
            maxAge: 1000 * 60 * 60 * 24, 
          }).json({data: u, success:true});
    }

   
