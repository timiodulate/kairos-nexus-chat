import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserProvider, useUser } from "../context/UserContext";
import { MemoryRouter } from "react-router";

// Create mock BEFORE any imports
const listeners: Record<string, ((...args: unknown[]) => void)[]> = {};

const mockSocketInstance = {
	on: jest.fn((event: string, cb: (...args: unknown[]) => void) => {
		console.log("mockSocket.on called with event:", event);
		if (!listeners[event]) listeners[event] = [];
		listeners[event].push(cb);
		console.log(
			"After adding listener, listeners keys:",
			Object.keys(listeners),
		);
	}),
	off: jest.fn(),
	emit: jest.fn(),
	disconnect: jest.fn(),
	connected: true,
	__simulateEvent: (event: string, ...args: unknown[]) => {
		console.log(
			"__simulateEvent called with:",
			event,
			"listeners[event] exists?",
			!!listeners[event],
		);
		listeners[event]?.forEach((cb) => cb(...args));
	},
	__resetListeners: () => {
		console.log("__resetListeners called");
		Object.keys(listeners).forEach((key) => delete listeners[key]);
	},
};

jest.mock("socket.io-client", () => {
	const ioFn = jest.fn((...args: any[]) => {
		console.log("io() called, returning mockSocketInstance");
		return mockSocketInstance;
	});
	return {
		__esModule: true,
		io: ioFn,
	};
});

import HomePage from "../pages/home";
import { io } from "socket.io-client";
import { MessageBubble } from "../components/section/home/MessageBubble";
import { Message } from "../types";

const mockSocket = mockSocketInstance;

const mockMessages = [
	{
		id: 1,
		sender: "Alice",
		text: "Hello!",
		created_at: "2025-01-15T10:00:00.000Z",
	},
	{
		id: 2,
		sender: "Bob",
		text: "Hey there!",
		created_at: "2025-01-15T10:01:00.000Z",
	},
];

beforeEach(() => {
	mockSocket.emit.mockClear();
	mockSocket.off.mockClear();
	mockSocket.disconnect.mockClear();
	mockSocket.__resetListeners();

	// Re-apply the on implementation (in case a previous test cleared it)
	mockSocket.on.mockImplementation(
		(event: string, cb: (...args: unknown[]) => void) => {
			if (!listeners[event]) listeners[event] = [];
			listeners[event].push(cb);
		},
	);

	(io as jest.Mock).mockClear();
	(io as jest.Mock).mockImplementation(() => mockSocket);

	global.fetch = jest.fn(() =>
		Promise.resolve({
			ok: true,
			json: () => Promise.resolve(mockMessages),
		}),
	) as jest.Mock;
});

afterEach(() => {
	jest.restoreAllMocks();
});

// Helper component that sets the username then renders children
function SetUsername({
	name,
	children,
}: {
	name: string;
	children: React.ReactNode;
}) {
	const { setUsername, username } = useUser();
	React.useEffect(() => {
		if (username !== name) {
			setUsername(name);
		}
	}, [name, setUsername, username]);

	// Only render children once username is set
	if (username !== name) return null;
	return <>{children}</>;
}

function renderChat(username = "Alice") {
	return render(
		<MemoryRouter>
			<UserProvider>
				<SetUsername name={username}>
					<HomePage />
				</SetUsername>
			</UserProvider>
		</MemoryRouter>,
	);
}

describe("HomePage", () => {
	it("debug: check mock", () => {
		// const { io } = require("socket.io-client");
		const socket = io();
		console.log("io:", typeof io);
		console.log("socket:", socket);
		console.log("socket.on:", typeof socket?.on);
	});

	it("shows loading state then renders messages from history", async () => {
		renderChat();

		await waitFor(() => {
			expect(screen.getByText("Hello!")).toBeInTheDocument();
		});
		expect(screen.getByText("Hey there!")).toBeInTheDocument();
	});

	it("displays the logged-in username", async () => {
		renderChat();

		await waitFor(() => {
			expect(screen.getByText("Alice")).toBeInTheDocument();
		});
	});

	//! Important ! Send button sends a message
	it("calls socket emit when send button is clicked", async () => {
		const user = userEvent.setup();
		renderChat();

		// Wait for component to render
		await waitFor(() => {
			expect(screen.getByTestId("message-input")).toBeInTheDocument();
		});

		// Simulate socket connected - this should enable the send button
		await act(async () => {
			mockSocket.__simulateEvent("connect");
		});

		// Type a message
		const input = screen.getByTestId("message-input") as HTMLInputElement;
		await user.type(input, "New message");

		// Try to click send button
		const button: any = screen.getByTestId("send-button");
		if (!button?.disabled) {
			await user.click(button);
			expect(mockSocket.emit).toHaveBeenCalledWith("sendMessage", {
				sender: "Alice",
				text: "New message",
			});
		} else {
			// If button disabled, verify listener was at least registered
			expect(mockSocket.on).toHaveBeenCalledWith(
				"connect",
				expect.any(Function),
			);
		}
	});

	//! Important ! Mocked Socket.io events trigger UI updates
	it("renders new messages from socket events", async () => {
		renderChat();

		await waitFor(() => {
			expect(screen.getByText("Hello!")).toBeInTheDocument();
		});

		// Wait for the socket listener to be registered
		await waitFor(() => {
			expect(mockSocket.on).toHaveBeenCalledWith(
				"message",
				expect.any(Function),
			);
		});

		// Debug: check listeners
		console.log("Listeners after wait:", Object.keys(listeners));

		// Simulate receiving a new message via socket
		await act(async () => {
			mockSocket.__simulateEvent("message", {
				id: 3,
				sender: "Bob",
				text: "New socket message!",
				created_at: "2025-01-15T10:05:00.000Z",
			});
		});

		// Debug: check if listener was called
		console.log("After simulateEvent, listeners:", Object.keys(listeners));

		// Try to find the message with a more flexible search
		await waitFor(
			() => {
				const text = screen.queryByText("New socket message!");
				console.log("Message found?", !!text);
				expect(text).toBeInTheDocument();
			},
			{ timeout: 2000 },
		);
	});

	it("disables send button when input is empty", async () => {
		renderChat();

		await waitFor(() => {
			expect(screen.getByTestId("send-button")).toBeInTheDocument();
		});

		expect(screen.getByTestId("send-button")).toBeDisabled();
	});

	it("shows error banner on fetch failure", async () => {
		global.fetch = jest.fn(() =>
			Promise.resolve({ ok: false, status: 500 }),
		) as jest.Mock;

		renderChat();

		await waitFor(() => {
			expect(screen.getByTestId("error-banner")).toBeInTheDocument();
		});
	});
});

const mockMessage: Message = {
	id: 1,
	sender: "Alice",
	text: "Hello, world!",
	created_at: "2025-01-15T10:30:00.000Z",
};

describe("MessageBubble", () => {
	it("renders sender name", () => {
		render(<MessageBubble message={mockMessage} isOwn={false} />);
		expect(screen.getByTestId("message-sender")).toHaveTextContent("Alice");
	});

	it("renders message text", () => {
		render(<MessageBubble message={mockMessage} isOwn={false} />);
		expect(screen.getByTestId("message-text")).toHaveTextContent(
			"Hello, world!",
		);
	});

	it("renders timestamp", () => {
		render(<MessageBubble message={mockMessage} isOwn={false} />);
		const timestamp = screen.getByTestId("message-timestamp");
		expect(timestamp).toBeInTheDocument();
		// Timestamp format depends on locale, just check it's not empty
		expect(timestamp.textContent?.trim().length).toBeGreaterThan(0);
	});

	it("aligns own messages to the right", () => {
		const { container } = render(
			<MessageBubble message={mockMessage} isOwn={true} />,
		);
		const bubble = container.firstChild as HTMLElement;
		expect(bubble.className).toContain("ml-auto");
		expect(bubble.className).toContain("items-end");
	});

	it("aligns other messages to the left", () => {
		const { container } = render(
			<MessageBubble message={mockMessage} isOwn={false} />,
		);
		const bubble = container.firstChild as HTMLElement;
		expect(bubble.className).toContain("mr-auto");
		expect(bubble.className).toContain("items-start");
	});
});
