"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Home() {
  const [health, setHealth] = useState({ checked: false });
  const [form, setForm] = useState({ to: "", subject: "", message: "" });
  const [isHtml, setIsHtml] = useState(false);
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpStage, setOtpStage] = useState("idle");
  const [otpSending, setOtpSending] = useState(false);
  const [otpResult, setOtpResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

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
      let attachments;
      if (file) {
        const base64 = await fileToBase64(file);
        attachments = [
          { filename: file.name, content: base64, contentType: file.type || undefined },
        ];
      }

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, isHtml, attachments }),
      });
      const data = await res.json();

      if (data.success) {
        const count = data.recipients || 1;
        setResult({
          state: "success",
          text:
            count === 1
              ? "Sent. Check the recipient's inbox."
              : `Sent to ${count} recipients.`,
        });
        setForm({ to: "", subject: "", message: "" });
        setFile(null);
      } else {
        setResult({ state: "error", text: data.error || "Send failed." });
      }
    } catch (err) {
      setResult({ state: "error", text: "Could not reach the server." });
    } finally {
      setSending(false);
    }
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    setOtpSending(true);
    setOtpResult(null);
    setVerifyResult(null);

    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: otpEmail }),
      });
      const data = await res.json();

      if (data.success) {
        setOtpResult({ state: "success", text: "Code sent." });
        setOtpStage("sent");
      } else {
        setOtpResult({ state: "error", text: data.error || "Could not send code." });
      }
    } catch (err) {
      setOtpResult({ state: "error", text: "Could not reach the server." });
    } finally {
      setOtpSending(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setVerifying(true);
    setVerifyResult(null);

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: otpEmail, code: otpCode }),
      });
      const data = await res.json();

      setVerifyResult(
        data.success
          ? { state: "success", text: "Code verified." }
          : { state: "error", text: "Invalid or expired code." }
      );
    } catch (err) {
      setVerifyResult({ state: "error", text: "Could not reach the server." });
    } finally {
      setVerifying(false);
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
          <p className={styles.sectionLabel}>Send a message</p>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="to">To</label>
              <textarea
                id="to"
                required
                rows={3}
                value={form.to}
                onChange={(e) => setForm({ ...form, to: e.target.value })}
                placeholder={
                  "customer1@example.com\n" +
                  "customer2@example.com\n" +
                  "customer3@example.com"
                }
              />
              <p className={styles.hint}>
                Multiple addresses allowed — separate with commas, spaces,
                semicolons, or new lines.
              </p>
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
              <label htmlFor="message">
                {isHtml ? "HTML template" : "Message"}
              </label>
              <textarea
                id="message"
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder={
                  isHtml
                    ? "<div>Paste your full HTML template here</div>"
                    : "Write what you'd like to say."
                }
              />
            </div>

            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={isHtml}
                onChange={(e) => setIsHtml(e.target.checked)}
              />
              This is a raw HTML template, send it as-is
            </label>

            <div className={styles.field}>
              <label htmlFor="attachment">Attachment (optional)</label>
              <input
                id="attachment"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
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

        <section>
          <p className={styles.sectionLabel}>One-time codes</p>

          <form className={styles.form} onSubmit={handleSendOtp}>
            <div className={styles.field}>
              <label htmlFor="otpEmail">Email</label>
              <input
                id="otpEmail"
                type="email"
                required
                value={otpEmail}
                onChange={(e) => setOtpEmail(e.target.value)}
                placeholder="customer@example.com"
              />
            </div>
            <div className={styles.actions}>
              <button className={styles.submit} type="submit" disabled={otpSending}>
                {otpSending ? "Sending…" : "Send code"}
              </button>
              {otpResult && (
                <span className={styles.feedback} data-state={otpResult.state}>
                  {otpResult.text}
                </span>
              )}
            </div>
          </form>

          {otpStage === "sent" && (
            <form className={styles.form} onSubmit={handleVerifyOtp} style={{ marginTop: 8 }}>
              <div className={styles.field}>
                <label htmlFor="otpCode">Code</label>
                <input
                  id="otpCode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className={styles.codeInput}
                />
              </div>
              <div className={styles.actions}>
                <button className={styles.submit} type="submit" disabled={verifying}>
                  {verifying ? "Checking…" : "Verify code"}
                </button>
                {verifyResult && (
                  <span className={styles.feedback} data-state={verifyResult.state}>
                    {verifyResult.text}
                  </span>
                )}
              </div>
            </form>
          )}
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
