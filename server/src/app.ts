import express, { Request, Response } from "express";
import cors from "cors";
import messageRoutes from "./routes/messages";

const app = express();

app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		methods: ["GET", "POST"],
	}),
);

app.use(express.json());

// Routes
app.use("/api/messages", messageRoutes);

export default app;
