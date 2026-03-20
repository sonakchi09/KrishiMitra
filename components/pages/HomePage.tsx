'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

const WORDS = [
  { word: 'ସାଥୀ',     lang: 'Odia' },
  { word: 'FRIEND',    lang: 'English' },
  { word: 'साथी',     lang: 'Hindi' },
  { word: 'दोस्त',    lang: 'Hindi' },
  { word: 'ALLY',      lang: 'English' },
  { word: 'ସଖା',      lang: 'Odia' },
  { word: 'COMPANION', lang: 'English' },
  { word: 'यार',      lang: 'Hindi' },
  { word: 'ବନ୍ଧୁ',    lang: 'Odia' },
]

const features = [
  { icon: '🐄', title: 'Livestock Health Monitor', desc: "Upload a photo of your animal. Get an instant diagnosis and treatment advice in Odia before it's too late.", tag: 'AI Powered', href: '/livestock' },
  { icon: '🌾', title: 'Crop Doctor', desc: 'Photo of a diseased leaf? Identify the disease instantly and get step-by-step treatment — works offline.', tag: 'AI Powered', href: '/crop' },
  { icon: '📈', title: 'Market Price Alerts', desc: 'Daily price updates so you know the best time to sell. Never lose money to bad timing again.', tag: 'Coming Soon', href: '#' },
  { icon: '🧠', title: 'Mind Pulse', desc: 'Silent mental wellness check through how you type. No forms, no questions, no stigma.', tag: 'Coming Soon', href: '#' },
]

const MASONRY = [
  { type: 'stat',  icon: '🌾', value: '10,000+', label: 'Farmers Helped',      accent: '#b5f02a', size: 'tall'   },
  { type: 'info',  icon: '📱', title: 'Works on Any Phone', desc: 'No smartphone needed. KrishiMitra works on basic Android devices, even with low connectivity.',  size: 'normal' },
  { type: 'info',  icon: '🗣️', title: 'Speaks Odia',        desc: 'All responses are in Odia — the language farmers actually understand and trust.',                 size: 'normal' },
  { type: 'stat',  icon: '⚡', value: '< 3 sec',  label: 'AI Response Time',   accent: '#f4f4f0', size: 'short'  },
  { type: 'quote', icon: '💬', text: '"KrishiMitra saved my cattle when there was no vet for 40 km."',            author: 'Farmer, Koraput',   size: 'normal' },
  { type: 'stat',  icon: '🔬', value: '94%',       label: 'Diagnosis Accuracy', accent: '#b5f02a', size: 'short'  },
  { type: 'info',  icon: '🌐', title: 'Works Offline',       desc: 'Core features like crop disease detection work without internet — built for rural Odisha.',       size: 'normal' },
  { type: 'quote', icon: '💬', text: '"Finally an app that understands my problems in my own language."',          author: 'Farmer, Kalahandi', size: 'tall'   },
  { type: 'stat',  icon: '🏥', value: '5+',        label: 'Diseases Detected',  accent: '#f4f4f0', size: 'short'  },
  { type: 'info',  icon: '🤝', title: 'Expert Backed',       desc: 'AI trained on data from veterinarians and agricultural scientists across Odisha.',                size: 'normal' },
  { type: 'stat',  icon: '📍', value: '30+',       label: 'Districts Covered',  accent: '#b5f02a', size: 'short'  },
  { type: 'info',  icon: '🔒', title: 'Private & Safe',      desc: 'Your farm data stays on your device. We never share or sell farmer information.',                  size: 'normal' },
]

// ── shared text-shadow for heading outline ──
const OUTLINE = '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 2px 2px 8px rgba(0,0,0,0.9)'

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function MasonryCard({ item, delay }: { item: typeof MASONRY[0]; delay: number }) {
  const { ref, visible } = useInView(0.08)
  const base: React.CSSProperties = {
    transition: `opacity 0.65s ${delay}ms ease, transform 0.65s ${delay}ms cubic-bezier(0.22,1,0.36,1)`,
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(28px)',
  }

  if (item.type === 'stat') {
    const tall = item.size === 'tall'
    return (
      <div ref={ref} style={{ ...base, background: item.accent === '#b5f02a' ? '#b5f02a' : 'rgba(255,255,255,0.06)', border: item.accent === '#b5f02a' ? 'none' : '1px solid rgba(244,244,240,0.08)', borderRadius: 2, padding: tall ? '48px 32px' : '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, gridRow: tall ? 'span 2' : 'span 1', textAlign: 'center' }}>
        <span style={{ fontSize: tall ? '3rem' : '2rem' }}>{item.icon}</span>
        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: tall ? '3.5rem' : '2.8rem', lineHeight: 1, color: item.accent === '#b5f02a' ? '#0d1a0d' : '#b5f02a', letterSpacing: '0.02em' }}>{item.value}</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: item.accent === '#b5f02a' ? 'rgba(13,26,13,0.7)' : 'rgba(244,244,240,0.55)' }}>{item.label}</span>
      </div>
    )
  }
  if (item.type === 'quote') {
    const tall = item.size === 'tall'
    return (
      <div ref={ref} style={{ ...base, background: 'rgba(181,240,42,0.04)', border: '1px solid rgba(181,240,42,0.14)', borderRadius: 2, padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16, gridRow: tall ? 'span 2' : 'span 1' }}>
        <span style={{ fontSize: '1.8rem' }}>💬</span>
        <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: tall ? '1.55rem' : '1.2rem', lineHeight: 1.3, color: '#f4f4f0', letterSpacing: '0.02em' }}>{item.text}</p>
        <span style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b5f02a' }}>— {item.author}</span>
      </div>
    )
  }
  return (
    <div ref={ref} style={{ ...base, background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(244,244,240,0.07)', borderRadius: 2, padding: '28px', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: 'linear-gradient(180deg,#b5f02a 0%,rgba(181,240,42,0.08) 100%)' }} />
      <span style={{ fontSize: '1.8rem' }}>{item.icon}</span>
      <h4 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.2rem', letterSpacing: '0.03em', textTransform: 'uppercase', color: '#f4f4f0', margin: 0 }}>{item.title}</h4>
      <p style={{ fontSize: '0.82rem', color: 'rgba(244,244,240,0.55)', lineHeight: 1.7, fontWeight: 300, margin: 0 }}>{item.desc}</p>
    </div>
  )
}

export default function HomePage() {
  const [index,   setIndex]   = useState(0)
  const [entered, setEntered] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    setEntered(false); setLeaving(false)
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)))
    const t1 = setTimeout(() => setLeaving(true), 2400)
    const t2 = setTimeout(() => setIndex(i => (i + 1) % WORDS.length), 2900)
    return () => { cancelAnimationFrame(r); clearTimeout(t1); clearTimeout(t2) }
  }, [index])

  const wordAnim: React.CSSProperties = {
    display: 'block', willChange: 'transform,opacity',
    transform: leaving ? 'translateY(-115%)' : entered ? 'translateY(0)' : 'translateY(115%)',
    opacity:   leaving ? 0 : entered ? 1 : 0,
    transition: leaving
      ? 'transform .42s cubic-bezier(.55,0,.78,0), opacity .35s ease'
      : entered ? 'transform .56s cubic-bezier(.22,1,.36,1), opacity .44s ease' : 'none',
  }
  const langAnim: React.CSSProperties = {
    ...wordAnim,
    transition: leaving
      ? 'transform .42s .04s cubic-bezier(.55,0,.78,0), opacity .35s ease'
      : entered ? 'transform .56s .06s cubic-bezier(.22,1,.36,1), opacity .44s ease' : 'none',
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        .hero-bg {
          background: url('/home-bg.jpeg') center center / cover no-repeat;
        }

        .card-hover {
          position: relative; overflow: hidden;
          transition: background .25s, border-color .25s, transform .22s;
        }
        .card-hover::before {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: #b5f02a; transform: scaleX(0); transform-origin: left;
          transition: transform .32s cubic-bezier(.22,1,.36,1);
        }
        .card-hover:hover::before { transform: scaleX(1); }
        .card-hover:hover {
          background: rgba(181,240,42,.06);
          border-color: rgba(181,240,42,.22);
          transform: translateY(-3px);
        }

        .stat-vert { writing-mode: vertical-rl; transform: rotate(180deg); }

        .masonry-grid {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          grid-auto-rows: 200px;
          gap: 12px;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1200px) {
          .masonry-grid { grid-template-columns: repeat(3,1fr); }
        }
        @media (max-width: 900px) {
          .hero-section    { grid-template-columns: 1fr !important; padding: 0 24px !important; padding-top: 76px !important; }
          .right-col       { display: none !important; }
          .bottom-strip    { grid-template-columns: 1fr !important; }
          .feat-section    { padding: 60px 24px !important; }
          .feat-grid       { grid-template-columns: 1fr 1fr !important; }
          .nav-links       { display: none !important; }
          .nav-inner       { padding: 14px 20px !important; }
          .heading-row     { gap: 14px !important; }
          .vert-line       { height: clamp(3.8rem,9vw,7.5rem) !important; }
          .masonry-section { padding: 60px 24px !important; }
          .masonry-grid    { grid-template-columns: repeat(2,1fr); grid-auto-rows: 185px; }
          .footer-cta      { padding: 60px 24px !important; }
        }
        @media (max-width: 600px) {
          .feat-grid    { grid-template-columns: 1fr !important; }
          .masonry-grid { grid-template-columns: 1fr; grid-auto-rows: auto; }
          .masonry-grid > * { grid-row: span 1 !important; min-height: 140px; }
          .heading-row  { gap: 10px !important; flex-wrap: nowrap; }
        }
      `}</style>

      <div style={{ fontFamily: "'DM Sans',sans-serif", background: '#0d1a0d', color: '#f4f4f0', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* ══ NAV ══ */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', background: 'rgba(13,26,13,0.65)', borderBottom: '1px solid rgba(181,240,42,0.09)' }}>
          <div className="nav-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 48px' }}>

            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.5rem', letterSpacing: '0.05em', color: '#f4f4f0', textDecoration: 'none' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#b5f02a', display: 'inline-block', flexShrink: 0 }} />
              KrishiMitra
            </Link>

            <ul className="nav-links" style={{ display: 'flex', gap: 36, listStyle: 'none' }}>
              {[{ label:'Home', href:'#' }, { label:'About', href:'#' }, { label:'Livestock', href:'/livestock' }, { label:'Crop', href:'/crop' }, { label:'Market', href:'#' }].map(item => (
                <li key={item.label}>
                  <a href={item.href}
                     style={{ color: 'rgba(244,244,240,0.55)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.02em', transition: 'color .18s' }}
                     onMouseEnter={e => (e.currentTarget.style.color = '#f4f4f0')}
                     onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,244,240,0.55)')}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <Link href="/livestock"
              style={{ padding: '9px 22px', border: '1.5px solid #f4f4f0', color: '#f4f4f0', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', transition: 'background .18s, color .18s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f4f4f0'; e.currentTarget.style.color = '#0d1a0d' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f4f4f0' }}>
              Get Started
            </Link>
          </div>
        </nav>

        {/* ══ HERO ══ */}
        <section className="hero-section hero-bg" style={{ position: 'relative', minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '0 48px', paddingTop: 88, overflow: 'hidden' }}>

          {/* LEFT */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 0 100px', gap: 30 }}>

            {/* KRISHI | animated word */}
            <div className="heading-row" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>

              {/* KRISHI */}
              <h1 style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 'clamp(4rem, 10vw, 9.5rem)',
                lineHeight: 1, letterSpacing: '0.01em',
                color: '#f4f4f0', textTransform: 'uppercase', whiteSpace: 'nowrap',
                textShadow: OUTLINE,
              }}>
                KRISHI
              </h1>

              {/* Vertical lime divider */}
              <div className="vert-line" style={{ width: 3, height: 'clamp(4rem,10vw,9.5rem)', background: 'linear-gradient(180deg,rgba(181,240,42,.15) 0%,#b5f02a 45%,rgba(181,240,42,.15) 100%)', borderRadius: 2, flexShrink: 0 }} />

              {/* Animated word + lang */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5 }}>
                <div style={{ overflow: 'hidden', height: 'clamp(3.8rem,9.8vw,9rem)' }}>
                  <span key={`w-${index}`} style={{
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: 'clamp(3.8rem,9.8vw,9rem)',
                    lineHeight: 1, color: '#b5f02a',
                    textTransform: 'uppercase', letterSpacing: '0.01em',
                    textShadow: OUTLINE,
                    ...wordAnim,
                  }}>
                    {WORDS[index].word}
                  </span>
                </div>
                <div style={{ overflow: 'hidden', height: '1.1rem' }}>
                  <span key={`l-${index}`} style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(181,240,42,0.7)', ...langAnim }}>
                    {WORDS[index].lang}
                  </span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.95rem', color: 'rgba(244,244,240,0.85)', maxWidth: 360, lineHeight: 1.78, fontWeight: 300, textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
              <span className='text-bl'>Modern solutions, AI technology, and expert support to help Odisha farmers grow more.</span>
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link href="/livestock"
                style={{ padding: '13px 28px', background: '#f4f4f0', color: '#0d1a0d', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.04em', textDecoration: 'none', transition: 'background .18s, transform .15s', display: 'inline-block' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#b5f02a'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f4f4f0'; e.currentTarget.style.transform = 'translateY(0)' }}>
                Explore Services
              </Link>
              <Link href="/crop"
                style={{ padding: '13px 28px', border: '1.5px solid rgba(244,244,240,0.55)', color: '#f4f4f0', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 8, transition: 'border-color .18s, color .18s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#b5f02a'; e.currentTarget.style.color = '#b5f02a' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(244,244,240,0.55)'; e.currentTarget.style.color = '#f4f4f0' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem' }}>▶</span>
                Watch Video
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          {/* <div className="right-col" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', padding: '60px 0 100px', gap: 20 }}>
            <div style={{ width: 260, height: 260, background: '#b5f02a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, marginRight: 40 }}>
              <span style={{ fontSize: '3.5rem' }}>🌱</span>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.1rem', letterSpacing: '0.08em', color: '#0d1a0d', textAlign: 'center', lineHeight: 1.3, textTransform: 'uppercase' }}>
                AI-Powered<br />Agriculture
              </span>
            </div>
            <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.5rem', color: '#f4f4f0', letterSpacing: '0.02em', textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>10,000+</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'rgba(244,244,240,0.75)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right', lineHeight: 1.4 }}>Farmers<br />Benefited</span>
              </div>
              <div className="stat-vert" style={{ background: 'rgba(13,26,13,0.88)', border: '1px solid rgba(181,240,42,0.3)', padding: '12px 8px', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b5f02a' }}>
                95% Positive Feedback
              </div>
            </div>
          </div> */}
          {/* RIGHT */}
<div className="right-col" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', padding: '60px 0 100px', gap: 20 }}>

  {/* Image with diagonal lime box behind it */}
  <div style={{ position: 'relative', width: 320, height: 420, marginRight: 40 }}>

    {/* Lime green box — behind, offset top-left diagonally, sticking out */}
    <div style={{
      position: 'absolute',
      top: -22,
      left: -22,
      width: '100%',
      height: '100%',
      background: '#b5f02a',
      zIndex: 0,
    }} />

    {/* Farmer image on top */}
    <img
      src="/farmer.jpg"
      alt="Farmer"
      style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
      }}
    />
  </div>

  {/* Stat badge — unchanged */}
  <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
      <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.5rem', color: '#f4f4f0', letterSpacing: '0.02em', textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>10,000+</span>
      <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'rgba(244,244,240,0.75)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right', lineHeight: 1.4 }}>Farmers<br />Benefited</span>
    </div>
    <div className="stat-vert" style={{ background: 'rgba(13,26,13,0.88)', border: '1px solid rgba(181,240,42,0.3)', padding: '12px 8px', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b5f02a' }}>
      95% Positive Feedback
    </div>
  </div>
</div>
        </section>

        {/* ══ BOTTOM STRIP ══ */}
        <div className="bottom-strip" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', minHeight: 200 }}>
          <div style={{ background: 'rgba(10,20,10,0.97)', padding: '40px 48px', display: 'flex', alignItems: 'center' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 500, color: 'rgba(244,244,240,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1.9, maxWidth: 240 }}>
              Modern farming solutions, technology, and expert support to help farmers grow more.
            </p>
          </div>
          <div style={{ background: '#1a3d10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '5rem', opacity: 0.65 }}>🌿</span>
          </div>
          <div style={{ background: '#f4f4f0', color: '#0d1a0d', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
            <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.55rem', lineHeight: 1.1, letterSpacing: '0.02em', textTransform: 'uppercase' }}>Modern Agriculture Solutions</h3>
            <p style={{ fontSize: '0.82rem', color: '#444', lineHeight: 1.7, maxWidth: 280 }}>
              We are dedicated to transforming agriculture with modern technology, innovation, and expert guidance for every farmer in Odisha.
            </p>
          </div>
        </div>

        {/* ══ FEATURES ══ */}
        <section className="feat-section" style={{ padding: '96px 48px', background: '#0d1a0d' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2.5rem,5vw,4rem)', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
              Four Tools, One Mission
            </h2>
            <div style={{ flex: 1, height: 1, background: 'rgba(244,244,240,0.1)' }} />
            <span style={{ fontSize: '0.72rem', color: 'rgba(244,244,240,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>04 features</span>
          </div>
          <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2 }}>
            {features.map(f => (
              <Link key={f.title} href={f.href} className="card-hover"
                style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(244,244,240,0.07)', padding: '36px 28px 32px', textDecoration: 'none', color: '#f4f4f0', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <span style={{ fontSize: '2.2rem' }}>{f.icon}</span>
                <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.35rem', lineHeight: 1.15, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{f.title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'rgba(244,244,240,0.55)', lineHeight: 1.72, fontWeight: 300, flex: 1 }}>{f.desc}</p>
                <span style={{ alignSelf: 'flex-start', padding: '4px 11px', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4, ...(f.tag === 'AI Powered' ? { background: '#b5f02a', color: '#0d1a0d' } : { border: '1px solid rgba(244,244,240,0.22)', color: 'rgba(244,244,240,0.5)' }) }}>
                  {f.tag}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ══ MASONRY ══ */}
        <section className="masonry-section" style={{ padding: '96px 48px', background: '#080f08', borderTop: '1px solid rgba(181,240,42,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2.5rem,5vw,4rem)', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
              Why Farmers Trust Us
            </h2>
            <div style={{ flex: 1, height: 1, background: 'rgba(244,244,240,0.08)' }} />
            <span style={{ fontSize: '0.72rem', color: 'rgba(244,244,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Impact & Stories</span>
          </div>
          <div className="masonry-grid">
            {MASONRY.map((item, i) => (
              <MasonryCard key={i} item={item} delay={Math.min(i % 4, 3) * 75} />
            ))}
          </div>
        </section>

        {/* ══ FOOTER CTA ══ */}
        <section className="footer-cta" style={{ padding: '80px 48px', background: '#b5f02a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2.5rem,6vw,5rem)', color: '#0d1a0d', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1 }}>
            Ready to Grow Smarter?
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'rgba(13,26,13,0.7)', maxWidth: 400, lineHeight: 1.78 }}>
            Join thousands of Odisha farmers already using KrishiMitra to protect their crops and livestock.
          </p>
          <Link href="/livestock"
            style={{ padding: '14px 36px', background: '#0d1a0d', color: '#f4f4f0', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none', transition: 'background .18s, transform .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1a3010'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0d1a0d'; e.currentTarget.style.transform = 'translateY(0)' }}>
            Start for Free
          </Link>
        </section>

      </div>
    </>
  )
}