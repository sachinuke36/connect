import { Router } from 'express'
import { login, register, deleteUsers, fetchAllUsers } from '../controllers/authControllers';


export default (router: Router)=>{
    router.post("/login",login);
    router.post("/register",register)
    router.post("/deleteUser",deleteUsers)
    router.get("/fetchallusers",fetchAllUsers);
}