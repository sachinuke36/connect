# Real-Time Chatting and Video Calling App

This is a real-time chatting and video calling app built using **Prisma**, **Express** for the backend, **React** for the frontend, and **Node.js**. It incorporates **Socket.IO** for real-time communication.

## Features

- **User Authentication & Authorization**: Sign up and log in users using secure authentication methods.
- **Send & Accept Friend Requests**: Users can send, receive, and accept friend requests.
- **Group Creation & Group Chats**: Users can create groups and have group chats.
- **Real-Time Messaging**: Real-time messaging in both private and group chats using **Socket.IO**.
- **Peer-to-Peer Video Calling**: Users can initiate and accept peer-to-peer video calls.
- **Search Functionality**: Search users and groups.
- **Responsive Design**: Fully responsive UI for seamless usage on all devices.

## Technologies Used

- **Frontend**: React, CSS (Tailwind)
- **Backend**: Express, Node.js
- **Database**: Prisma (ORM for interaction with the database)
- **Real-time Communication**: Socket.IO
- **Video Calling**: WebRTC for peer-to-peer video calling
- **Authentication**: JWT or OAuth for secure authentication

## Setup

### 1. Clone the repository

```bash
git clone <repository_url>
cd <project_directory>
```

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```
### 2. .env
```bash
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```