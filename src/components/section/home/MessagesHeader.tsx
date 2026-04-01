import { Button } from "../../ui/button";

function MessagesHeader({
	username,
	isConnected,
	setUsername,
}: {
	username: string;
	isConnected: boolean;
	setUsername: (username: string) => void;
}) {
	const handleLogout = () => {
		setUsername("");
	};

	return (
		<div className="flex items-center justify-between px-5 py-4 border-b bg-card">
			<div className="flex items-center gap-3">
				<div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
					<svg
						className="h-4 w-4 text-primary-foreground"
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
				<div>
					<h1 className="text-sm font-semibold">Kairos Nexus</h1>
					<p className="text-xs text-muted-foreground">
						Logged in as{" "}
						<span className="font-medium">{username}</span>
					</p>
				</div>
			</div>
			<div className="flex items-center gap-3">
				<div className="flex items-center gap-1.5">
					<div
						className={`h-2 w-2 rounded-full ${
							isConnected ? "bg-emerald-500" : "bg-red-400"
						}`}
						data-testid="connection-status"
					/>
					<span className="text-xs text-muted-foreground">
						{isConnected ? "Connected" : "Disconnected"}
					</span>
				</div>

				<Button variant="ghost" size="sm" onClick={handleLogout}>
					Leave
				</Button>
			</div>
		</div>
	);
}

export default MessagesHeader;
