'use client'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'

/* ── Nav items — label + icon matching the Framer component ── */
const NAV = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/livestock', label: 'Livestock', icon: '🐄' },
  { href: '/crop', label: 'Crop Doctor', icon: '🌾' },
  { href: '/marketprice', label: 'Mandi Bhav', icon: '📈' },
  { href: '/mindpulse', label: 'Mind Pulse', icon: '🧠' },
  { href: '/contact', label: 'Contact', icon: '✉️' },
]

/* ── Single rotating nav item ── */
function RotatingNavItem({
  href,
  label,
  icon,
  onClick,
}: {
  href: string
  label: string
  icon: string
  onClick?: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '44px',
        overflow: 'hidden',
        textDecoration: 'none',
        padding: '0 2px',
        perspective: '600px',
        cursor: 'pointer',
      }}
    >
      {/* Invisible spacer — keeps link width stable */}
      <span
        aria-hidden
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          visibility: 'hidden',
          fontSize: '0.875rem',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        <span>{icon}</span>
        {label}
      </span>

      {/* TOP LAYER — plain text, visible by default, flips UP on hover */}
      <motion.span
        animate={
          hovered
            ? { y: '-120%', rotateX: 70, opacity: 0 }
            : { y: '-50%', rotateX: 0, opacity: 1 }
        }
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#1b4332',
          whiteSpace: 'nowrap',
          transformOrigin: 'bottom center',
          pointerEvents: 'none',
        }}
      >
        {label}
      </motion.span>

      {/* BOTTOM LAYER — icon + text, hidden below, flips IN on hover */}
      <motion.span
        animate={
          hovered
            ? { y: '-50%', rotateX: 0, opacity: 1 }
            : { y: '70%', rotateX: -70, opacity: 0 }
        }
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#2d6a4f',
          whiteSpace: 'nowrap',
          transformOrigin: 'top center',
          pointerEvents: 'none',
        }}
      >
        <span style={{ fontSize: '1rem', lineHeight: 1 }}>{icon}</span>
        {label}
      </motion.span>
    </Link>
  )
}

/* ── Header ── */
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <style>{`
        .header {
          position: sticky; top: 0; z-index: 100;
          background: rgba(255,255,255,0.80);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
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

        .header__nav { display: flex; align-items: center; gap: 0.35rem; }

        /* thin divider between items like the Framer component */
        .nav-sep {
          width: 1px; height: 14px;
          background: rgba(27,67,50,0.18);
          flex-shrink: 0;
        }

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
            background: rgba(255,255,255,0.97);
            backdrop-filter: blur(18px);
            border-bottom: 1px solid #d8e8d0;
            padding: 1rem 1.5rem; gap: 0.25rem;
          }
          .header__nav.open .nav-sep { display: none; }
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
            {NAV.map((item, i) => (
              <span key={item.href} style={{ display: 'contents' }}>
                <RotatingNavItem
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  onClick={() => setMenuOpen(false)}
                />
                {i < NAV.length - 1 && <span className="nav-sep" />}
              </span>
            ))}
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
