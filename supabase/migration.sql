-- ============================================================
-- Fleet CRM — Supabase Database Schema v4.5
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Master data table (all shared CRM data as a single JSON blob)
CREATE TABLE IF NOT EXISTS master_data (
    id          INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    companies   JSONB NOT NULL DEFAULT '[]'::jsonb,
    users       JSONB NOT NULL DEFAULT '[]'::jsonb,
    calls       JSONB NOT NULL DEFAULT '[]'::jsonb,
    deals       JSONB NOT NULL DEFAULT '[]'::jsonb,
    activities  JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by  TEXT
);

-- 2. Changes log table (optional tracking)
CREATE TABLE IF NOT EXISTS sync_log (
    id          BIGSERIAL PRIMARY KEY,
    action      TEXT NOT NULL,
    user_agent  TEXT,
    changes_count INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Insert initial admin user + empty data
INSERT INTO master_data (id, companies, users, calls, deals, activities)
VALUES (
    1,
    '[]'::jsonb,
    '[{"id":"admin","username":"admin","email":"admin@fleet.com","password":"admin123","name":"المدير العام","role":"admin","status":"active","avatar":"👑","color":"#7c3aed","_needsPasswordChange":true}]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable RLS
ALTER TABLE master_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies — allow full anon access (internal CRM)
DROP POLICY IF EXISTS "anon_full_access" ON master_data;
CREATE POLICY "anon_full_access" ON master_data FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_sync_log" ON sync_log;
CREATE POLICY "anon_sync_log_insert" ON sync_log FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_sync_log_select" ON sync_log FOR SELECT USING (true);

-- 6. Enable real-time for master_data
ALTER PUBLICATION supabase_realtime ADD TABLE master_data;

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_master_data_updated ON master_data (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_log_created ON sync_log (created_at DESC);
