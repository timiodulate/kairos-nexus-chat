# Kairos Nexus Chat

A real-time 1-to-1 chat application built for the Kairos Nexus Challenge. Two users can send and receive messages instantly with full persistence.

## Prerequisites

- **Node.js** 18+ (recommended 20 LTS)
- **PostgreSQL** 14+
- **npm** 9+

## Tech Stack

### Frontend

- React 18+ with TypeScript
- Tailwind CSS
- shadcn/ui components (Button,
  Card, Input, ScrollArea)
- Socket.io client

### Backend

- Node.js with Express
- Socket.io

### Database

- PostgreSQL with raw SQL via

### Testing

- Jest
- React Testing Library

### CI/CD

- GitHub Actions

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/timiodulate/kairos-nexus-chat.git
cd kairos-nexus-chat

# Install frontend dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..
```

### 2. Set up the database

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE kairos_chat;"
```

### 3. Configure environment

```bash
# Copy the example env file to project root
cp .env.example .env

# Edit .env with your database credentials:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kairos_chat
# PORT=3002
# REACT_APP_API_URL=http://localhost:3002
# REACT_APP_SOCKET_URL=http://localhost:3002
```

### 4. Run the migration

```bash
cd server && npm run db:migrate && cd ..
```

### 5. Start the application

```bash
# Start both frontend and backend concurrently
npm run dev
```

This starts:

- **Frontend** on `http://localhost:3000`
- **Backend** on `http://localhost:3001`

### 6. Test it

1. Open `http://localhost:3000` in one browser tab
2. Enter a username (e.g. "Alice") and click **Join Chat**
3. Open `http://localhost:3000` in a second tab
4. Enter a different username (e.g. "Bob") and click **Join Chat**
5. Send messages — they appear in real-time in both tabs
6. Refresh either tab — message history persists

## Running Tests

```bash
# All tests (frontend + backend)
npm test

# Frontend tests only
npm run test:client

# Backend tests only
npm run test:server

# Lint check
npm run lint
```

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full system design, including data flow and component hierarchy.

## API Reference

See [docs/API.md](docs/API.md) for REST endpoints and Socket.io event contracts.
