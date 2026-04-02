import express from "express";
import cors from "cors";
import messageRoutes from "./routes/messages";

const app = express();

// midd
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3003",
		methods: ["GET", "POST"],
	}),
);
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
	res.json({ status: "ok" });
});

// Routes
app.use("/api/messages", messageRoutes);

export default app;
