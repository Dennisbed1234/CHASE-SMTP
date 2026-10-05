import './globals.css';
import Nav from './components/Nav';

export const metadata = {
  title: 'Dispatch SMTP',
  description: 'Gmail mail ops — cyber neon console',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="header-inner">
            <a href="/" className="brand">
              Dispatch SMTP
            </a>
            <Nav />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
