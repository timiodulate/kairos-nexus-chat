import http from "http";
import { Server } from "socket.io";
import app from "./app";
import path from "path";

import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// console.log("PORT:", process.env.PORT);
// console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set ✓" : "Missing ✗");

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

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
