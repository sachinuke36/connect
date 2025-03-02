import express, { NextFunction, Request, Response } from 'express'
import router from './routes/router';
import cors from 'cors'
import {createServer} from 'node:http';
import {Server} from 'socket.io'
import {app, server} from './socketHandler'
import dotenv from'dotenv'
dotenv.config()

// const origin ="https://connect-chat-app-pern.netlify.app"
const origin = "http://localhost:5173"
const PORT = process.env.PORT || 8000;

//middlewares
app.use(cors({
  origin: origin,           // Allow only this specific origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
  credentials: true,
}));
app.options("*",cors())

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api',router());


server.listen(PORT,()=>{
  console.log("Server is running on : " + PORT )
})






