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
  description: "Rate coffee beans and discover top regions.",
};

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <header className="site-header">
          <div className="container header-inner">
            <div className="brand">
              <span className="brand-dot" />
              <div>
                <p className="brand-title">Rate My Bean</p>
                <p className="brand-subtitle">Coffee ratings, simplified.</p>
              </div>
            </div>
            <nav className="nav-links">
              <a href="/">Home</a>
              <a href="/beans">All Beans</a>
              <a href="/regions">Regions</a>
              <a href="/beans/new">Add Blend</a>
            </nav>
            <div className="auth-actions">
              {process.env.VERCEL_ENV === "preview" ? (
                <span className="muted">Preview mode</span>
              ) : session?.user ? (
                <>
                  <span className="muted">{session.user.email}</span>
                  <a href="/api/auth/signout">Sign out</a>
                </>
              ) : (
                <a href="/login">Sign in</a>
              )}
            </div>
          </div>
        </header>
        <main className="container page-shell">{children}</main>
        <footer className="site-footer">
          <div className="container">
            <p className="muted">Property of dongdog</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
