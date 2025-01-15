"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router_1 = __importDefault(require("./routes/router"));
const cors_1 = __importDefault(require("cors"));
const socketHandler_1 = require("./socketHandler");
const origin = "http://localhost:5173";
const PORT = process.env.PORT || 8000;
//middlewares
socketHandler_1.app.use((0, cors_1.default)({
    origin: origin, // Allow only this specific origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
    credentials: true,
}));
// app.options('*', cors());
socketHandler_1.app.use(express_1.default.json());
socketHandler_1.app.use(express_1.default.urlencoded({ extended: true }));
// app.get("/",(req:express.Request,res:express.Response)=>{
//   res.send("<h1>Hii</h1>")
// })
socketHandler_1.app.use('/api', (0, router_1.default)());
socketHandler_1.server.listen(PORT, () => {
    console.log("Server is running on : " + PORT);
});
//# sourceMappingURL=server.js.map