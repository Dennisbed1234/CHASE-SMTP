-- Dispatch SMTP — Neon PostgreSQL schema
-- Safe to re-run (IF NOT EXISTS + ADD COLUMN IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS emails (
  id TEXT PRIMARY KEY,
  sender TEXT NOT NULL DEFAULT '',
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  text_body TEXT,
  html_body TEXT,
  message_type TEXT NOT NULL DEFAULT 'email',
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  message_id TEXT,
  campaign_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  open_count INT NOT NULL DEFAULT 0,
  clicked_at TIMESTAMPTZ,
  click_count INT NOT NULL DEFAULT 0,
  last_event TEXT
);

ALTER TABLE emails ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE emails ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS message_id TEXT;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS campaign_id TEXT;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS open_count INT DEFAULT 0;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMPTZ;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS click_count INT DEFAULT 0;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS last_event TEXT;

CREATE INDEX IF NOT EXISTS idx_emails_created ON emails (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_recipient ON emails (recipient);
CREATE INDEX IF NOT EXISTS idx_emails_status ON emails (status);
CREATE INDEX IF NOT EXISTS idx_emails_campaign ON emails (campaign_id);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  last_emailed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  send_count INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (email);
CREATE INDEX IF NOT EXISTS idx_customers_last ON customers (last_emailed_at DESC);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  total INT NOT NULL DEFAULT 0,
  sent INT NOT NULL DEFAULT 0,
  failed INT NOT NULL DEFAULT 0,
  html_body TEXT,
  text_body TEXT,
  from_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns (status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created ON campaigns (created_at DESC);

CREATE TABLE IF NOT EXISTS campaign_recipients (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  email_log_id TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cr_campaign ON campaign_recipients (campaign_id);
CREATE INDEX IF NOT EXISTS idx_cr_status ON campaign_recipients (campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_cr_email ON campaign_recipients (email);

CREATE TABLE IF NOT EXISTS suppressions (
  email TEXT PRIMARY KEY,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
