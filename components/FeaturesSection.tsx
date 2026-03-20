'use client'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'

function useScrollBothWays(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

const FEATURES = [
  {
    number: '01',
    tag: 'AI POWERED',
    title: 'Livestock Health Monitor',
    desc: "Upload a photo of your animal and get an instant diagnosis with treatment advice in Odia — before it's too late. Works even in low-connectivity areas.",
    accent: '#b5f02a',
    icon: '🐄',
    href: '/livestock',
    image: '/cow.png',
    imgHeight: 220,
    // warm terracotta → deep forest
    darkBg: `
      radial-gradient(ellipse at 68% 48%, #4a2010 0%, transparent 58%),
      radial-gradient(ellipse at 14% 82%, #2a1408 0%, transparent 52%),
      linear-gradient(152deg, #1a0a04 0%, #2d1208 45%, #5a2410 100%)
    `,
    lightBg:
      'linear-gradient(135deg, #f5ede0 0%, #eeddd0 35%, #e8d8c8 65%, #f0e6d8 100%)',
  },
  {
    number: '02',
    tag: 'AI POWERED',
    title: 'Crop Doctor',
    desc: 'Photo of a diseased leaf? Identify the disease instantly and get step-by-step treatment — works offline too. Supports all major Odisha crops.',
    accent: '#b5f02a',
    icon: '🌾',
    href: '/crop',
    image: 'leaf.png',
    imgHeight: 220,
    // deep olive → sage
    darkBg: `
      radial-gradient(ellipse at 68% 48%, #2a3d10 0%, transparent 58%),
      radial-gradient(ellipse at 14% 82%, #162208 0%, transparent 52%),
      linear-gradient(152deg, #080f04 0%, #142010 45%, #243818 100%)
    `,
    lightBg:
      'linear-gradient(135deg, #eaedd8 0%, #dde8ce 35%, #d4e0c4 65%, #e2ead4 100%)',
  },
  {
    number: '03',
    tag: 'COMING SOON',
    title: 'Market Price Alerts',
    desc: 'Daily mandi price updates so you know the best time to sell. Never lose money to bad timing again. Get alerts via SMS in Odia.',
    accent: '#b5f02a',
    icon: '📈',
    href: '#',
    image: 'graph.png',
    imgHeight: 265,
    // dusty slate → warm stone
    darkBg: `
      radial-gradient(ellipse at 68% 48%, #1e2a38 0%, transparent 58%),
      radial-gradient(ellipse at 14% 82%, #101820 0%, transparent 52%),
      linear-gradient(152deg, #060c12 0%, #0e1820 45%, #1a2a38 100%)
    `,
    lightBg:
      'linear-gradient(135deg, #e8eaee 0%, #dde0e8 35%, #d8dce8 65%, #e4e6ee 100%)',
  },
  {
    number: '04',
    tag: 'COMING SOON',
    title: 'Mind Pulse',
    desc: "Silent mental wellness check through how you type. No forms, no questions, no stigma. Built with care for the farmer's invisible burdens.",
    accent: '#b5f02a',
    icon: '🧠',
    href: '#',
    image: 'brain.png',
    imgHeight: 220,
    // warm plum → nude blush
    darkBg: `
      radial-gradient(ellipse at 68% 48%, #3a1828 0%, transparent 58%),
      radial-gradient(ellipse at 14% 82%, #200e18 0%, transparent 52%),
      linear-gradient(152deg, #0e0608 0%, #1e0e18 45%, #341828 100%)
    `,
    lightBg:
      'linear-gradient(135deg, #f0e8e8 0%, #ead8d8 35%, #e4d0d4 65%, #ecdcd8 100%)',
  },
]

function FeatureRow({
  feat,
  index,
}: {
  feat: (typeof FEATURES)[0]
  index: number
}) {
  const { ref, visible } = useScrollBothWays(0.1)
  const [imgErr, setImgErr] = useState(false)
  const [hovered, setHovered] = useState(false)
  const isEven = index % 2 === 0

  return (
    <>
      <style>{`
        @keyframes orb-drift-${index} {
          0%,100% { transform: translate(0,0); }
          40%     { transform: translate(8px,-6px); }
          70%     { transform: translate(-5px,8px); }
        }
        @keyframes ring-pulse-${index} {
          0%,100% { transform: scale(0.9); opacity: 0.4; }
          50%     { transform: scale(1.1); opacity: 0.1; }
        }
        @keyframes scanline-${index} {
          0%   { top: 0%; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes dot-flicker-${index} {
          0%,88%,90%,95%,100% { opacity: 1; }
          89% { opacity: 0.2; }
          94% { opacity: 0.5; }
        }

        .row-wrap-${index} {
          transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }
        .row-wrap-${index}.in  { opacity:1; transform:translateY(0) scale(1); }
        .row-wrap-${index}.out { opacity:0; transform:translateY(52px) scale(0.97); }

        .vis-panel-${index} {
          transition: opacity 0.7s 0.05s ease, transform 0.7s 0.05s cubic-bezier(0.22,1,0.36,1);
        }
        .vis-panel-${index}.in  { opacity:1; transform:perspective(900px) rotateY(0deg) translateX(0); }
        .vis-panel-${index}.out { opacity:0; transform:perspective(900px) rotateY(${isEven ? '-12deg' : '12deg'}) translateX(${isEven ? '-20px' : '20px'}); }

        .info-panel-${index} {
          transition: opacity 0.7s 0.15s ease, transform 0.7s 0.15s cubic-bezier(0.22,1,0.36,1);
        }
        .info-panel-${index}.in  { opacity:1; transform:perspective(900px) rotateY(0deg) translateX(0); }
        .info-panel-${index}.out { opacity:0; transform:perspective(900px) rotateY(${isEven ? '10deg' : '-10deg'}) translateX(${isEven ? '16px' : '-16px'}); }

        .feat-hover-${index} {
          transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease;
        }
        .feat-hover-${index}:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 50px rgba(13,26,13,0.14) !important;
        }

        .cta-${index} {
          position:relative; overflow:hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .cta-${index}::before {
          content:''; position:absolute; top:0; left:-100%; width:100%; height:100%;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);
          transition: left 0.35s ease;
        }
        .cta-${index}:hover::before { left:100%; }
        .cta-${index}:hover { transform:translateY(-2px); box-shadow:0 6px 18px rgba(181,240,42,0.3); background:#c8ff3a !important; }
      `}</style>

      <div
        ref={ref}
        className={`feat-hover-${index} row-wrap-${index} ${visible ? 'in' : 'out'}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'grid',
          gridTemplateColumns: isEven ? '1fr 360px' : '360px 1fr',
          minHeight: 360,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid rgba(13,26,13,0.09)',
          boxShadow: '0 2px 18px rgba(13,26,13,0.06)',
        }}
      >
        {/* ══ DARK VISUAL PANEL ══ */}
        <div
          className={`vis-panel-${index} ${visible ? 'in' : 'out'}`}
          style={{
            order: isEven ? 0 : 1,
            background: feat.darkBg,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* grid */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              backgroundImage: `linear-gradient(rgba(181,240,42,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(181,240,42,0.04) 1px,transparent 1px)`,
              backgroundSize: '44px 44px',
              maskImage:
                'radial-gradient(ellipse at 58% 50%,black 18%,transparent 72%)',
            }}
          />

          {/* shine streak */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background:
                'linear-gradient(108deg, transparent 30%, rgba(255,255,255,0.04) 48%, rgba(255,255,255,0.07) 52%, transparent 68%)',
            }}
          />

          {/* orb */}
          <div
            style={{
              position: 'absolute',
              top: '18%',
              right: '11%',
              width: 120,
              height: 120,
              borderRadius: '50%',
              background:
                'radial-gradient(circle,rgba(181,240,42,0.18) 0%,transparent 70%)',
              animation: visible
                ? `orb-drift-${index} ${9 + index}s ease-in-out infinite`
                : 'none',
              pointerEvents: 'none',
            }}
          />

          {/* ring */}
          <div
            style={{
              position: 'absolute',
              top: 'calc(18% - 20px)',
              right: 'calc(11% - 20px)',
              width: 160,
              height: 160,
              borderRadius: '50%',
              border: '1px solid rgba(181,240,42,0.18)',
              animation: visible
                ? `ring-pulse-${index} 3.5s ease-in-out infinite`
                : 'none',
              pointerEvents: 'none',
            }}
          />

          {/* scan line */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: 1,
              background:
                'linear-gradient(90deg,transparent,rgba(181,240,42,0.3),transparent)',
              animation: visible
                ? `scanline-${index} 7s ease-in-out infinite ${index * 1.8}s`
                : 'none',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />

          {/* top bar */}
          <div
            style={{
              position: 'relative',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 28px 16px',
              borderBottom: '1px solid rgba(181,240,42,0.09)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#b5f02a',
                  boxShadow: '0 0 8px #b5f02a',
                  animation: visible
                    ? `dot-flicker-${index} 4.5s ease-in-out infinite ${index * 0.6}s`
                    : 'none',
                }}
              />
              <span
                style={{
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#b5f02a',
                  opacity: 0.75,
                  fontFamily: 'monospace',
                }}
              >
                {feat.number} / {feat.tag}
              </span>
            </div>
            <span
              style={{
                fontSize: '1.6rem',
                lineHeight: 1,
                filter: 'drop-shadow(0 0 8px rgba(181,240,42,0.5))',
              }}
            >
              {feat.icon}
            </span>
          </div>

          {/* body */}
          <div
            style={{
              position: 'relative',
              zIndex: 3,
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              padding: '24px 28px',
              gap: 20,
            }}
          >
            <div
              style={{
                flex: '0 0 45%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {!imgErr ? (
                <img
                  src={feat.image}
                  alt={feat.title}
                  onError={() => setImgErr(true)}
                  style={{
                    width: '100%',
                    maxHeight: feat.imgHeight,
                    objectFit: 'contain',
                    filter:
                      'drop-shadow(0 0 26px rgba(181,240,42,0.45)) drop-shadow(0 6px 14px rgba(0,0,0,0.5))',
                    transform: hovered
                      ? 'scale(1.05) translateY(-4px)'
                      : 'scale(1) translateY(0)',
                    transition: 'transform 0.55s cubic-bezier(0.22,1,0.36,1)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: 150,
                    border: '1px dashed rgba(181,240,42,0.25)',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(181,240,42,0.04)',
                  }}
                >
                  <span style={{ fontSize: '2.5rem', opacity: 0.2 }}>
                    {feat.icon}
                  </span>
                </div>
              )}
            </div>
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <h3
                style={{
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: 'clamp(1.6rem,2.8vw,2.5rem)',
                  lineHeight: 0.95,
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                  color: '#f4f4f0',
                  textShadow: '0 0 28px rgba(181,240,42,0.25)',
                }}
              >
                {feat.title}
              </h3>
              <div
                style={{
                  width: hovered ? '72%' : '32%',
                  height: 1,
                  background:
                    'linear-gradient(90deg,rgba(181,240,42,0.7),transparent)',
                  transition: 'width 0.55s cubic-bezier(0.22,1,0.36,1)',
                }}
              />
              <span
                style={{
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: '3.5rem',
                  lineHeight: 1,
                  color: 'rgba(181,240,42,0.07)',
                  letterSpacing: '-0.02em',
                  userSelect: 'none',
                  marginTop: -2,
                }}
              >
                {feat.number}
              </span>
            </div>
          </div>

          {/* corner */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 0,
              height: 0,
              borderLeft: '44px solid transparent',
              borderBottom: '44px solid rgba(181,240,42,0.12)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* ══ LIGHT INFO PANEL ══ */}
        <div
          className={`info-panel-${index} ${visible ? 'in' : 'out'}`}
          style={{
            order: isEven ? 1 : 0,
            background: feat.lightBg,
            padding: '36px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderLeft: isEven ? '1px solid rgba(13,26,13,0.08)' : 'none',
            borderRight: isEven ? 'none' : '1px solid rgba(13,26,13,0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* shine overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background:
                'linear-gradient(125deg, rgba(255,255,255,0.18) 0%, transparent 45%, rgba(255,255,255,0.08) 100%)',
            }}
          />

          {/* top accent */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '8%',
              right: '8%',
              height: 2,
              background:
                'linear-gradient(90deg,transparent,rgba(181,240,42,0.7),transparent)',
              pointerEvents: 'none',
            }}
          />

          {/* vertical rule */}
          <div
            style={{
              position: 'absolute',
              top: '18%',
              bottom: '18%',
              [isEven ? 'left' : 'right']: 0,
              width: 2,
              background:
                'linear-gradient(180deg,transparent,rgba(181,240,42,0.55),transparent)',
              pointerEvents: 'none',
            }}
          />

          {/* subtle dot pattern */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              backgroundImage:
                'radial-gradient(circle, rgba(13,26,13,0.06) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
              maskImage:
                'radial-gradient(ellipse at 80% 80%, black 10%, transparent 65%)',
            }}
          />

          {/* top */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  height: 22,
                  width: 3,
                  background:
                    'linear-gradient(180deg,#b5f02a,rgba(181,240,42,0.3))',
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontFamily: 'monospace',
                  padding: '3px 10px',
                  borderRadius: 3,
                  background:
                    feat.tag === 'AI POWERED' ? '#b5f02a' : 'transparent',
                  color: feat.tag === 'AI POWERED' ? '#0d1a0d' : '#3d5a1a',
                  border: `1px solid ${feat.tag === 'AI POWERED' ? '#b5f02a' : 'rgba(13,26,13,0.22)'}`,
                }}
              >
                {feat.tag}
              </span>
              <span
                style={{
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: '0.8rem',
                  color: 'rgba(13,26,13,0.18)',
                  letterSpacing: '0.1em',
                }}
              >
                {feat.number}
              </span>
            </div>

            <p
              style={{
                fontSize: '0.88rem',
                color: 'rgba(26,46,16,0.58)',
                lineHeight: 1.88,
                fontWeight: 400,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              {feat.desc}
            </p>
          </div>

          {/* bottom */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {FEATURES.map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 2,
                    width: i === index ? 26 : 6,
                    borderRadius: 2,
                    background: i === index ? '#b5f02a' : 'rgba(13,26,13,0.14)',
                    transition: 'width 0.3s ease',
                    boxShadow:
                      i === index ? '0 0 5px rgba(181,240,42,0.5)' : 'none',
                  }}
                />
              ))}
              <span
                style={{
                  fontSize: '0.52rem',
                  color: 'rgba(13,26,13,0.22)',
                  letterSpacing: '0.1em',
                  marginLeft: 4,
                  fontFamily: 'monospace',
                }}
              >
                {feat.number}/{FEATURES.length.toString().padStart(2, '0')}
              </span>
            </div>

            <Link
              href={feat.href}
              className={`cta-${index}`}
              style={{
                alignSelf: 'flex-start',
                padding: '10px 24px',
                background:
                  feat.tag === 'AI POWERED' ? '#b5f02a' : 'transparent',
                color: feat.tag === 'AI POWERED' ? '#0d1a0d' : '#1a3d10',
                border: `1.5px solid ${feat.tag === 'AI POWERED' ? '#b5f02a' : 'rgba(13,26,13,0.35)'}`,
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: 2,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              {feat.tag === 'AI POWERED' ? 'Try Now' : 'Notify Me'}
              <span
                style={{
                  display: 'inline-block',
                  transform: hovered ? 'translateX(4px)' : 'translateX(0)',
                  transition: 'transform 0.3s ease',
                }}
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default function FeaturesSection() {
  const { ref: headRef, visible: headVisible } = useScrollBothWays(0.1)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      <section
        style={{
          padding: '96px 48px',
          background: '#232E19',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div
          ref={headRef}
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 36,
            opacity: headVisible ? 1 : 0,
            transform: headVisible ? 'translateY(0)' : 'translateY(22px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '0.58rem',
                fontWeight: 700,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: '#ADE21A',
                fontFamily: 'monospace',
                marginBottom: 10,
              }}
            >
              — 04 FEATURES
            </p>
            <h2
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 'clamp(2.2rem,5vw,4.5rem)',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                color: '#ADE21A',
                lineHeight: 0.95,
              }}
            >
              Four Tools,
              <br />
              <span style={{ color: 'rgba(13,26,13,0.25)' }}>One Mission</span>
            </h2>
          </div>
          <p
            style={{
              fontSize: '0.65rem',
              color: 'rgba(13,26,13,0.38)',
              letterSpacing: '0.06em',
              lineHeight: 1.9,
              fontFamily: "'DM Sans',sans-serif",
              maxWidth: 200,
              textAlign: 'right',
            }}
          >
            Built for Odisha farmers.
            <br />
            Works offline. Speaks Odia.
          </p>
        </div>

        {FEATURES.map((feat, i) => (
          <FeatureRow key={feat.number} feat={feat} index={i} />
        ))}
      </section>
    </>
  )
}
