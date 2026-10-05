'use client';

import { useMemo, useState } from 'react';

export default function SendPage() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('Hello {{name}}');
  const [html, setHtml] = useState(
    '<div style="font-family:Arial,sans-serif;padding:16px"><h2 style="color:#1d4ed8">Hi {{name}}</h2><p>Your message.</p></div>'
  );
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState('');

  const preview = useMemo(
    () =>
      html
        .replace(/\{\{name\}\}/gi, 'Alex')
        .replace(/\{\{email\}\}/gi, 'alex@example.com'),
    [html]
  );

  async function submit(e) {
    e.preventDefault();
    setSending(true);
    setResult('');
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(`Sent ${data.sent} · Failed ${data.failed}`);
    } catch (err) {
      setResult(err.message);
    }
    setSending(false);
  }

  return (
    <main className="container">
      <h1>Send Email</h1>
      <p className="subtitle">HTML + preview · {'{{name}}'} personalization</p>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <form onSubmit={submit}>
            <label>Recipients</label>
            <textarea rows={4} value={to} onChange={(e) => setTo(e.target.value)} required />
            <label>Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} required />
            <label>HTML</label>
            <textarea rows={10} value={html} onChange={(e) => setHtml(e.target.value)} />
            <button type="submit" className="button" disabled={sending} style={{ marginTop: 12 }}>
              {sending ? 'Sending…' : 'Send'}
            </button>
          </form>
          {result && <div className="result">{result}</div>}
        </div>
        <div className="card">
          <h2 style={{ fontSize: 16 }}>HTML preview</h2>
          <iframe
            title="preview"
            srcDoc={preview}
            style={{ width: '100%', minHeight: 360, border: '1px solid #bfdbfe', borderRadius: 8 }}
            sandbox=""
          />
        </div>
      </div>
    </main>
  );
}
