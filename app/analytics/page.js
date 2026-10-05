'use client';

import { useEffect, useState } from 'react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/stats').then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

  const openRate =
    stats?.sent > 0
      ? Math.round(((stats.opened || 0) / stats.sent) * 1000) / 10
      : 0;

  return (
    <main className="container">
      <h1>Analytics</h1>
      <p className="subtitle">Delivery overview</p>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-value">{stats?.total ?? '—'}</div><div className="stat-label">Total</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.sent ?? '—'}</div><div className="stat-label">Sent</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.opened ?? '—'}</div><div className="stat-label">Opened</div></div>
        <div className="stat-card accent"><div className="stat-value">{openRate}%</div><div className="stat-label">Open rate</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.failed ?? '—'}</div><div className="stat-label">Failed</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.today ?? '—'}</div><div className="stat-label">Today</div></div>
      </div>
    </main>
  );
}
