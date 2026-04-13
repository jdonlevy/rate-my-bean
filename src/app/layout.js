import { Geist, Geist_Mono } from "next/font/google";
import { auth } from "@/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Rate My Bean",
  description: "Find great coffee roasters and beans near you.",
};

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <header className="site-header">
          <div className="container header-inner">
            <a href="/" className="brand">
              <span className="brand-dot" />
              <span className="brand-title">Rate My Bean</span>
            </a>
            <nav className="nav-links">
              <a href="/">Discover</a>
              <a href="/beans">All Beans</a>
              <a href="/beans/new">Add Bean</a>
              <a href="/leaderboard">Leaderboard</a>
            </nav>
            <div className="nav-right">
              <div className="nav-games">
                <a href="/bean-snake">Snake</a>
                <a href="/bean-pong">Pong</a>
              </div>
              <div className="auth-actions">
                {process.env.VERCEL_ENV === "preview" ? (
                  <span className="muted">Preview mode</span>
                ) : session?.user ? (
                  <>
                    <span className="muted nav-email">{session.user.email}</span>
                    <a href="/api/auth/signout" className="button small secondary">Sign out</a>
                  </>
                ) : (
                  <a href="/login" className="button small">Sign in</a>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="container page-shell">{children}</main>
        <footer className="site-footer">
          <div className="container footer-inner">
            <a href="/" className="brand">
              <span className="brand-dot" />
              <span className="brand-title">Rate My Bean</span>
            </a>
            <nav className="footer-nav">
              <a href="/">Discover</a>
              <a href="/beans">All Beans</a>
              <a href="/beans/new">Add Bean</a>
              <a href="/leaderboard">Leaderboard</a>
              <a href="/bean-snake">Snake</a>
              <a href="/bean-pong">Pong</a>
            </nav>
            <p className="muted footer-copy">© D0ND0G</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
