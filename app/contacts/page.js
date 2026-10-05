'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [meta, setMeta] = useState({ totalUnique: 0, totalSentLogs: 0 });
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      params.set('limit', '5000');
      const res = await fetch(`/api/contacts?${params}`);
      const data = await res.json();
      if (data.error && !(data.contacts || []).length) throw new Error(data.error);
      setContacts(data.contacts || []);
      setMeta({
        totalUnique: data.totalUnique || 0,
        totalSentLogs: data.totalSentLogs || 0,
      });
    } catch (e) {
      setError(e.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="container">
      <h1>Contacts</h1>
      <p className="subtitle">
        Unique successful recipients — LeadBot-style (from sent inbox)
      </p>
      <div className="stat-grid">
        <div className="stat-card accent">
          <div className="stat-value">{meta.totalUnique || contacts.length}</div>
          <div className="stat-label">Unique</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{meta.totalSentLogs}</div>
          <div className="stat-label">Sends logged</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{selected.size}</div>
          <div className="stat-label">Selected</div>
        </div>
      </div>
      {error && <div className="result error-box">{error}</div>}
      <div className="toolbar">
        <input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="button" className="button secondary" onClick={load}>Refresh</button>
        <Link href="/campaigns" className="button">Campaigns</Link>
      </div>
      {loading ? (
        <p className="muted">Loading…</p>
      ) : contacts.length === 0 ? (
        <div className="card">
          <p>No contacts yet. Send mail — they appear here automatically.</p>
        </div>
      ) : (
        <ul className="list">
          {contacts.map((c) => (
            <li key={c.email}>
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontWeight: 400 }}>
                <input
                  type="checkbox"
                  checked={selected.has(c.email)}
                  onChange={() => {
                    setSelected((prev) => {
                      const next = new Set(prev);
                      if (next.has(c.email)) next.delete(c.email);
                      else next.add(c.email);
                      return next;
                    });
                  }}
                />
                <span>
                  <strong>{c.email}</strong>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {c.sendCount} send(s)
                    {c.lastSubject ? ` · ${c.lastSubject}` : ''}
                    {c.lastSentAt
                      ? ` · ${new Date(c.lastSentAt).toLocaleString()}`
                      : ''}
                  </div>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
