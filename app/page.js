'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [contacts, setContacts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then((r) => r.json()),
      fetch('/api/contacts?limit=1').then((r) => r.json()),
    ])
      .then(([s, c]) => {
        setStats(s);
        setContacts(c.totalUnique || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total', value: stats?.total ?? '—' },
    { label: 'Sent', value: stats?.sent ?? '—' },
    { label: 'Opened', value: stats?.opened ?? '—' },
    { label: 'Failed', value: stats?.failed ?? '—' },
    { label: 'Contacts', value: contacts || '—' },
    { label: 'Today', value: stats?.today ?? '—' },
  ];

  return (
    <main className="container">
      <h1>Dashboard</h1>
      <p className="subtitle">CHASE-SMTP · LeadBot-style overview (Zoho SMTP)</p>
      <div className="stat-grid">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <div className="stat-value">{loading ? '…' : c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="toolbar">
          <Link href="/send" className="button">Send</Link>
          <Link href="/campaigns" className="button secondary">Campaigns</Link>
          <Link href="/contacts" className="button secondary">Contacts</Link>
          <Link href="/inbox" className="button secondary">Inbox</Link>
        </div>
      </div>
    </main>
  );
}
