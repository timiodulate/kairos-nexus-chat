# API Reference

## Base URL

```
http://localhost:3002
```

## REST Endpoints

### GET /api/messages

Fetch all messages ordered by creation time (oldest first).

**Request:**

```
GET /api/messages
```

**Response: 200 OK**

```json
[
	{
		"id": 1,
		"sender": "Alice",
		"text": "Hello!",
		"created_at": "2025-01-15T10:00:00.000Z"
	},
	{
		"id": 2,
		"sender": "Bob",
		"text": "Hey there!",
		"created_at": "2025-01-15T10:01:00.000Z"
	}
]
```

**Response: 500 Internal Server Error**

```json
{
	"error": "Failed to fetch messages"
}
```

---

### POST /api/messages

Create a new message.

**Request:**

```
POST /api/messages
Content-Type: application/json

{
  "sender": "Alice",
  "text": "Hello!"
}
```

**Validation Rules:**

- `sender` — required, non-empty string, max 50 characters
- `text` — required, non-empty string

**Response: 201 Created**

```json
{
	"id": 3,
	"sender": "Alice",
	"text": "Hello!",
	"created_at": "2025-01-15T10:05:00.000Z"
}
```

**Response: 400 Bad Request**

```json
{
	"error": "sender is required and must be a non-empty string"
}
```

```json
{
	"error": "text is required and must be a non-empty string"
}
```

---

### GET /api/health

Health check endpoint.

**Response: 200 OK**

```json
{
	"status": "ok"
}
```

---

## Socket.io Events

### Client → Server

#### `sendMessage`

Sent when a user submits a new message.

**Payload:**

```json
{
	"sender": "Alice",
	"text": "Hello!"
}
```

**Behavior:**

1. Server validates `sender` (non-empty string) and `text` (non-empty string)
2. On validation failure: emits `error` event back to the sender socket only
3. On success: inserts into PostgreSQL, then broadcasts `message` event to all connected clients

---

### Server → Client

#### `message`

Broadcast to all connected clients when a message is successfully saved.

**Payload:**

```json
{
	"id": 3,
	"sender": "Alice",
	"text": "Hello!",
	"created_at": "2025-01-15T10:05:00.000Z"
}
```

#### `error`

Sent to the originating client only when validation fails.

**Payload:**

```json
{
	"message": "text is required"
}
```

---

## Data Types

### Message

| Field        | Type     | Description                    |
| ------------ | -------- | ------------------------------ |
| `id`         | `number` | Auto-incrementing primary key  |
| `sender`     | `string` | Username of the message sender |
| `text`       | `string` | Message content                |
| `created_at` | `string` | ISO 8601 timestamp of creation |
