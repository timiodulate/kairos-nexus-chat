import express, { Request, Response } from "express";
import cors from "cors";

const app = express();

app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		methods: ["GET", "POST"],
	}),
);

app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
	res.send("Hello, TypeScript + Express!");
});

export default app;
