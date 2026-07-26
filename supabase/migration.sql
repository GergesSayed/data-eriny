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

-- 2. Activity log for auditing (optional, for tracking who changed what)
CREATE TABLE IF NOT EXISTS sync_log (
    id          BIGSERIAL PRIMARY KEY,
    action      TEXT NOT NULL,           -- 'SYNC_PUSH' / 'SYNC_PULL'
    user_agent  TEXT,
    ip_address  TEXT,
    changes     JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Insert initial admin user + empty data
INSERT INTO master_data (id, companies, users, calls, deals, activities)
VALUES (
    1,
    '[]'::jsonb,
    '[{"id":"admin","username":"admin","email":"admin@fleet.com","password":"admin123","name":"المدير العام (عرض الكل)","role":"admin","status":"active","avatar":"👑","color":"#7c3aed","_needsPasswordChange":true}]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE master_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies — allow read/write for authenticated users using service_role
CREATE POLICY "Allow full access via service_role"
    ON master_data FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow insert to sync_log"
    ON sync_log FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow select from sync_log"
    ON sync_log FOR SELECT
    USING (true);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_master_data_updated ON master_data (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_log_created ON sync_log (created_at DESC);
