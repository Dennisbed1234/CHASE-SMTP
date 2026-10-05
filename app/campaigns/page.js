'use client';

import { useState } from 'react';

export default function CampaignsPage() {
  const [subject, setSubject] = useState('Hello {{name}}');
  const [body, setBody] = useState('<p>Hi {{name}},</p><p>Thanks.</p>');
  const [to, setTo] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  async function run(e) {
    e.preventDefault();
    setLoading(true);
    setResult('');
    try {
      // Immediate send path (queue can be added; same as LeadBot campaign for smaller lists)
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html: body }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(`Sent ${data.sent} · Failed ${data.failed}`);
    } catch (err) {
      setResult(err.message);
    }
    setLoading(false);
  }

  async function fromContacts() {
    const res = await fetch('/api/contacts?limit=500');
    const data = await res.json();
    setTo((data.contacts || []).map((c) => c.email).join('\n'));
  }

  return (
    <main className="container">
      <h1>Campaigns</h1>
      <p className="subtitle">Bulk send · personalize {'{{name}}'}</p>
      <form onSubmit={run} className="card">
        <label>Recipients</label>
        <textarea rows={6} value={to} onChange={(e) => setTo(e.target.value)} required />
        <button type="button" className="button secondary" onClick={fromContacts} style={{ marginTop: 8 }}>
          Load from Contacts
        </button>
        <label>Subject</label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} required />
        <label>HTML</label>
        <textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
        <button type="submit" className="button" disabled={loading} style={{ marginTop: 12 }}>
          {loading ? 'Sending…' : 'Launch'}
        </button>
      </form>
      {result && <div className="result">{result}</div>}
    </main>
  );
}
