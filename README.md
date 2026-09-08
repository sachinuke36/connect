# Connect - Real-Time Chat Application

A modern, feature-rich real-time chat application built with React, Node.js, Socket.IO, and WebRTC. Connect enables users to chat with friends, create groups, and make video/audio calls with a sleek, responsive UI.

## Features

### Authentication
- User registration with first name, last name, username, and password
- Secure login with JWT-based authentication
- Password hashing with bcrypt
- Persistent sessions with HTTP-only cookies

### Messaging
- **Real-time 1-on-1 Chat**: Instant messaging between friends using Socket.IO
- **Group Chat**: Create and manage group conversations with multiple participants
- **Message Status Indicators**:
  - Single gray tick: Message sent
  - Double gray ticks: Message delivered
  - Double blue ticks: Message seen/read
- **Typing Indicators**: Real-time "typing..." status when a friend is composing a message

### Friend System
- Search and discover other users
- Send and receive friend requests
- Accept or reject incoming requests
- Real-time notifications for friend request events
- Online/Offline status indicators

### Groups
- Create groups with custom names and descriptions
- Add multiple friends to a group
- Group admin controls (edit group, manage members)
- Leave group functionality
- Group info sidebar with member list

### Video & Audio Calling
- **Video Calls**: Peer-to-peer video calling using WebRTC
- **Audio Calls**: Voice-only calls with dedicated UI
- **Call Features**:
  - Incoming call notification with caller info
  - Accept/Decline incoming calls
  - Mute/Unmute microphone
  - Turn camera on/off (video calls)
  - Mute/Unmute speaker
  - Call duration timer
  - Connection status indicators
  - Picture-in-picture local video preview

### UI/UX
- Modern, dark-themed interface with gradient accents
- Fully responsive design (mobile & desktop)
- Smooth animations and transitions
- Toast notifications for events
- Avatar generation using DiceBear API
- Keyboard shortcuts for quick navigation

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Socket.IO Client** - Real-time communication
- **WebRTC** - Peer-to-peer video/audio
- **React Toastify** - Toast notifications
- **React Icons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Socket.IO** - Real-time bidirectional communication
- **Prisma** - ORM for database operations
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Cookie Parser** - Cookie handling
- **CORS** - Cross-origin resource sharing

## Project Structure

```
connect/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── action/          # API handlers and business logic
│   │   │   ├── authHandlers.ts
│   │   │   ├── chatHandler.tsx
│   │   │   ├── friendRequestHandler.tsx
│   │   │   ├── GroupChatHandler.tsx
│   │   │   └── GroupHandler.tsx
│   │   ├── components/      # React components
│   │   │   ├── CreateGroup.tsx
│   │   │   ├── GroupInfo.tsx
│   │   │   ├── IncomingCall.tsx
│   │   │   ├── List.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── MiddleSection.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── RegistrationForm.tsx
│   │   │   ├── RightSection.tsx
│   │   │   ├── Shortcuts.tsx
│   │   │   └── VideoCalling.tsx
│   │   ├── contexts/        # React contexts
│   │   │   ├── AuthContexts.tsx
│   │   │   ├── Contexts.tsx
│   │   │   ├── SocketContext.tsx
│   │   │   └── WebRTCContext.tsx
│   │   ├── pages/           # Page components
│   │   │   ├── Home.tsx
│   │   │   └── Login.tsx
│   │   ├── constants/       # Constants and utilities
│   │   ├── services/        # Services (WebRTC peer)
│   │   ├── types/           # TypeScript type definitions
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   └── package.json
│
├── backend/                  # Node.js backend server
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   │   ├── authControllers.ts
│   │   │   ├── chatManagement.ts
│   │   │   ├── friendManagement.ts
│   │   │   ├── groupChatControllers.ts
│   │   │   └── groupControllers.ts
│   │   ├── routes/          # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── chat.routes.ts
│   │   │   ├── friendRequest.routes.ts
│   │   │   ├── group.routes.ts
│   │   │   ├── groupChat.routes.ts
│   │   │   └── router.ts
│   │   ├── db/              # Database configuration
│   │   │   └── db.config.ts
│   │   ├── server.ts        # Express server setup
│   │   └── socketHandler.ts # Socket.IO event handlers
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
│
└── README.md
```

## Database Schema

### Models

- **User**: User accounts with profile information
- **FriendRequest**: Friend request tracking (PENDING, ACCEPTED, REJECTED)
- **Conversation**: Chat conversations between users
- **Message**: Individual messages with status (SENT, DELIVERED, SEEN)
- **Group**: Group chat rooms
- **GroupChat**: Messages in group chats

## Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/connect_db"
   JWT_SECRET="your-jwt-secret-key"
   PORT=8000
   ```

4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```env
   VITE_REACT_APP_BACKEND_BASEURL="http://localhost:8000"
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/fetchallusers` - Get all users

### Friends
- `POST /api/getFriends` - Get user's friends
- `POST /api/friendrequest` - Send friend request
- `POST /api/getfriendrequest` - Get pending requests
- `POST /api/acceptfriendrequest` - Accept friend request
- `POST /api/rejectfriendrequest` - Reject friend request

### Chat
- `POST /api/sendchat` - Send a message
- `POST /api/getchats` - Get chat history
- `POST /api/messages/mark-seen` - Mark messages as seen

### Groups
- `POST /api/creategroup` - Create new group
- `POST /api/getgroup` - Get user's groups
- `POST /api/updategroup` - Update group details
- `POST /api/leavegroup` - Leave a group

### Group Chat
- `POST /api/sendgroupchat` - Send group message
- `POST /api/getgroupchats` - Get group chat history

## Socket.IO Events

### Client to Server
- `joinGroup` - Join a group room
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator
- `room:join` - Initiate/join video call
- `user:ready` - Signal readiness for call
- `offer` - WebRTC offer
- `answer` - WebRTC answer
- `icecandidate` - ICE candidate exchange
- `call-ended` - End call

### Server to Client
- `friend-request-sent` - New friend request notification
- `friend-request-accepted` - Friend request accepted
- `newMessage` - New chat message
- `newGroupMessage` - New group message
- `createGroup` - Group created notification
- `getOnlineUsers` - Online users list
- `typing:start` / `typing:stop` - Typing indicators
- `message:delivered` / `message:seen` - Message status updates
- `incoming:call` - Incoming call notification
- `accepted:call` - Call accepted
- `call-declined` - Call declined

## WebRTC Implementation

The application uses WebRTC for peer-to-peer video and audio calling:

1. **Signaling**: Socket.IO handles the signaling process (offer/answer/ICE candidates)
2. **STUN Servers**: Uses Google's public STUN servers for NAT traversal
3. **Media Handling**: Separate audio and video constraints based on call type
4. **Connection States**: Real-time connection status feedback

### Call Flow
1. Caller initiates call (generates room ID, emits `room:join`)
2. Receiver sees incoming call dialog
3. On accept: receiver emits `accepted:call`, joins room
4. Caller sends WebRTC offer after receiving acceptance
5. Receiver sends WebRTC answer
6. ICE candidates are exchanged
7. Peer connection established

## Environment Variables

### Backend
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `PORT` | Server port (default: 8000) |

### Frontend
| Variable | Description |
|----------|-------------|
| `VITE_REACT_APP_BACKEND_BASEURL` | Backend API URL |

## Building for Production

### Frontend
```bash
cd frontend
npm run build
```
The build output will be in the `dist/` directory.

### Backend
```bash
cd backend
npm run build
```
The compiled JavaScript will be in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [DiceBear](https://dicebear.com/) for avatar generation
- [Socket.IO](https://socket.io/) for real-time communication
- [Prisma](https://prisma.io/) for database ORM
- [Tailwind CSS](https://tailwindcss.com/) for styling
