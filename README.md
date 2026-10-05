# CHASE-SMTP

LeadBot-style mail ops on **Zoho SMTP** (same IA as leads-gmail / SMTP-MAILER).

## Pages

| Page | Role |
|------|------|
| Dashboard | Stats overview |
| Send | HTML + live preview |
| Campaigns | Bulk + load from Contacts |
| Contacts | Unique successful recipients (auto from inbox) |
| Customers | Contact book + sync |
| Analytics | Open rate, volume |
| Sent inbox | History + counts |
| Verify | Syntax check |

## Setup

1. Env: `ZOHO_EMAIL`, `ZOHO_APP_PASS`, `DATABASE_URL`, `APP_URL`
2. Run `sql/schema.sql` on Neon
3. Deploy / `npm run dev`

No SEC extract (removed by product choice). Contacts come from **sent inbox**, same as LeadBot Contacts.
