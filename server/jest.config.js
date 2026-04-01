/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>/src", "<rootDir>/__tests__"],
	testMatch: ["**/__tests__/**/*.test.ts"],
	collectCoverageFrom: ["src/**/*.ts", "!src/index.ts", "!src/db/migrate.ts"],
};
