'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <style>{`
        .header {
          position: sticky; top: 0; z-index: 100;
          background: #ffffff;
          border-bottom: 1px solid #d8e8d0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .header__inner {
          max-width: 1100px; margin: 0 auto; padding: 0 1.5rem;
          height: 64px; display: flex; align-items: center; justify-content: space-between;
        }
        .header__logo {
          display: flex; align-items: center; gap: 0.5rem;
          text-decoration: none; font-size: 1.25rem; font-weight: 700; color: #1b4332;
        }
        .header__logo span { color: #f4a261; }
        .header__nav { display: flex; align-items: center; gap: 2rem; }
        .header__nav a { text-decoration: none; color: #6b7c6b; font-size: 0.95rem; font-weight: 500; transition: color 0.2s; }
        .header__nav a:hover { color: #2d6a4f; }
        .header__actions { display: flex; gap: 0.75rem; }
        .header__menu-btn { display: none; background: none; border: none; cursor: pointer; color: #1a2e1a; font-size: 1.5rem; }
        .h-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.45rem 1rem; border-radius: 12px; font-size: 0.875rem;
          font-weight: 600; cursor: pointer; text-decoration: none; transition: all 0.2s; border: none;
        }
        .h-btn-outline { background: transparent; color: #2d6a4f; border: 1.5px solid #2d6a4f; }
        .h-btn-outline:hover { background: #2d6a4f; color: #fff; }
        .h-btn-primary { background: #2d6a4f; color: #fff; }
        .h-btn-primary:hover { background: #1b4332; }
        @media (max-width: 768px) {
          .header__nav { display: none; }
          .header__nav.open {
            display: flex; flex-direction: column;
            position: absolute; top: 64px; left: 0; right: 0;
            background: #ffffff; border-bottom: 1px solid #d8e8d0;
            padding: 1rem 1.5rem; gap: 1rem;
          }
          .header__menu-btn { display: block; }
          .h-btn { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
        }
      `}</style>

      <header className="header">
        <div className="header__inner">
          <Link href="/" className="header__logo">
            🌿 Krishi<span>Mitra</span>
          </Link>
          <nav className={`header__nav ${menuOpen ? 'open' : ''}`}>
            <Link href="/" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link href="/livestock" onClick={() => setMenuOpen(false)}>
              Livestock
            </Link>
            <Link href="/crop" onClick={() => setMenuOpen(false)}>
              Crop Doctor
            </Link>
            <Link href="/marketprice" onClick={() => setMenuOpen(false)}>
              Mandi Bhav
            </Link>
            <Link href="/mindpulse" onClick={() => setMenuOpen(false)}>
              Mind Pulse
            </Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)}>
              Contact
            </Link>
          </nav>
          <div className="header__actions">
            <Link href="/login" className="h-btn h-btn-outline">
              Login
            </Link>
            <Link href="/signup" className="h-btn h-btn-primary">
              Sign Up
            </Link>
          </div>
          <button
            className="header__menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>
    </>
  )
}
