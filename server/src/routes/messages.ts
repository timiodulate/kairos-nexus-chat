import { Router, Request, Response } from "express";
import pool from "../db";

const router = Router();

// GET /api/messages — Fetch all messages ordered by created_at ASC
router.get("/", async (_req: Request, res: Response) => {
	try {
		const result = await pool.query(
			`SELECT id, sender, text, created_at 
       FROM messages 
       ORDER BY created_at ASC`,
		);

		res.json(result.rows);
	} catch (err) {
		console.error("Error fetching messages:", err);

		res.status(500).json({ error: "Failed to fetch messages" });
	}
});

// POST /api/messages — Create a new message
router.post("/", async (req: Request, res: Response) => {
	const { sender, text } = req.body;

	//! Validation
	// This is the server side validation to ensure that the data is correct before inserting into the database.
	if (!sender || typeof sender !== "string" || !sender.trim()) {
		return res.status(400).json({
			error: "sender is required and must be a non-empty string",
		});
	}

	if (!text || typeof text !== "string" || !text.trim()) {
		return res
			.status(400)
			.json({ error: "text is required and must be a non-empty string" });
	}
	if (sender.trim().length > 50) {
		return res
			.status(400)
			.json({ error: "sender must be 50 characters or less" });
	}

	try {
		const result = await pool.query(
			`INSERT INTO messages (sender, text) 
      VALUES ($1, $2) 
      RETURNING id, sender, text, created_at"`,
			[sender.trim(), text.trim()],
		);

		res.status(201).json(result.rows[0]);
	} catch (err) {
		console.error("Error creating message:", err);

		res.status(500).json({ error: "Failed to create message" });
	}
});

export default router;
