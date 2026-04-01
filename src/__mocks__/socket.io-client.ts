const listeners: Record<string, ((...args: unknown[]) => void)[]> = {};

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

export const io = jest.fn(() => mockSocket);
export default { io };
export { mockSocket };
