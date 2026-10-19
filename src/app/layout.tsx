import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Edutech — Next-Gen LMS Platform & Cloud Architecture",
  description:
    "Enterprise-grade Edutech platform built with Next.js 16, PostgreSQL, Prisma ORM, and Docker Compose orchestration.",
  keywords: [
    "Edutech",
    "LMS",
    "Next.js 16",
    "PostgreSQL",
    "Prisma ORM",
    "Docker Compose",
    "TypeScript",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-grid-pattern">
        {/* Navigation Bar */}
        <header className="navbar">
          <div className="container nav-container">
            <Link href="/" className="brand-link">
              <div className="brand-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <path d="M6 6h10" />
                  <path d="M6 10h10" />
                  <path d="M6 14h7" />
                </svg>
              </div>
              <span>
                Edu<span className="gradient-text">Tech</span>
              </span>
            </Link>

            <nav>
              <ul className="nav-links">
                <li>
                  <Link href="/" className="nav-link">
                    Overview
                  </Link>
                </li>
                <li>
                  <Link href="/courses" className="nav-link">
                    Courses Catalog
                  </Link>
                </li>
                <li>
                  <Link href="/docs/fastapi" className="nav-link">
                    FastAPI Docs
                  </Link>
                </li>
                <li>
                  <a href="#docker-architecture" className="nav-link">
                    Docker & DB Stack
                  </a>
                </li>
                <li>
                  <a href="#schema-reference" className="nav-link">
                    Prisma Schema
                  </a>
                </li>
                <li>
                  <a
                    href="/api/health"
                    target="_blank"
                    rel="noreferrer"
                    className="nav-link"
                  >
                    API Health
                  </a>
                </li>
              </ul>
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <span className="badge badge-success">
                <span className="pulse-dot success" />
                PostgreSQL &amp; Docker
              </span>
              <a
                href="#quickstart"
                className="btn btn-primary btn-sm"
              >
                Quickstart
              </a>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main>{children}</main>

        {/* Global Footer */}
        <footer className="footer">
          <div className="container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "2rem" }}>
              <div style={{ maxWidth: "380px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.85rem" }}>
                  <div className="brand-icon" style={{ width: "28px", height: "28px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                    </svg>
                  </div>
                  <strong style={{ color: "#fff", fontSize: "1.1rem" }}>EduTech Cloud Platform</strong>
                </div>
                <p style={{ fontSize: "0.875rem", lineHeight: "1.5" }}>
                  A production-ready full-stack learning management foundation engineered with Next.js 16, PostgreSQL 16, Prisma ORM, and isolated multi-container Docker environments.
                </p>
              </div>

              <div>
                <h4 style={{ color: "#fff", marginBottom: "0.85rem", fontSize: "0.95rem" }}>Architecture</h4>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.85rem" }}>
                  <li><a href="#docker-architecture" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Docker Compose Services</a></li>
                  <li><a href="#schema-reference" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Prisma Relational Models</a></li>
                  <li><a href="/api/health" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Health &amp; Uptime Check</a></li>
                  <li><a href="/api/courses" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Courses JSON REST API</a></li>
                </ul>
              </div>

              <div>
                <h4 style={{ color: "#fff", marginBottom: "0.85rem", fontSize: "0.95rem" }}>Stack Details</h4>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.85rem" }}>
                  <li>Node.js v20+ / Next.js 16 App Router</li>
                  <li>PostgreSQL 16 Alpine Database</li>
                  <li>Prisma ORM 6.4 + Automated Seeding</li>
                  <li>Standalone Multi-Stage Container</li>
                </ul>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", fontSize: "0.825rem" }}>
              <span>&copy; {new Date().getFullYear()} EduTech Project Skeleton. All rights reserved.</span>
              <span className="badge badge-info">Production Ready Docker &amp; DB Scaffold</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
