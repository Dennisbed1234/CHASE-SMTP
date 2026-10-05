'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/analytics?days=7', { cache: 'no-store' });
      const json = await res.json();
      if (!json.success && !json.totals) {
        throw new Error(json.error || 'Failed to load');
      }
      setData(json);
    } catch (e) {
      setError(e.message || 'Failed');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const t = data?.totals || {};
  const byDay = data?.byDay || [];
  const topDomains = data?.topDomains || [];

  const maxDay = useMemo(() => {
    let m = 1;
    for (const d of byDay) m = Math.max(m, d.sent + d.failed);
    return m;
  }, [byDay]);

  const maxDomain = useMemo(() => {
    let m = 1;
    for (const d of topDomains) m = Math.max(m, d.count);
    return m;
  }, [topDomains]);

  return (
    <main className="container">
      <h1>Analytics</h1>
      <p className="subtitle">
        Live stats from Sent inbox · opens, delivery, volume
      </p>

      <div className="toolbar">
        <Link href="/inbox" className="button secondary">
          Sent inbox
        </Link>
        <Link href="/contacts" className="button secondary">
          Contacts
        </Link>
        <button type="button" className="button secondary" onClick={load}>
          Refresh
        </button>
      </div>

      {error && <div className="result error-box">{error}</div>}
      {loading && <p className="muted">Loading…</p>}

      {!loading && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">{t.total ?? 0}</div>
              <div className="stat-label">Total logged</div>
            </div>
            <div className="stat-card accent">
              <div className="stat-value">{t.sent ?? 0}</div>
              <div className="stat-label">Sent / delivered</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{t.opened ?? 0}</div>
              <div className="stat-label">Opened</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{t.failed ?? 0}</div>
              <div className="stat-label">Failed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{t.openRate ?? 0}%</div>
              <div className="stat-label">Open rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{t.uniqueContacts ?? 0}</div>
              <div className="stat-label">Unique contacts</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{t.today ?? 0}</div>
              <div className="stat-label">Sent today (24h)</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{t.last7 ?? 0}</div>
              <div className="stat-label">Sent last 7 days</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, margin: '0 0 12px', color: '#a3e635' }}>
              Volume · last 7 days
            </h2>
            {byDay.length === 0 ? (
              <p className="muted">No volume yet.</p>
            ) : (
              byDay.map((d) => (
                <div key={d.date} style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 8,
                      marginBottom: 6,
                      fontSize: 13,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{d.date}</span>
                    <span className="muted">
                      {d.sent} sent · {d.opened} opened · {d.failed} failed
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      height: 8,
                      borderRadius: 4,
                      background: 'rgba(34,211,238,0.12)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${(d.sent / maxDay) * 100}%`,
                        background: '#22d3ee',
                        height: '100%',
                      }}
                    />
                    <div
                      style={{
                        width: `${(d.failed / maxDay) * 100}%`,
                        background: '#f43f5e',
                        height: '100%',
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card">
            <h2 style={{ fontSize: 16, margin: '0 0 12px', color: '#a3e635' }}>
              Top domains (7 days)
            </h2>
            {topDomains.length === 0 ? (
              <p className="muted">No domain data yet.</p>
            ) : (
              topDomains.map((dom) => (
                <div key={dom.name} style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                      fontSize: 13,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{dom.name}</span>
                    <span className="muted">{dom.count}</span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 4,
                      background: 'rgba(34,211,238,0.12)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${(dom.count / maxDomain) * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg,#22d3ee,#a3e635)',
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </main>
  );
}
