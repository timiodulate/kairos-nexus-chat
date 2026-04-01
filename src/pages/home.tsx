import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router";

import React, { useState, useRef, useEffect } from "react";
// import { useChat } from "../hooks/useChat";
// import { MessageBubble } from "./MessageBubble";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { MessageBubble } from "../components/section/home/MessageBubble";
import { useChat } from "../hooks/useChat";
import MessagesHeader from "../components/section/home/MessagesHeader";
import ErrorBanner from "../components/section/home/ErrorBanner";

function HomePage() {
	const navigate = useNavigate();
	const { username, setUsername } = useUser();
	const { messages, sendMessage, isConnected, isLoading, error } =
		useChat(username);
	const [inputText, setInputText] = useState("");
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!username) {
			navigate("/login");
		}
	}, []);

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	const handleSend = (e: React.FormEvent) => {
		e.preventDefault();
		if (!inputText.trim() || !isConnected) return;
		sendMessage(inputText);
		setInputText("");
	};

	if (!username) {
		return (
			<main>
				<p>Loading...</p>
			</main>
		);
	}

	return (
		<main>
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
				<Card className="w-full max-w-2xl h-[600px] md:h-[700px] flex flex-col shadow-lg overflow-hidden">
					<MessagesHeader
						username={username}
						isConnected={isConnected}
						setUsername={setUsername}
					/>

					{error && <ErrorBanner error={error} />}

					{/* Messages Area */}
					<ScrollArea
						ref={scrollRef}
						className="flex-1 p-5 max-h-[calc(100%-162px)]"
					>
						{isLoading ? (
							<div
								className="flex items-center justify-center h-full"
								data-testid="loading-spinner"
							>
								<div className="flex flex-col items-center gap-3 text-muted-foreground">
									<div className="h-6 w-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
									<p className="text-sm">
										Loading messages...
									</p>
								</div>
							</div>
						) : messages.length === 0 ? (
							<div
								className="flex items-center justify-center h-full"
								data-testid="empty-state"
							>
								<div className="text-center text-muted-foreground">
									<svg
										className="h-12 w-12 mx-auto mb-3 opacity-40"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
										/>
									</svg>
									<p className="text-sm font-medium">
										No messages yet
									</p>
									<p className="text-xs mt-1">
										Start the conversation!
									</p>
								</div>
							</div>
						) : (
							<div data-testid="message-list">
								{messages.map((msg: any) => (
									<MessageBubble
										key={msg.id}
										message={msg}
										isOwn={msg.sender === username}
									/>
								))}
							</div>
						)}
					</ScrollArea>

					{/* Input Bar */}
					<div className="px-4 py-3 border-t bg-card">
						<form
							onSubmit={handleSend}
							className="flex items-center gap-2"
						>
							<Input
								data-testid="message-input"
								placeholder="Type a message..."
								value={inputText}
								onChange={(e) => setInputText(e.target.value)}
								disabled={!isConnected}
								autoFocus
							/>
							<Button
								type="submit"
								disabled={!inputText.trim() || !isConnected}
								data-testid="send-button"
								size="icon"
								className="shrink-0"
							>
								<svg
									className="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
									/>
								</svg>
							</Button>
						</form>
					</div>
				</Card>
			</div>
		</main>
	);
}

export default HomePage;
