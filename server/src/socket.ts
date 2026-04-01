import { Server, Socket } from "socket.io";
import pool from "./db";

interface SendMessagePayload {
	sender: string;
	text: string;
}

export function registerSocketHandlers(io: Server) {
	io.on("connection", (socket: Socket) => {
		console.log(`Client connected: ${socket.id}`);

		socket.on("sendMessage", async (payload: SendMessagePayload) => {
			const { sender, text } = payload;

			// Validate
			if (!sender || typeof sender !== "string" || !sender.trim()) {
				socket.emit("error", { message: "sender is required" });
				return;
			}
			if (!text || typeof text !== "string" || !text.trim()) {
				socket.emit("error", { message: "text is required" });
				return;
			}

			try {
				const result = await pool.query(
					`INSERT INTO messages (sender, text) 
                    VALUES ($1, $2) 
                    RETURNING id, sender, text, created_at`,
					[sender.trim(), text.trim()],
				);
				const savedMessage = result.rows[0];

				// Broadcast to ALL connected clients (including sender)
				io.emit("message", savedMessage);
			} catch (err) {
				console.error("Error saving message:", err);
				socket.emit("error", { message: "Failed to save message" });
			}
		});

		socket.on("disconnect", () => {
			console.log(`Client disconnected: ${socket.id}`);
		});
	});
}
