import fs from "fs";
import path from "path";
import pool from "./index";

async function migrate() {
  const sql = fs.readFileSync(
    path.join(__dirname, "migrate.sql"),
    "utf-8"
  );

  try {
    await pool.query(sql);
    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
