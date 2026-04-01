import http from "http";
import app from "../src/app";
import pool from "../src/db";

let server: http.Server;
const PORT = 4001;
const BASE = `http://localhost:${PORT}`;

beforeAll((done) => {
	server = app.listen(PORT, done);
});

afterAll((done) => {
	server.close();
	pool.end().then(() => done());
});

describe("GET /api/health", () => {
	test("returns ok status", async () => {
		const res = await fetch(`${BASE}/api/health`);
		const body: any = await res.json();

		expect(res.status).toBe(200);
		expect(body.status).toBe("ok");
	});
});
