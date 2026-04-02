# Architecture

## System Overview

Kairos Nexus Chat is a real-time 1-to-1 messaging application with three layers: a React single-page app, an Express + Socket.io server, and a PostgreSQL database.

```
┌──────────────────────────────┐
│        Browser Tab A         │
│  React + Socket.io Client    │
└──────────┬───────────────────┘
           │  WebSocket + HTTP
           ▼
┌──────────────────────────────┐
│     Express + Socket.io      │
│         (Port 3001)          │
│                              │
│  REST: GET/POST /api/messages│
│  WS:   sendMessage / message │
└──────────┬───────────────────┘
           │  SQL via pg Pool
           ▼
┌──────────────────────────────┐
│        PostgreSQL             │
│     messages table            │
└──────────────────────────────┘
           ▲
           │  SQL via pg Pool
┌──────────┴───────────────────┐
│     Express + Socket.io      │
└──────────▲───────────────────┘
           │  WebSocket + HTTP
┌──────────┴───────────────────┐
│        Browser Tab B         │
│  React + Socket.io Client    │
└──────────────────────────────┘
```

## Data Flow

### Sending a message

1. User types text and clicks Send
2. `useChat` hook calls `socket.emit("sendMessage", { sender, text })`
3. Server's `socket.on("sendMessage")` handler validates the payload
4. Server inserts the message into PostgreSQL via `INSERT ... RETURNING`
5. Server calls `io.emit("message", savedMessage)` to broadcast to **all** clients
6. Each client's `socket.on("message")` handler appends the message to React state
7. React re-renders the message list; `useEffect` auto-scrolls to the bottom

### Loading history

1. On mount, `useChat` calls `fetch("GET /api/messages")`
2. Server queries `SELECT * FROM messages ORDER BY created_at ASC`
3. Response is stored in React state and rendered

## Frontend Component Tree

```
App
└── UserProvider (context)
    └── AppContent (pages)
        ├── LoginPage          (when username is empty)
        │   ├── Card
        │   ├── Input
        │   └── Button
        │
        └── HomePage             (when username is set)
            ├── MessagesHeader (username, connection status, logout)
            ├── ErrorBanner (conditional)
            ├── ScrollArea
            │   ├── Loading Spinner (conditional)
            │   ├── Empty State (conditional)
            │   └── MessageBubble[] (message list)
            └── Input Bar
                ├── Input
                └── Button (send)
```

## State Management

- **UserContext**: Holds the current `username` string. Set on login, cleared on logout. No external state library — React Context is sufficient for this scope.
- **useChat hook**: Owns all chat state (`messages`, `isConnected`, `isLoading`, `error`). Manages the Socket.io lifecycle. Returns `sendMessage` for the UI to call.

## Database Schema

```sql
CREATE TABLE messages (
  id         SERIAL PRIMARY KEY,
  sender     VARCHAR(50) NOT NULL,
  text       TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_created_at ON messages (created_at ASC);
```

## Key Design Choices

**Server as source of truth**: The client does not optimistically add sent messages to its own state. Instead, it waits for the server to broadcast the message back via `io.emit`. This guarantees both clients always display identical message lists.

**Validation on both layers**: The Socket.io handler and the REST POST endpoint both validate `sender` and `text` independently. The socket handler emits an `error` event back to the sender on validation failure.

**Separated app and server**: `app.ts` exports the Express app without starting it. `index.ts` creates the HTTP server, attaches Socket.io, and listens. This separation lets tests import `app` directly with Supertest without port conflicts.
