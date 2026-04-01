import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "../components/ui/card";
import { useNavigate } from "react-router";

export default function LoginPage() {
	const { setUsername } = useUser();
	const [inputValue, setInputValue] = useState("");
	const [error, setError] = useState("");

	const navigate = useNavigate();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = inputValue.trim();
		if (!trimmed) {
			setError("Please enter a username");
			return;
		}
		if (trimmed.length > 20) {
			setError("Username must be 20 characters or less");
			return;
		}
		setUsername(trimmed);

		navigate("/");
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
			<Card className="w-full max-w-md shadow-lg">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
						<svg
							className="h-7 w-7 text-primary-foreground"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
							/>
						</svg>
					</div>
					<CardTitle>Kairos Nexus</CardTitle>
					<CardDescription>
						Enter your username to join the chat
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Input
								data-testid="username-input"
								placeholder="Your username..."
								value={inputValue}
								onChange={(e) => {
									setInputValue(e.target.value);
									setError("");
								}}
								autoFocus
								maxLength={20}
							/>
							{error && (
								<p
									className="text-sm text-red-500"
									role="alert"
								>
									{error}
								</p>
							)}
						</div>
						<Button
							type="submit"
							className="w-full"
							data-testid="join-button"
						>
							Join Chat
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
