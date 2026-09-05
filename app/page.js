"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [health, setHealth] = useState({ checked: false });
  const [form, setForm] = useState({ to: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setHealth({ checked: true, ...data }))
      .catch(() =>
        setHealth({ checked: true, connected: false, error: "Could not reach the server." })
      );
  }, []);

  const statusState = !health.checked
    ? "checking"
    : health.connected
    ? "connected"
    : "error";

  const statusLabel = !health.checked
    ? "checking connection…"
    : health.connected
    ? `connected — ${health.sender || "smtp.zoho.com"}`
    : "not connected";

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        setResult({ state: "success", text: "Sent. Check the recipient's inbox." });
        setForm({ to: "", subject: "", message: "" });
      } else {
        setResult({ state: "error", text: data.error || "Send failed." });
      }
    } catch (err) {
      setResult({ state: "error", text: "Could not reach the server." });
    } finally {
      setSending(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.column}>
        <header className={styles.header}>
          <span className={styles.wordmark}>Dispatch</span>
          <span className={styles.status}>
            <span className={styles.dot} data-state={statusState} />
            {statusLabel}
          </span>
        </header>

        <section className={styles.hero}>
          <h1 className={styles.headline}>Every message finds its way out.</h1>
          <p className={styles.subhead}>
            A direct line from this app to your customers&rsquo; inbox, routed
            through Zoho Mail. No queue, no dashboard to check — it either
            sends or tells you why not.
          </p>
        </section>

        <hr className={styles.rule} />

        <section>
          <p className={styles.sectionLabel}>Send a test message</p>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="to">To</label>
              <input
                id="to"
                type="email"
                required
                value={form.to}
                onChange={(e) => setForm({ ...form, to: e.target.value })}
                placeholder="customer@example.com"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="A quick note"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Write what you'd like to say."
              />
            </div>

            <div className={styles.actions}>
              <button className={styles.submit} type="submit" disabled={sending}>
                {sending ? "Sending…" : "Send message"}
              </button>
              {result && (
                <span className={styles.feedback} data-state={result.state}>
                  {result.text}
                </span>
              )}
            </div>
          </form>
        </section>

        <hr className={styles.rule} />

        <section className={styles.manifest}>
          <div className={styles.manifestRow}>
            <span className={styles.manifestKey}>host</span>
            <span className={styles.manifestValue}>smtp.zoho.com</span>
          </div>
          <div className={styles.manifestRow}>
            <span className={styles.manifestKey}>port</span>
            <span className={styles.manifestValue}>587 (STARTTLS)</span>
          </div>
          <div className={styles.manifestRow}>
            <span className={styles.manifestKey}>sender</span>
            <span className={styles.manifestValue}>{health.sender || "—"}</span>
          </div>
        </section>

        <footer className={styles.footer}>
          Built for small, direct sends — not bulk campaigns. Zoho&rsquo;s free
          tier holds around 25 messages an hour.
        </footer>
      </div>
    </main>
  );
}
