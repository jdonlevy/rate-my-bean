import { Geist, Geist_Mono } from "next/font/google";
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

export default function RootLayout({ children }) {
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
              <a href="/">All Beans</a>
              <a href="/beans/new">Add Bean</a>
            </nav>
          </div>
        </header>
        <main className="container page-shell">{children}</main>
      </body>
    </html>
  );
}
