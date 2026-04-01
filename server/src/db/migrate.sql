CREATE TABLE IF NOT EXISTS messages (
  id         SERIAL PRIMARY KEY,
  sender     VARCHAR(50) NOT NULL,
  text       TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at ASC);
