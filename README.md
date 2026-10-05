# Dispatch SMTP

Futuristic mail ops console on **Gmail SMTP** (Google App Password).

Repo folder may still be named CHASE-SMTP; the product UI is **Dispatch SMTP**.

## Provider

Uses `smtp.gmail.com` via `SMTP_USER` + `SMTP_PASS` (App Password).

## Pages

Dashboard · Send · Campaigns · Contacts · Customers · Analytics · Inbox · Verify

## Setup

1. Google Account → Security → 2-Step Verification → App passwords
2. Env (see `.env.example`):
   - `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `DATABASE_URL`, `APP_URL`
3. Run the Neon SQL below (or `sql/schema.sql`)
4. Deploy

## Design

Cyber-neon dark UI (cyan / lime).
