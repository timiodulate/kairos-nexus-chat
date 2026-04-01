import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserProvider } from "../context/UserContext";
import LoginPage from "../pages/login";
import { MemoryRouter } from "react-router";

function renderWithProvider() {
	return render(
		<MemoryRouter>
			<UserProvider>
				<LoginPage />
			</UserProvider>
		</MemoryRouter>,
	);
}

describe("LoginPage", () => {
	it("renders the login form", () => {
		renderWithProvider();
		expect(screen.getByTestId("username-input")).toBeInTheDocument();
		expect(screen.getByTestId("join-button")).toBeInTheDocument();
		expect(screen.getByText("Kairos Nexus")).toBeInTheDocument();
	});

	it("shows error when submitting empty username", async () => {
		const user = userEvent.setup();
		renderWithProvider();

		await user.click(screen.getByTestId("join-button"));
		expect(screen.getByRole("alert")).toHaveTextContent(
			"Please enter a username",
		);
	});

	it("accepts a valid username", async () => {
		const user = userEvent.setup();
		renderWithProvider();

		const input = screen.getByTestId("username-input");
		await user.type(input, "Alice");
		expect(input).toHaveValue("Alice");
	});

	it("clears error when user starts typing", async () => {
		const user = userEvent.setup();
		renderWithProvider();

		// Trigger error
		await user.click(screen.getByTestId("join-button"));
		expect(screen.getByRole("alert")).toBeInTheDocument();

		// Start typing — error should clear
		await user.type(screen.getByTestId("username-input"), "A");
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});
});
