// Create mock BEFORE any imports
const listeners: Record<string, ((...args: unknown[]) => void)[]> = {};

const mockSocketInstance = {
	on: jest.fn((event: string, cb: (...args: unknown[]) => void) => {
		if (!listeners[event]) listeners[event] = [];
		listeners[event].push(cb);
	}),
	off: jest.fn(),
	emit: jest.fn(),
	disconnect: jest.fn(),
	connected: true,
	__simulateEvent: (event: string, ...args: unknown[]) => {
		listeners[event]?.forEach((cb) => cb(...args));
	},
	__resetListeners: () => {
		Object.keys(listeners).forEach((key) => delete listeners[key]);
	},
};

const mockSocket = {
	on: jest.fn((event: string, callback: (...args: unknown[]) => void) => {
		if (!listeners[event]) listeners[event] = [];
		listeners[event].push(callback);
	}),
	off: jest.fn(),
	emit: jest.fn(),
	disconnect: jest.fn(),
	connected: true,

	// Test helper: simulate receiving a server event
	__simulateEvent: (event: string, ...args: unknown[]) => {
		if (listeners[event]) {
			listeners[event].forEach((cb) => cb(...args));
		}
	},

	// Test helper: reset listeners
	__resetListeners: () => {
		Object.keys(listeners).forEach((key) => delete listeners[key]);
	},
};

const io = jest.fn(() => mockSocket);

export { io, mockSocket, mockSocketInstance };
