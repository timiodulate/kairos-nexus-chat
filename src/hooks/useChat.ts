import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { Message } from "../types";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3002";
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:3002";

interface UseChatReturn {
	messages: Message[];
	sendMessage: (text: string) => void;
	isConnected: boolean;
	isLoading: boolean;
	error: string | null;
}

export function useChat(username: string): UseChatReturn {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isConnected, setIsConnected] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const socketRef = useRef<Socket | null>(null);

	// Fetch message history on mount
	useEffect(() => {
		const fetchMessages = async () => {
			try {
				setIsLoading(true);
				const response = await fetch(`${API_URL}/api/messages`);
				if (!response.ok) {
					throw new Error(
						`Failed to fetch messages: ${response.status}`,
					);
				}
				const data: Message[] = await response.json();
				setMessages(data);
				setError(null);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Failed to load messages",
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchMessages();
	}, []);

	// Socket.io connection
	useEffect(() => {
		// console.log("useChat: Socket.io effect running");
		const socket = io(SOCKET_URL, {
			transports: ["websocket", "polling"],
		});
		// console.log("useChat: socket created:", socket);
		// console.log("useChat: socket.on type:", typeof socket?.on);
		// console.log(
		// 	"useChat: socket has __simulateEvent?",
		// 	"__simulateEvent" in (socket || {}),
		// );
		socketRef.current = socket;

		// console.log("useChat: About to call socket.on(connect)");
		socket.on("connect", () => {
			// console.log("useChat: connect callback fired");
			setIsConnected(true);
			setError(null);
		});

		// console.log("useChat: About to call socket.on(disconnect)");
		socket.on("disconnect", () => {
			// console.log("useChat: disconnect callback fired");
			setIsConnected(false);
		});

		// console.log("useChat: About to call socket.on(connect_error)");
		socket.on("connect_error", () => {
			// console.log("useChat: connect_error callback fired");
			setIsConnected(false);
			setError("Connection lost. Retrying...");
		});

		// console.log("useChat: About to call socket.on(message)");
		socket.on("message", (message: Message) => {
			// console.log("useChat: message callback fired");
			setMessages((prev) => [...prev, message]);
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const sendMessage = useCallback(
		(text: string) => {
			if (!socketRef.current || !text.trim()) return;
			socketRef.current.emit("sendMessage", {
				sender: username,
				text: text.trim(),
			});
		},
		[username],
	);

	return { messages, sendMessage, isConnected, isLoading, error };
}
