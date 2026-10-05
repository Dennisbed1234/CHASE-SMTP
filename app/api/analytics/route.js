const { query, hasDatabase } = require('../../../lib/db');

export const dynamic = 'force-dynamic';

function n(v) {
  const x = Number(v);
  return Number.isFinite(x) ? Math.trunc(x) : 0;
}

export async function GET(request) {
  if (!hasDatabase()) {
    return Response.json({
      success: false,
      error: 'DATABASE_URL not set',
      totals: null,
      byDay: [],
      topDomains: [],
    });
  }

  try {
    const url = new URL(request.url);
    const days = Math.min(Math.max(Number(url.searchParams.get('days') || 7), 1), 90);

    let totals = {
      total: 0,
      sent: 0,
      failed: 0,
      opened: 0,
      today: 0,
      last7: 0,
      uniqueContacts: 0,
      openRate: 0,
      failRate: 0,
    };

    try {
      const { rows } = await query(`
        SELECT
          COUNT(*)::int AS total,
          COALESCE(SUM(CASE
            WHEN status IS NULL OR lower(trim(status)) IN ('sent','delivered','opened','pending')
            THEN 1 ELSE 0 END), 0)::int AS sent,
          COALESCE(SUM(CASE WHEN lower(trim(COALESCE(status,''))) = 'failed' THEN 1 ELSE 0 END), 0)::int AS failed,
          COALESCE(SUM(CASE
            WHEN lower(trim(COALESCE(status,''))) = 'opened' OR opened_at IS NOT NULL
            THEN 1 ELSE 0 END), 0)::int AS opened,
          COALESCE(SUM(CASE
            WHEN created_at >= NOW() - INTERVAL '24 hours'
              AND (status IS NULL OR lower(trim(status)) IN ('sent','delivered','opened','pending'))
            THEN 1 ELSE 0 END), 0)::int AS today,
          COALESCE(SUM(CASE
            WHEN created_at >= NOW() - INTERVAL '7 days'
              AND (status IS NULL OR lower(trim(status)) IN ('sent','delivered','opened','pending'))
            THEN 1 ELSE 0 END), 0)::int AS last7
        FROM emails
      `);
      const r = rows[0] || {};
      totals = {
        total: n(r.total),
        sent: n(r.sent),
        failed: n(r.failed),
        opened: n(r.opened),
        today: n(r.today),
        last7: n(r.last7),
        uniqueContacts: 0,
        openRate: 0,
        failRate: 0,
      };
      totals.openRate =
        totals.sent > 0
          ? Math.round((totals.opened / totals.sent) * 1000) / 10
          : 0;
      totals.failRate =
        totals.total > 0
          ? Math.round((totals.failed / totals.total) * 1000) / 10
          : 0;
    } catch (e) {
      console.warn('analytics overview', e.message);
    }

    try {
      const { rows } = await query(`
        SELECT COUNT(DISTINCT lower(trim(recipient)))::int AS c
        FROM emails
        WHERE recipient IS NOT NULL AND trim(recipient) <> ''
          AND (status IS NULL OR lower(trim(status)) IN ('sent','delivered','opened','pending'))
      `);
      totals.uniqueContacts = n(rows[0]?.c);
    } catch {
      /* ignore */
    }

    const byDayMap = new Map();
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      byDayMap.set(key, { date: key, sent: 0, opened: 0, failed: 0 });
    }

    try {
      const { rows } = await query(
        `
        SELECT
          to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
          COALESCE(SUM(CASE
            WHEN status IS NULL OR lower(trim(status)) IN ('sent','delivered','opened','pending')
            THEN 1 ELSE 0 END), 0)::int AS sent,
          COALESCE(SUM(CASE
            WHEN lower(trim(COALESCE(status,''))) = 'opened' OR opened_at IS NOT NULL
            THEN 1 ELSE 0 END), 0)::int AS opened,
          COALESCE(SUM(CASE WHEN lower(trim(COALESCE(status,''))) = 'failed' THEN 1 ELSE 0 END), 0)::int AS failed
        FROM emails
        WHERE created_at >= NOW() - ($1 || ' days')::interval
        GROUP BY 1
        ORDER BY 1 ASC
      `,
        [String(days)]
      );
      for (const r of rows) {
        const key = String(r.day).slice(0, 10);
        if (byDayMap.has(key)) {
          byDayMap.set(key, {
            date: key,
            sent: n(r.sent),
            opened: n(r.opened),
            failed: n(r.failed),
          });
        }
      }
    } catch (e) {
      console.warn('analytics daily', e.message);
    }

    let topDomains = [];
    try {
      const { rows } = await query(
        `
        SELECT
          lower(split_part(trim(recipient), '@', 2)) AS domain,
          COUNT(*)::int AS c
        FROM emails
        WHERE created_at >= NOW() - ($1 || ' days')::interval
          AND recipient IS NOT NULL
          AND position('@' in recipient) > 0
        GROUP BY 1
        HAVING lower(split_part(trim(recipient), '@', 2)) <> ''
        ORDER BY c DESC
        LIMIT 12
      `,
        [String(days)]
      );
      topDomains = rows.map((r) => ({
        name: String(r.domain || 'unknown'),
        count: n(r.c),
      }));
    } catch (e) {
      console.warn('analytics domains', e.message);
    }

    return Response.json({
      success: true,
      days,
      totals,
      byDay: Array.from(byDayMap.values()),
      topDomains,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return Response.json(
      {
        success: false,
        error: error.message || 'Failed',
        totals: null,
        byDay: [],
        topDomains: [],
      },
      { status: 500 }
    );
  }
}
