# CHASE-SMTP

Futuristic mail ops console on **Gmail SMTP** (Google App Password).

## Provider

Uses `smtp.gmail.com` via `SMTP_USER` + `SMTP_PASS` (App Password).

## Pages

Dashboard · Send · Campaigns · Contacts · Customers · Analytics · Inbox · Verify

## Setup

1. Google Account → Security → 2-Step Verification → App passwords
2. Env (see `.env.example`):
   - `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `DATABASE_URL`, `APP_URL`
3. Run `sql/schema.sql` on Neon
4. Deploy

## Design

Cyber-neon dark UI (cyan / lime) — distinct from SMTP-MAILER.
