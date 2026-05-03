-- 1. Create the Chats Table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the Messages Table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS) to ensure users can only see their own chats
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Chats
CREATE POLICY "Users can insert their own chats" ON chats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own chats" ON chats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own chats" ON chats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own chats" ON chats FOR DELETE USING (auth.uid() = user_id);

-- 5. RLS Policies for Messages
CREATE POLICY "Users can insert messages to their own chats" ON messages FOR INSERT WITH CHECK (
  chat_id IN (SELECT id FROM chats WHERE user_id = auth.uid())
);
CREATE POLICY "Users can view messages from their own chats" ON messages FOR SELECT USING (
  chat_id IN (SELECT id FROM chats WHERE user_id = auth.uid())
);
