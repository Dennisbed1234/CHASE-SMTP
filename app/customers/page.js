'use client';

import { useCallback, useEffect, useState } from 'react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [msg, setMsg] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/customers');
    const data = await res.json();
    setCustomers(data.customers || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function sync() {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sync: true }),
    });
    const data = await res.json();
    setMsg(data.message || data.error || 'Done');
    load();
  }

  async function add(e) {
    e.preventDefault();
    await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    setEmail('');
    setName('');
    load();
  }

  return (
    <main className="container">
      <h1>Customers</h1>
      <p className="subtitle">Contact book + sync from sent inbox</p>
      <div className="stat-card accent" style={{ display: 'inline-block', marginBottom: 16 }}>
        <div className="stat-value">{customers.length}</div>
        <div className="stat-label">Contacts</div>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <form onSubmit={add}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <button type="submit" className="button" style={{ marginTop: 12 }}>Add</button>
          <button type="button" className="button secondary" onClick={sync} style={{ marginLeft: 8 }}>Sync from inbox</button>
        </form>
        {msg && <div className="result">{msg}</div>}
      </div>
      <ul className="list">
        {customers.map((c) => (
          <li key={c.email}>
            <strong>{c.name || c.email}</strong>
            <div>{c.email}</div>
            <div className="muted" style={{ fontSize: 13 }}>{c.send_count} sends · {c.note}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
