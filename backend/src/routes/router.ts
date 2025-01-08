import express, { Router } from 'express'

import authRouter from './auth.routes'
import friendRequestRoutes from './friendRequest.routes';
import chatRoutes from './chat.routes';
import groupRoutes from './group.routes';
import groupChatRoutes from './groupChat.routes';
 

const router = Router();

export default ():Router=>{
    authRouter(router);
    friendRequestRoutes(router);
    chatRoutes(router);
    groupRoutes(router);
    groupChatRoutes(router)
    return router
}