import express, { NextFunction, Request, Response } from 'express'
import router from './routes/router';
import cors from 'cors'
import {createServer} from 'node:http';
import {Server} from 'socket.io'
import {app, server} from './socketHandler'
import dotenv from'dotenv'
dotenv.config()

const allowedOrigins = [
  "https://connect-chat-app-pern.netlify.app",
  "http://localhost:5173",
  "http://localhost:5174"
];
const PORT = process.env.PORT || 8000;

//middlewares
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.options("*", cors())

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api',router());


server.listen(PORT,()=>{
  console.log("Server is running on : " + PORT )
})






