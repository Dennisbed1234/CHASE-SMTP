import './globals.css';
import Nav from './components/Nav';

export const metadata = {
  title: 'CHASE-SMTP',
  description: 'LeadBot-style mail ops — Zoho SMTP',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="header-inner">
            <a href="/" className="brand">
              CHASE-SMTP
            </a>
            <Nav />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
