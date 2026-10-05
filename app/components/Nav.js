'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/send', label: 'Send' },
  { href: '/campaigns', label: 'Campaigns' },
  { href: '/contacts', label: 'Contacts' },
  { href: '/customers', label: 'Customers' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/inbox', label: 'Sent inbox' },
  { href: '/verify', label: 'Verify' },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current =
    LINKS.find((l) =>
      l.href === '/' ? pathname === '/' : pathname.startsWith(l.href)
    )?.label || 'Menu';

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className="nav-wrap" ref={ref}>
      <button
        type="button"
        className={`hamburger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="hamburger-lines">
          <span />
          <span />
          <span />
        </span>
        <span className="hamburger-label">{current}</span>
      </button>
      {open && (
        <div className="nav-panel">
          {LINKS.map((l) => {
            const active =
              l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-panel-item ${active ? 'active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
