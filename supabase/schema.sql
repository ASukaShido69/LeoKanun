-- LeoKanun schema
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Events / Schedule
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  client_id UUID,
  category TEXT DEFAULT 'other',
  color TEXT DEFAULT '#C9B8E8',
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  is_all_day BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT,
  reminder_minutes INTEGER[],
  status TEXT DEFAULT 'upcoming',
  attachments TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'todo',
  due_date DATE,
  tags TEXT[],
  estimated_hours NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  category TEXT NOT NULL,
  source TEXT,
  note TEXT,
  date DATE NOT NULL,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  nickname TEXT,
  phone TEXT,
  line_id TEXT,
  facebook TEXT,
  instagram TEXT,
  email TEXT,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs (งานต่อ client)
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2),
  deposit NUMERIC(12,2) DEFAULT 0,
  paid_amount NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  deadline DATE,
  delivered_at DATE,
  sample_images TEXT[],
  attachments TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Queue jobs (งานคิวหน้าร้าน)
CREATE TABLE IF NOT EXISTS queue_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  queue_no INTEGER NOT NULL,
  client_name TEXT NOT NULL,
  job_type TEXT NOT NULL,
  page_count INTEGER NOT NULL DEFAULT 1,
  note TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT queue_jobs_page_count_check CHECK (page_count > 0),
  CONSTRAINT queue_jobs_status_check CHECK (status IN ('waiting', 'printing', 'done'))
);

-- App Settings (shared for this personal app)
CREATE TABLE IF NOT EXISTS app_settings (
  settings_key TEXT PRIMARY KEY,
  settings_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_client_id_fkey') THEN
    ALTER TABLE events
      ADD CONSTRAINT events_client_id_fkey
      FOREIGN KEY (client_id) REFERENCES clients(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_client_id_fkey') THEN
    ALTER TABLE tasks
      ADD CONSTRAINT tasks_client_id_fkey
      FOREIGN KEY (client_id) REFERENCES clients(id);
  END IF;
END
$$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_user_start ON events(user_id, start_datetime);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_jobs_user_status ON jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_queue_jobs_no_status ON queue_jobs(queue_no, status);
CREATE INDEX IF NOT EXISTS idx_app_settings_updated_at ON app_settings(updated_at);

-- RLS Policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own data" ON events;
DROP POLICY IF EXISTS "Users own data" ON tasks;
DROP POLICY IF EXISTS "Users own data" ON transactions;
DROP POLICY IF EXISTS "Users own data" ON clients;
DROP POLICY IF EXISTS "Users own data" ON jobs;
DROP POLICY IF EXISTS "Users own data" ON queue_jobs;
DROP POLICY IF EXISTS "Settings authenticated read" ON app_settings;
DROP POLICY IF EXISTS "Settings authenticated write" ON app_settings;
DROP POLICY IF EXISTS "Settings authenticated insert" ON app_settings;
DROP POLICY IF EXISTS "Settings authenticated update" ON app_settings;
DROP POLICY IF EXISTS "Settings authenticated delete" ON app_settings;

CREATE POLICY "Users own data" ON events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON clients FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON jobs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON queue_jobs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Settings authenticated read" ON app_settings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Settings authenticated insert" ON app_settings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Settings authenticated update" ON app_settings FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Settings authenticated delete" ON app_settings FOR DELETE USING (auth.uid() IS NOT NULL);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'queue_jobs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE queue_jobs;
  END IF;
END
$$;