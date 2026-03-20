'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props { defaultMode?: 'login' | 'signup' }

export default function AuthPage({ defaultMode = 'login' }: Props) {
  const [flipped, setFlipped] = useState(defaultMode === 'signup')
  const router = useRouter()

  const playFlip = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const dur = 0.38, sr = ctx.sampleRate
      const buf = ctx.createBuffer(1, sr * dur, sr)
      const d = buf.getChannelData(0)
      for (let i = 0; i < d.length; i++) {
        const t = i / sr
        const n = Math.random() * 2 - 1
        const e = Math.exp(-t * 9) * Math.pow(Math.sin(Math.PI * t / dur), 0.6)
        const s = Math.sin(2 * Math.PI * (290 - t * 260) * t)
        d[i] = (n * 0.38 + s * 0.12) * e * 0.55
      }
      const src = ctx.createBufferSource(); src.buffer = buf
      const lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 1700
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.7, 0); gain.gain.exponentialRampToValueAtTime(0.001, dur)
      src.connect(lpf); lpf.connect(gain); gain.connect(ctx.destination); src.start()
    } catch (_) {}
  }

  const flip = (to: boolean) => { playFlip(); setFlipped(to) }

  const WAVE_W = 90
  const wavePath   = `M32 0 C52 0,68 20,62 72 C54 138,20 158,24 240 C28 322,62 342,56 400 C50 444,38 466,32 480 L${WAVE_W} 480 L${WAVE_W} 0 Z`
  const waveShadow = `M36 0 C56 0,72 20,66 72 C58 138,24 158,28 240 C32 322,66 342,60 400 C54 444,42 466,36 480 L${WAVE_W} 480 L${WAVE_W} 0 Z`

  const WaveSVG = () => (
    <svg
      className="absolute top-0 left-0 h-full pointer-events-none"
      style={{ zIndex: 10, flexShrink: 0 }}
      width={WAVE_W}
      viewBox={`0 0 ${WAVE_W} 480`}
      preserveAspectRatio="none"
    >
      <path d={waveShadow} fill="rgba(0,0,0,0.07)" />
      <path d={wavePath}   fill="white" />
    </svg>
  )

  return (
    /* ── Page wrapper: background.jpg fills the whole page behind the card ── */
    <div
      className="min-h-screen flex items-center justify-center p-6 overflow-hidden relative"
      style={{
        backgroundImage: 'url(contact-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#1e4a34', /* fallback */
      }}
    >
      {/* Subtle dark scrim so card pops against bg */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(10,30,18,0.45)' }} />

      {/* ── Outer card ── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          width: 900, maxWidth: '100%', height: 480,
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          perspective: '1400px',
          zIndex: 1,
        }}
      >

        ════════════════════════════════════
            LEFT: login.jpg — pure image, nothing
            on top of it at all. No overlay,
            no logo, no circle, no tint.
        ════════════════════════════════════
        <div className="absolute inset-y-0 left-0 z-[1]" style={{ width: '50%' }}>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/login.jpeg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#2d5a45',
            }}
          />
          {/* ← zero overlays, zero children — image is completely clean */}
        </div>

        {/* ── Right half white base ── */}
        <div className="absolute inset-y-0 right-0 z-[1] bg-white" style={{ width: '50%' }} />

        {/* ════════════════════════════════════
            SIGNUP PANEL
            - z-[5] so it sits behind login page
            - opacity controlled by flipped state
            - NO overlay, NO tint, NO extra divs
              that could cast green on the image
            - starts at calc(50% - 60px) so the
              wave SVG overlaps the image edge
        ════════════════════════════════════ */}
        <div
          className="absolute inset-y-0 z-[5]"
          style={{
            left: 'calc(50% - 60px)',
            right: 0,
            opacity: flipped ? 1 : 0,
            pointerEvents: flipped ? 'all' : 'none',
            transition: 'opacity 0.18s ease',
            transitionDelay: flipped ? '0.5s' : '0s',
          }}
        >
          <WaveSVG />
          <div
            className="absolute top-0 bottom-0 right-0 bg-white flex flex-col justify-center"
            style={{ left: WAVE_W - 2, padding: '0 48px 0 22px' }}
          >
            <p style={{ fontSize: 26, fontWeight: 700, color: '#1a3d2a', margin: '0 0 3px', fontFamily: 'sans-serif' }}>Sign Up</p>
            <p style={{ fontSize: 12, color: '#7a9e8a', margin: '0 0 18px', fontFamily: 'sans-serif' }}>Join thousands of Odisha farmers 🙏</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <FormField id="su-name"  label="Full Name"    type="text" placeholder="Your name" />
              <FormField id="su-phone" label="Phone Number" type="tel"  placeholder="10-digit" />
            </div>
            <FormField id="su-district" label="District (Odisha)" type="text"     placeholder="e.g. Cuttack, Puri, Koraput" />
            <div style={{ marginTop: 12 }}>
              <FormField id="su-pass" label="Password" type="password" placeholder="Create a password" />
            </div>
            <div style={{ marginTop: 16 }}>
              <GreenBtn onClick={() => router.push('/')}>Create Account →</GreenBtn>
            </div>
            <p style={{ textAlign: 'center', fontSize: 12.5, color: '#555', margin: '12px 0 0', fontFamily: 'sans-serif' }}>
              Already registered?{' '}
              <button type="button" onClick={() => flip(false)}
                style={{ color: '#2d5a45', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: 12.5, fontFamily: 'sans-serif' }}>
                Login
              </button>
            </p>
            <p style={{ textAlign: 'center', fontSize: 10, color: '#c0d8ca', margin: '10px 0 0', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'sans-serif' }}>
              Terms and Services
            </p>
          </div>
        </div>

        {/* ════════════════════════════════════
            LOGIN PAGE — flipping book page
            Logo lives here (only visible on login)
        ════════════════════════════════════ */}
        <div
          className="absolute inset-y-0 z-10"
          style={{
            left: 'calc(50% - 60px)',
            right: 0,
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.84s cubic-bezier(0.4,0,0.2,1)',
            transform: flipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* FRONT: Login form */}
          <div className="absolute inset-0 flex" style={{ backfaceVisibility: 'hidden' }}>
            <WaveSVG />
            <div
              className="absolute top-0 bottom-0 right-0 bg-white flex flex-col justify-center"
              style={{ left: WAVE_W - 2, padding: '0 48px 0 22px' }}
            >
              {/* Logo — only here, only on login */}
              <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
                <div className="flex items-center justify-center rounded-full"
                  style={{ width: 34, height: 34, background: '#1e4a34', flexShrink: 0 }}>
                  <span style={{ fontSize: 16 }}>🌱</span>
                </div>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 800, color: '#1e4a34', letterSpacing: '0.07em', lineHeight: 1.2, margin: 0 }}>KRISHI</p>
                  <p style={{ fontSize: 9, fontWeight: 900, color: '#1e4a34', letterSpacing: '0.07em', lineHeight: 1.2, margin: 0 }}>MITRA</p>
                </div>
              </div>

              <p style={{ fontSize: 30, fontWeight: 700, color: '#1a3d2a', margin: '0 0 3px', fontFamily: 'sans-serif' }}>Login</p>
              <p style={{ fontSize: 12, color: '#7a9e8a', margin: '0 0 20px', fontFamily: 'sans-serif' }}>Welcome back, farmer 🙏</p>

              <FormField id="li-user" label="Username" type="text"     placeholder="Enter your username" />
              <div style={{ marginTop: 13 }}>
                <FormField id="li-pass" label="Password" type="password" placeholder="Enter your password" />
              </div>
              <p style={{ textAlign: 'right', fontSize: 11, color: '#8aab96', margin: '7px 0 16px', cursor: 'pointer', fontFamily: 'sans-serif' }}>
                Forgot Password?
              </p>
              <GreenBtn onClick={() => router.push('/')}>Login →</GreenBtn>
              <p style={{ textAlign: 'center', fontSize: 12.5, color: '#555', margin: '12px 0 0', fontFamily: 'sans-serif' }}>
                Don't have an account?{' '}
                <button type="button" onClick={() => flip(true)}
                  style={{ color: '#2d5a45', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: 12.5, fontFamily: 'sans-serif' }}>
                  Register Now
                </button>
              </p>
              <p style={{ textAlign: 'center', fontSize: 10, color: '#c0d8ca', margin: '12px 0 0', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'sans-serif' }}>
                Terms and Services
              </p>
              <p style={{ textAlign: 'center', fontSize: 8.5, color: '#c0d8ca', margin: '8px 0 0', fontFamily: 'sans-serif' }}>
                © 2025 KrishiMitra · Odisha
              </p>
            </div>
          </div>

          {/* BACK: mid-flip (image side — pure translucent, no green layer) */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'transparent',
            }}
          />
        </div>

      </div>
    </div>
  )
}

function GreenBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button" onClick={onClick}
      style={{ width: '100%', padding: '12px', background: '#2d5a45', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'sans-serif', letterSpacing: '0.02em', transition: 'background 0.2s' }}
      onMouseOver={e => (e.currentTarget.style.background = '#1e4a34')}
      onMouseOut={e => (e.currentTarget.style.background = '#2d5a45')}
    >
      {children}
    </button>
  )
}

function FormField({ id, label, type, placeholder }: { id: string; label: string; type: string; placeholder: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label htmlFor={id} style={{ fontSize: 12, fontWeight: 600, color: '#3a5a48', fontFamily: 'sans-serif' }}>{label}</label>
      <input
        id={id} type={type} placeholder={placeholder}
        style={{ width: '100%', padding: '9px 13px', border: 'none', borderRadius: 8, fontSize: 13, background: '#2e2e2e', color: '#eee', boxSizing: 'border-box', outline: 'none', fontFamily: 'sans-serif' }}
        onFocus={e => (e.target.style.boxShadow = '0 0 0 2px rgba(45,90,69,0.5)')}
        onBlur={e => (e.target.style.boxShadow = 'none')}
      />
    </div>
  )
}