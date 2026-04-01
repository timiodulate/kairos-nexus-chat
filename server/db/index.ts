import { Pool } from "pg";
import path from "path";
import dotenv from "dotenv";

// Load .env from project root (one level above server/)
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Also try server/.env as fallback
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

export default pool;
