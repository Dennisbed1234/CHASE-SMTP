'use client';

import { useState } from 'react';

export default function VerifyPage() {
  const [raw, setRaw] = useState('');
  const [out, setOut] = useState([]);

  function run(e) {
    e.preventDefault();
    const emails = raw.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || [];
    const unique = [...new Set(emails.map((x) => x.toLowerCase()))];
    setOut(
      unique.map((email) => ({
        email,
        status: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'syntax ok' : 'invalid',
      }))
    );
  }

  return (
    <main className="container">
      <h1>Verify</h1>
      <p className="subtitle">Quick syntax check (LeadBot-style entry point)</p>
      <form onSubmit={run} className="card">
        <textarea rows={6} value={raw} onChange={(e) => setRaw(e.target.value)} />
        <button type="submit" className="button" style={{ marginTop: 12 }}>Check</button>
      </form>
      <ul className="list">
        {out.map((r) => (
          <li key={r.email}>{r.email} — {r.status}</li>
        ))}
      </ul>
    </main>
  );
}
