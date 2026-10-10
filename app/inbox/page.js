'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

function norm(s) {
  return String(s || '').toLowerCase().trim();
}

function isClicked(e) {
  return norm(e.last_event) === 'clicked' || Number(e.click_count || 0) > 0;
}

function isOpened(e) {
  return norm(e.status) === 'opened' || !!e.opened_at || Number(e.open_count || 0) > 0 || isClicked(e);
}

function statusLabel(e) {
  const s = norm(e.status);
  if (s === 'failed') return 'failed';
  if (isClicked(e)) return 'clicked';
  if (isOpened(e)) return 'opened';
  if (s === 'delivered' || e.delivered_at) return 'delivered';
  if (s === 'sent' || s === 'pending') return 'sent';
  return s || 'unknown';
}

function uniqueEmails(list) {
  const seen = new Set();
  const out = [];
  for (const e of list) {
    const em = String(e.recipient || '').trim().toLowerCase();
    if (!em || seen.has(em)) continue;
    seen.add(em);
    out.push(String(e.recipient).trim());
  }
  return out;
}

function formatWhen(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
}

export default function InboxPage() {
  const [emails, setEmails] = useState([]);
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [copyFormat, setCopyFormat] = useState('newline');
  const [copyMsg, setCopyMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '1000');
      if (q.trim()) params.set('q', q.trim());
      const res = await fetch(`/api/emails?${params}`, { cache: 'no-store' });
      const data = await res.json();
      setEmails(data.emails || []);
      setStats(data.stats);
    } catch {
      /* keep previous */
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const display = useMemo(() => {
    const fromRows = {
      total: emails.length,
      sent: emails.filter((e) =>
        ['sent', 'delivered', 'opened', 'pending'].includes(norm(e.status))
      ).length,
      opened: emails.filter(isOpened).length,
      clicked: emails.filter(isClicked).length,
      failed: emails.filter((e) => norm(e.status) === 'failed').length,
    };
    if (!stats) return fromRows;
    return {
      total: Math.max(stats.total || 0, fromRows.total),
      sent: Math.max(stats.sent || 0, fromRows.sent),
      opened: Math.max(stats.opened || 0, fromRows.opened),
      clicked: Math.max(stats.clicked || 0, fromRows.clicked),
      failed: Math.max(stats.failed || 0, fromRows.failed),
    };
  }, [stats, emails]);

  const filtered = useMemo(() => {
    return emails.filter((e) => {
      if (status === 'failed') return norm(e.status) === 'failed';
      if (status === 'clicked') return isClicked(e);
      if (status === 'opened') return isOpened(e);
      if (status === 'delivered' || status === 'sent') {
        return ['sent', 'delivered', 'opened', 'pending'].includes(norm(e.status));
      }
      return true;
    });
  }, [emails, status]);

  // Keep selection in sync with filtered list
  useEffect(() => {
    if (!selected) return;
    if (!filtered.some((e) => e.id === selected.id)) {
      setSelected(null);
    }
  }, [filtered, selected]);

  const emailCount = useMemo(() => uniqueEmails(filtered).length, [filtered]);

  const filterLabel =
    status === 'opened'
      ? 'Opened'
      : status === 'clicked'
        ? 'Clicked'
        : status === 'failed'
          ? 'Failed'
          : status === 'delivered' || status === 'sent'
            ? 'Sent'
            : 'All';

  const copyEmails = async () => {
    const list = uniqueEmails(filtered);
    if (!list.length) {
      setCopyMsg('No emails to copy');
      setTimeout(() => setCopyMsg(''), 2000);
      return;
    }
    const sep =
      copyFormat === 'comma' ? ', ' : copyFormat === 'semicolon' ? '; ' : '\n';
    const text = list.join(sep);
    try {
      await navigator.clipboard.writeText(text);
      setCopyMsg(`Copied ${list.length}`);
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopyMsg(`Copied ${list.length}`);
      } catch {
        setCopyMsg('Copy failed');
      }
    }
    setTimeout(() => setCopyMsg(''), 2500);
  };

  return (
    <main className="container">
      <h1>Sent inbox</h1>
      <p className="subtitle">
        Sent → Opened → Clicked · auto-refresh · dark theme list + preview
      </p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{display.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-value">{display.sent}</div>
          <div className="stat-label">Sent</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{display.opened}</div>
          <div className="stat-label">Opened</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{display.clicked}</div>
          <div className="stat-label">Clicked</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{display.failed}</div>
          <div className="stat-label">Failed</div>
        </div>
      </div>

      <div className="toolbar">
        <label style={{ margin: 0, minWidth: 140 }}>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="sent">Sent / pipeline</option>
            <option value="opened">Opened</option>
            <option value="clicked">Clicked</option>
            <option value="failed">Failed</option>
          </select>
        </label>
        <label style={{ margin: 0, flex: 1, minWidth: 160 }}>
          Search
          <input
            type="search"
            placeholder="Recipient or subject"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <button type="button" className="button secondary" onClick={load}>
          Refresh
        </button>
      </div>

      <div className="toolbar">
        <span className="muted" style={{ fontSize: 13 }}>
          Copy from filter ({filterLabel})
        </span>
        <select
          value={copyFormat}
          onChange={(e) => setCopyFormat(e.target.value)}
          style={{ width: 'auto', minWidth: 160 }}
        >
          <option value="newline">One per line</option>
          <option value="comma">Comma separated</option>
          <option value="semicolon">Semicolon separated</option>
        </select>
        <button
          type="button"
          className="button"
          onClick={copyEmails}
          disabled={emailCount === 0}
        >
          Copy emails{emailCount > 0 ? ` (${emailCount})` : ''}
        </button>
        {copyMsg ? (
          <span style={{ color: 'var(--lime)', fontSize: 13 }}>{copyMsg}</span>
        ) : null}
      </div>

      {loading && emails.length === 0 ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="inbox-layout">
          <div className="inbox-list card">
            {filtered.length === 0 ? (
              <p className="muted" style={{ padding: 12 }}>
                No emails for this filter.
              </p>
            ) : (
              filtered.map((e) => {
                const active = selected?.id === e.id;
                const label = statusLabel(e);
                return (
                  <button
                    key={e.id}
                    type="button"
                    className={`inbox-item${active ? ' active' : ''}`}
                    onClick={() => setSelected(e)}
                  >
                    <div className="inbox-item-top">
                      <strong className="inbox-subject">
                        {e.subject || '(no subject)'}
                      </strong>
                      <span className={`badge badge-${label}`}>{label}</span>
                    </div>
                    <div className="inbox-meta">To: {e.recipient}</div>
                    <div className="inbox-meta">{formatWhen(e.created_at)}</div>
                  </button>
                );
              })
            )}
          </div>

          <div className="inbox-preview card">
            {selected ? (
              <>
                <div className="inbox-preview-header">
                  <h2>{selected.subject || '(no subject)'}</h2>
                  <span className={`badge badge-${statusLabel(selected)}`}>
                    {statusLabel(selected)}
                  </span>
                </div>
                <p className="muted" style={{ margin: '0 0 8px' }}>
                  To: {selected.recipient}
                </p>
                <p className="muted" style={{ margin: '0 0 12px', fontSize: 13 }}>
                  {formatWhen(selected.created_at)}
                  {Number(selected.open_count) > 0
                    ? ` · opens ${selected.open_count}`
                    : ''}
                  {Number(selected.click_count) > 0
                    ? ` · clicks ${selected.click_count}`
                    : ''}
                  {selected.error_message
                    ? ` · error: ${selected.error_message}`
                    : ''}
                </p>
                {selected.html_body ? (
                  <iframe
                    title="preview"
                    srcDoc={selected.html_body}
                    sandbox=""
                    className="inbox-iframe"
                  />
                ) : selected.text_body ? (
                  <pre className="inbox-text">{selected.text_body}</pre>
                ) : (
                  <p className="muted">No body stored for this message.</p>
                )}
              </>
            ) : (
              <p className="muted">Select a message</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
