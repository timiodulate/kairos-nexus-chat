import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

const PORT = process.env.PORT || 3002;

const server = http.createServer(app);
// const httpServer = createServer();
const io = new Server(server, {
	cors: {
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		methods: ["GET", "POST"],
	},
});

io.on("connection", (socket) => {
	// ...
});

// app.use(express.json());

app.get("/", (req: Request, res: Response) => {
	res.send("Hello, TypeScript + Express!");
});

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
