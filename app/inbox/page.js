'use client';

import { useCallback, useEffect, useState } from 'react';

export default function InboxPage() {
  const [emails, setEmails] = useState([]);
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/emails?limit=500');
    const data = await res.json();
    setEmails(data.emails || []);
    setStats(data.stats);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <main className="container">
      <h1>Sent inbox</h1>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-value">{stats?.total ?? emails.length}</div><div className="stat-label">Total</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.sent ?? '—'}</div><div className="stat-label">Sent</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.opened ?? '—'}</div><div className="stat-label">Opened</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.failed ?? '—'}</div><div className="stat-label">Failed</div></div>
      </div>
      <button type="button" className="button secondary" onClick={load}>Refresh</button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="card" style={{ maxHeight: 500, overflow: 'auto' }}>
          {emails.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setSelected(e)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                border: 0, borderBottom: '1px solid #dbeafe', background: selected?.id === e.id ? '#dbeafe' : '#fff',
                padding: 12, cursor: 'pointer', font: 'inherit',
              }}
            >
              <strong>{e.subject}</strong>
              <div className="muted" style={{ fontSize: 13 }}>To: {e.recipient}</div>
            </button>
          ))}
        </div>
        <div className="card">
          {selected ? (
            <>
              <h2 style={{ fontSize: 18 }}>{selected.subject}</h2>
              <p className="muted">To: {selected.recipient}</p>
              {selected.html_body ? (
                <iframe title="view" srcDoc={selected.html_body} sandbox="" style={{ width: '100%', minHeight: 320, border: '1px solid #bfdbfe' }} />
              ) : (
                <pre>{selected.text_body}</pre>
              )}
            </>
          ) : (
            <p className="muted">Select a message</p>
          )}
        </div>
      </div>
    </main>
  );
}
