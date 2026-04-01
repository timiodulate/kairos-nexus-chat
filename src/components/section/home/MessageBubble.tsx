import { Message } from "@/src/types";
import { cn } from "../../../lib/utils";
import React from "react";

interface MessageBubbleProps {
	message: Message;
	isOwn: boolean;
}

function formatTime(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
	return (
		<div
			className={cn(
				"flex flex-col mb-3 max-w-[80%] border",
				isOwn ? "ml-auto items-end" : "mr-auto items-start",
			)}
			data-testid="message-bubble"
		>
			<span
				className={cn(
					"text-xs font-medium mb-1 px-1",
					isOwn ? "text-blue-600" : "text-slate-500",
				)}
				data-testid="message-sender"
			>
				{message.sender}
			</span>
			<div
				className={cn(
					"rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words",
					isOwn
						? "bg-primary text-primary-foreground rounded-br-md"
						: "bg-secondary text-secondary-foreground rounded-bl-md",
				)}
			>
				<p data-testid="message-text">{message.text}</p>
			</div>
			<span
				className="text-[11px] text-muted-foreground mt-1 px-1"
				data-testid="message-timestamp"
			>
				{formatTime(message.created_at)}
			</span>
		</div>
	);
}
