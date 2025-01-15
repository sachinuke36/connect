import express, { NextFunction, Request, Response } from 'express'
import router from './routes/router';
import cors from 'cors'
import {createServer} from 'node:http';
import {Server} from 'socket.io'
import {app, server} from './socketHandler'

const origin = "http://localhost:5173"
const PORT = process.env.PORT || 8000;

//middlewares
app.use(cors({origin: origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'],}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/",(req:express.Request,res:express.Response)=>{
  res.send("<h1>Hii</h1>")
})
app.use('/api',router());


server.listen(PORT,()=>{
  console.log("Server is running on : " + PORT )
})






