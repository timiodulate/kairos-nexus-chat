import http from "http";
import app from "../src/app";
import pool from "../src/db";
import { Server } from "socket.io";
import { io as ioClient, Socket as ClientSocket } from "socket.io-client";
import { registerSocketHandlers } from "../src/socket";

let server: http.Server;
let io: Server;
let clientSocket: ClientSocket = null as any;

const PORT = 4001;
const BASE = `http://localhost:${PORT}`;

// beforeAll((done) => {
// 	server = app.listen(PORT, done);
// });
beforeAll(async () => {
	await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      sender VARCHAR(50) NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
});

beforeEach(async () => {
	await pool.query("DELETE FROM messages");

	server = http.createServer(app);
	io = new Server(server, {
		cors: { origin: "*" },
	});

	registerSocketHandlers(io);

	await new Promise<void>((resolve) => {
		server.listen(PORT, resolve);
	});
});

afterEach(async () => {
	if (clientSocket && clientSocket?.connected) {
		clientSocket.disconnect();
	}
	io.close();
	await new Promise<void>((resolve) => {
		server.close(() => resolve());
	});
});

afterAll(async () => {
	await pool.query("DROP TABLE IF EXISTS messages");
	await pool.end();
	//   server.close();
	// await pool.end().then(() => done());
});

//! REST API Tests

describe("GET /api/health", () => {
	test("returns ok status", async () => {
		const res = await fetch(`${BASE}/api/health`);
		const body: any = await res.json();

		expect(res.status).toBe(200);
		expect(body.status).toBe("ok");
	});
});

describe("GET /api/messages", () => {
	it("returns an empty array when no messages exist", async () => {
		const res = await fetch(`${BASE}/api/messages`);
		const body: any = await res.json();

		expect(res.status).toBe(200);
		expect(body).toEqual([]);
	});

	it("returns messages ordered by created_at ASC", async () => {
		await pool.query(
			"INSERT INTO messages (sender, text) VALUES ($1, $2)",
			["Alice", "First message"],
		);
		await pool.query(
			"INSERT INTO messages (sender, text) VALUES ($1, $2)",
			["Bob", "Second message"],
		);

		const res = await fetch(`${BASE}/api/messages`);
		const body: any = await res.json();

		expect(res.status).toBe(200);
		expect(body).toHaveLength(2);
		expect(body[0].sender).toBe("Alice");
		expect(body[0].text).toBe("First message");
		expect(body[1].sender).toBe("Bob");
	});

	test("should return an array", async () => {
		const res = await fetch(`${BASE}/api/messages`);
		const body: any = await res.json();

		expect(res.status).toBe(200);
		expect(Array.isArray(body)).toBe(true);
	});
});

describe("POST /api/messages", () => {
	it("creates a message and returns it with 201", async () => {
		const res = await fetch(`${BASE}/api/messages`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ sender: "Alice", text: "Hello!" }),
		});
		const body: any = await res.json();
		// console.log(body);

		expect(res.status).toBe(201);
		expect(body).toHaveProperty("id");
		expect(body.sender).toBe("Alice");
		expect(body.text).toBe("Hello!");
		expect(body).toHaveProperty("created_at");
	});

	it("returns 400 when sender is missing", async () => {
		const res = await fetch(`${BASE}/api/messages`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ text: "Hello!" }),
		});
		const body: any = await res.json();

		expect(res.status).toBe(400);
		expect(body.error).toMatch(/sender/i);
	});

	it("returns 400 when text is missing", async () => {
		const res = await fetch(`${BASE}/api/messages`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ sender: "Alice" }),
		});
		const body: any = await res.json();

		expect(res.status).toBe(400);
		expect(body.error).toMatch(/text/i);
	});

	it("returns 400 when text is empty string", async () => {
		const res = await fetch(`${BASE}/api/messages`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ sender: "Alice", text: "   " }),
		});
		const body: any = await res.json();

		expect(res.status).toBe(400);
		expect(body.error).toMatch(/text/i);
	});

	it("returns 400 when sender is empty string", async () => {
		const res = await fetch(`${BASE}/api/messages`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ sender: "", text: "Hello!" }),
		});
		const body: any = await res.json();

		expect(res.status).toBe(400);
		expect(body.error).toMatch(/sender/i);
	});
});

//!Socket.io Tests

describe("Socket.io", () => {
	it("broadcasts a message to all connected clients on sendMessage", (done) => {
		const client1 = ioClient(`http://localhost:${PORT}`, {
			transports: ["websocket"],
		});
		const client2 = ioClient(`http://localhost:${PORT}`, {
			transports: ["websocket"],
		});

		let receivedCount = 0;

		const onMessage = (msg: {
			sender: string;
			text: string;
			id: number;
		}) => {
			expect(msg.sender).toBe("Alice");
			expect(msg.text).toBe("Hello from socket!");
			expect(msg).toHaveProperty("id");
			expect(msg).toHaveProperty("created_at");
			receivedCount++;
			if (receivedCount === 2) {
				client1.disconnect();
				client2.disconnect();
				done();
			}
		};

		client1.on("message", onMessage);
		client2.on("message", onMessage);
		let connected = 0;
		const checkAndSend = () => {
			connected++;
			if (connected === 2) {
				client1.emit("sendMessage", {
					sender: "Alice",
					text: "Hello from socket!",
				});
			}
		};

		client1.on("connect", checkAndSend);
		client2.on("connect", checkAndSend);

		clientSocket = client1;
	});

	it("emits error for invalid sendMessage payload", (done) => {
		const client = ioClient(`http://localhost:${PORT}`, {
			transports: ["websocket"],
		});

		client.on("error", (err: { message: string }) => {
			expect(err.message).toMatch(/text/i);
			client.disconnect();
			done();
		});

		client.on("connect", () => {
			client.emit("sendMessage", { sender: "Alice", text: "" });
		});

		clientSocket = client;
	});
});
