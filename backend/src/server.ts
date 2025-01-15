import express, { NextFunction, Request, Response } from 'express'
import router from './routes/router';
import cors from 'cors'
import {createServer} from 'node:http';
import {Server} from 'socket.io'
import {app, server} from './socketHandler'

const origin = "http://localhost:5173"
const PORT = process.env.PORT || 8000;

//middlewares
app.use(cors({
  origin: origin,           // Allow only this specific origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
  credentials: true,        // Allow credentials (cookies, etc.)
}));
app.options('*', cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/",(req:express.Request,res:express.Response)=>{
  res.send("<h1>Hii</h1>")
})
app.use('/api',router());


server.listen(PORT,()=>{
  console.log("Server is running on : " + PORT )
})






