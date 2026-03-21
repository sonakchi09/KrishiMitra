'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

// ─────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────
interface MandiRecord {
  district: string
  market: string
  commodity: string
  variety: string
  arrival_date: string
  min_price: string
  max_price: string
  modal_price: string
}

interface SavedAlert {
  cropApi: string
  cropHindi: string
  cropEmoji: string
  district: string
  phone: string
  lastPrice: number
  lastDate: string
}

// ─────────────────────────────────────────────────────
// CROPS
// ─────────────────────────────────────────────────────
const CROPS = [
  { emoji: '🌾', odia: 'ଧାନ', hindi: 'Dhan', api: 'Paddy' },
  { emoji: '🍚', odia: 'ଚାଉଳ', hindi: 'Chawal', api: 'Rice' },
  { emoji: '🥔', odia: 'ଆଳୁ', hindi: 'Aloo', api: 'Potato' },
  { emoji: '🍅', odia: 'ଟମାଟ', hindi: 'Tamatar', api: 'Tomato' },
  { emoji: '🧅', odia: 'ପିଆଜ', hindi: 'Pyaaz', api: 'Onion' },
  { emoji: '🌽', odia: 'ମକା', hindi: 'Makka', api: 'Maize' },
  { emoji: '🌶', odia: 'ଲଙ୍କା', hindi: 'Mirchi', api: 'Green Chilli' },
  { emoji: '🍆', odia: 'ବାଇଗଣ', hindi: 'Baingan', api: 'Brinjal' },
  { emoji: '🥦', odia: 'ଫୁଲକୋବି', hindi: 'Gobhi', api: 'Cauliflower' },
  { emoji: '🥜', odia: 'ଚିନାବାଦାମ', hindi: 'Moongfali', api: 'Groundnut' },
  { emoji: '🌿', odia: 'ସୋରିଷ', hindi: 'Sarson', api: 'Mustard' },
  { emoji: '🍌', odia: 'କଦଳୀ', hindi: 'Kela', api: 'Banana' },
  { emoji: '🥭', odia: 'ଆମ୍ବ', hindi: 'Aam', api: 'Mango' },
]

// ─────────────────────────────────────────────────────
// UNITS — what a farmer actually sells
// ─────────────────────────────────────────────────────
const UNITS = [
  { label: '250 gm', kg: 0.25 },
  { label: '500 gm', kg: 0.5 },
  { label: '1 Kilo', kg: 1 },
  { label: '2 Kilo', kg: 2 },
  { label: '5 Kilo', kg: 5 },
  { label: '10 Kilo', kg: 10 },
  { label: '20 Kilo', kg: 20 },
  { label: '50 Kilo', kg: 50 },
  { label: '1 Quintal (100 kg)', kg: 100 },
]
const DEFAULT_UNIT_IDX = 2 // 1 Kilo by default

const DISTRICTS = [
  { name: 'Cuttack', icon: '🏙️', tag: 'Major Mandi' },
  { name: 'Puri', icon: '🛕', tag: 'Coastal' },
  { name: 'Bhubaneswar', icon: '🌆', tag: 'Capital City' },
  { name: 'Sambalpur', icon: '🌊', tag: 'Western Hub' },
  { name: 'Berhampur', icon: '🏪', tag: 'South Hub' },
  { name: 'Balasore', icon: '🌾', tag: 'North Coast' },
  { name: 'Bhadrak', icon: '🌿', tag: 'River Belt' },
  { name: 'Koraput', icon: '⛰️', tag: 'Tribal Belt' },
  { name: 'Rayagada', icon: '🌄', tag: 'Hill District' },
  { name: 'Ganjam', icon: '🏝️', tag: 'South Coast' },
  { name: 'Kendrapara', icon: '🦀', tag: 'Delta Region' },
  { name: 'Jajpur', icon: '🏭', tag: 'Industrial' },
  { name: 'Dhenkanal', icon: '🌳', tag: 'Central' },
  { name: 'Keonjhar', icon: '⛏️', tag: 'Mining Belt' },
  { name: 'Angul', icon: '🔥', tag: 'Industrial' },
  { name: 'Sundargarh', icon: '🏔️', tag: 'Northern' },
  { name: 'Mayurbhanj', icon: '🐯', tag: 'Forest Belt' },
  { name: 'Bargarh', icon: '🌾', tag: 'Rice Bowl' },
  { name: 'Bolangir', icon: '🌻', tag: 'Western' },
]

// ─────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────
function priceForUnit(perQuintal: number, kg: number): string {
  const val = (perQuintal / 100) * kg
  if (val < 1) return `${(val * 100).toFixed(0)} paise`
  return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 1 })}`
}

function rawPriceForUnit(perQuintal: number, kg: number): number {
  return (perQuintal / 100) * kg
}

function getAdvice(modal: number, allPrices: number[]) {
  if (allPrices.length < 2)
    return {
      emoji: '🟡',
      color: '#d97706',
      bg: '#fef3c7',
      text: 'Thoda Ruko',
      sub: 'Aur mandis ka data nahi mila. Kal dobara check karo.',
    }
  const max = Math.max(...allPrices)
  const min = Math.min(...allPrices)
  const pct = (modal - min) / (max - min || 1)
  if (pct >= 0.65)
    return {
      emoji: '🟢',
      color: '#16a34a',
      bg: '#dcfce7',
      text: 'ABHI BECHO!',
      sub: 'Aaj bhav bahut achha hai. Jaldi karo.',
    }
  if (pct >= 0.35)
    return {
      emoji: '🟡',
      color: '#d97706',
      bg: '#fef3c7',
      text: 'Thoda Ruko',
      sub: 'Bhav theek hai, par aur upar ja sakta hai.',
    }
  return {
    emoji: '🔴',
    color: '#dc2626',
    bg: '#fee2e2',
    text: 'MAT BECHO',
    sub: 'Bhav abhi bahut kam hai. Ruko.',
  }
}

function buildWAMsg(
  crop: (typeof CROPS)[0],
  district: string,
  best: MandiRecord,
  unitLabel: string,
  unitPrice: string,
  advice: ReturnType<typeof getAdvice>,
): string {
  return (
    `🌾 *KrishiMitra — Aaj ka Mandi Bhav*\n\n` +
    `Fasal: ${crop.emoji} ${crop.hindi} (${crop.odia})\n` +
    `District: 📍 ${district}\n` +
    `Mandi: 🏪 ${best.market}\n\n` +
    `💰 *${unitLabel} ka bhav: ${unitPrice}*\n` +
    `📦 1 Quintal (100kg): ₹${parseFloat(best.modal_price).toLocaleString('en-IN')}\n\n` +
    `${advice.emoji} *${advice.text}*\n${advice.sub}\n\n` +
    `📅 ${best.arrival_date} | Agmarknet data\n` +
    `_KrishiMitra app se bheja gaya_`
  )
}

// ─────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────
type Step = 'crop' | 'district' | 'loading' | 'result' | 'alert_setup' | 'error'

export default function MarketPricePage() {
  const [step, setStep] = useState<Step>('crop')
  const [crop, setCrop] = useState<(typeof CROPS)[0] | null>(null)
  const [district, setDistrict] = useState('')
  const [records, setRecords] = useState<MandiRecord[]>([])
  const [errMsg, setErrMsg] = useState('')
  const [unitIdx, setUnitIdx] = useState(DEFAULT_UNIT_IDX)
  const [phone, setPhone] = useState('')
  const [alertSaved, setAlertSaved] = useState(false)
  const [savedAlerts, setSavedAlerts] = useState<SavedAlert[]>([])
  const checkRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    try {
      const s = localStorage.getItem('km_alerts')
      if (s) setSavedAlerts(JSON.parse(s))
    } catch {}
  }, [])

  const fetchPrices = useCallback(
    async (c: (typeof CROPS)[0], dist: string) => {
      setStep('loading')
      setRecords([])

      const key = process.env.NEXT_PUBLIC_DATAGOV_API_KEY
      if (!key) {
        setErrMsg('no_key')
        setStep('error')
        return
      }

      try {
        const params = new URLSearchParams({
          'api-key': key,
          format: 'json',
          limit: '50',
          filters: JSON.stringify({
            State: 'Odisha',
            Commodity: c.api,
            District: dist,
          }),
        })

        const res = await fetch(
          `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?${params}`,
        )
        if (res.status === 403) { setErrMsg('bad_key'); setStep('error'); return }
        if (!res.ok) { setErrMsg('server'); setStep('error'); return }

        const data = await res.json()
        const recs: MandiRecord[] = data.records ?? []
        if (!recs.length) { setErrMsg('no_data'); setStep('error'); return }

        recs.sort((a, b) => parseFloat(b.modal_price) - parseFloat(a.modal_price))
        setRecords(recs)
        setStep('result')
      } catch {
        setErrMsg('network')
        setStep('error')
      }
    },
    [],
  )

  function saveAlert() {
    if (!crop || !phone.trim() || phone.length < 10) return
    const best = records[0]
    const alert: SavedAlert = {
      cropApi: crop.api,
      cropHindi: crop.hindi,
      cropEmoji: crop.emoji,
      district,
      phone: phone.trim(),
      lastPrice: parseFloat(best.modal_price),
      lastDate: best.arrival_date,
    }
    const updated = [
      alert,
      ...savedAlerts.filter(
        (a) => !(a.cropApi === crop.api && a.district === district),
      ),
    ]
    setSavedAlerts(updated)
    try { localStorage.setItem('km_alerts', JSON.stringify(updated)) } catch {}
    setAlertSaved(true)
  }

  useEffect(() => {
    if (savedAlerts.length === 0) return
    const key = process.env.NEXT_PUBLIC_DATAGOV_API_KEY
    if (!key) return

    async function checkPrices() {
      for (const alert of savedAlerts) {
        try {
          const params = new URLSearchParams({
            'api-key': key!,
            format: 'json',
            limit: '5',
            filters: JSON.stringify({ State: 'Odisha', Commodity: alert.cropApi, District: alert.district }),
          })
          const res = await fetch(
            `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?${params}`,
          )
          if (!res.ok) continue
          const data = await res.json()
          const recs: MandiRecord[] = data.records ?? []
          if (!recs.length) continue
          recs.sort((a, b) => parseFloat(b.modal_price) - parseFloat(a.modal_price))
          const newPrice = parseFloat(recs[0].modal_price)
          const changePct = Math.abs((newPrice - alert.lastPrice) / alert.lastPrice) * 100
          if (changePct >= 5) {
            const direction = newPrice > alert.lastPrice ? 'BADH GAYA ↑' : 'GIRA GAYA ↓'
            const waMsg = encodeURIComponent(
              `🚨 *KrishiMitra Price Alert!*\n\n` +
              `${alert.cropEmoji} *${alert.cropHindi}* ka bhav ${direction}!\n\n` +
              `📍 District: ${alert.district}\n🏪 Mandi: ${recs[0].market}\n\n` +
              `Pehle ka bhav: ₹${alert.lastPrice.toLocaleString('en-IN')}/qtl\n` +
              `*Aaj ka bhav: ₹${newPrice.toLocaleString('en-IN')}/qtl*\n` +
              `Badlaav: ${changePct.toFixed(1)}%\n\n📅 ${recs[0].arrival_date}\n_KrishiMitra app se auto-alert_`,
            )
            window.open(`https://wa.me/91${alert.phone}?text=${waMsg}`, '_blank')
            const updated = savedAlerts.map((a) =>
              a.cropApi === alert.cropApi && a.district === alert.district
                ? { ...a, lastPrice: newPrice, lastDate: recs[0].arrival_date }
                : a,
            )
            setSavedAlerts(updated)
            try { localStorage.setItem('km_alerts', JSON.stringify(updated)) } catch {}
          }
        } catch {}
      }
    }

    checkPrices()
    checkRef.current = setInterval(checkPrices, 6 * 60 * 60 * 1000)
    return () => { if (checkRef.current) clearInterval(checkRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedAlerts.length])

  function reset() {
    setStep('crop')
    setCrop(null)
    setDistrict('')
    setRecords([])
    setErrMsg('')
    setAlertSaved(false)
    setPhone('')
  }

  const best = records[0] ?? null
  const allModal = records.map((r) => parseFloat(r.modal_price))
  const advice = best ? getAdvice(parseFloat(best.modal_price), allModal) : null
  const unitObj = UNITS[unitIdx]
  const unitPrice = best ? priceForUnit(parseFloat(best.modal_price), unitObj.kg) : ''

  // ─────────────────────────────────────────────────
  return (
    <div style={S.pageWrap}>
      {/* ─── BACKGROUND ─── */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: "url('/market.jpg')",
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      />
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(20,35,18,0.62) 0%, rgba(20,35,18,0.45) 55%, transparent 75%)',
        }}
      />
      <svg
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
        viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M-10 600 Q130 515 315 555 Q480 590 600 528 Q722 466 885 528 Q1025 585 1162 522 Q1298 460 1450 510 L1450 920 L-10 920 Z" fill="#ede4d3" />
        <path d="M-10 658 Q162 585 372 622 Q552 654 718 592 Q888 528 1072 598 Q1242 656 1450 604 L1450 920 L-10 920 Z" fill="#f5ede0" opacity="0.65" />
      </svg>

      {/* ══ TOP BAR — CurvedLoop replaces the static title ══ */}
      <div style={S.topBar}>
        {step !== 'crop' ? (
          <button style={S.backBtn} onClick={reset}>← Wapas</button>
        ) : (
          <div style={{ width: 80, flexShrink: 0 }} />
        )}

        {/* ── CSS ticker — always visible inside the 50px orange bar ── */}
        <div style={S.topMarqueeWrap}>
          <div style={S.tickerTrack}>
            {[0, 1].map((n) => (
              <span key={n} style={S.tickerText} aria-hidden={n === 1}>
                📈 MANDI BHAV &nbsp;•&nbsp; AAJ KA BHAV &nbsp;•&nbsp; ODISHA MANDIS &nbsp;•&nbsp; LIVE AGMARKNET DATA &nbsp;•&nbsp; BECHO YA RUKO &nbsp;•&nbsp; 19 DISTRICTS &nbsp;•&nbsp; 13 FASLEN &nbsp;•&nbsp;&nbsp;
              </span>
            ))}
          </div>
        </div>

        <div style={{ width: 80, flexShrink: 0 }} />
      </div>

      {/* ══ STEP 1: CROP ══ */}
      {step === 'crop' && (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={S.heroSplit}>
            <div style={S.heroLeft}>
              <span style={S.heroBadge}>📡 Live · Agmarknet Data</span>
              <h1 style={S.heroTitle}>
                Aaj ka<br />
                <span style={S.heroAccent}>Mandi Bhav</span>
              </h1>
              <p style={S.heroDesc}>
                Apni fasal chuniye — real-time price aur{' '}
                <strong style={{ color: '#f4a261' }}>"Becho ya Ruko"</strong>{' '}
                advice paiye. Bilkul free 🙏
              </p>
              <div style={S.pillRow}>
                <span style={S.heroPill}>🏪 19 Districts</span>
                <span style={S.heroPill}>🌾 13 Crops</span>
                <span style={S.heroPill}>✅ Daily Update</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#FF6B00', fontFamily: 'Georgia, serif', marginBottom: '8px' }}>
              🌿 Apni Fasal Chuniye
            </h2>
            <p style={{ fontSize: '14px', color: '#555', fontFamily: 'Georgia, serif' }}>
              Tap karke price dekho
            </p>
          </div>

          <div style={S.cropGridFull}>
            {CROPS.map((c, i) => (
              <button
                key={c.api}
                style={{ ...S.cropCardFull, animationDelay: `${i * 0.04}s` }}
                onClick={() => { setCrop(c); setStep('district') }}
              >
                <span style={S.cropArrowNew}>›</span>
                <span style={S.cropEmojiNew}>{c.emoji}</span>
                <span style={S.cropHindiNew}>{c.hindi}</span>
                <span style={S.cropOdiaNew}>{c.odia}</span>
              </button>
            ))}
          </div>

          {/* ── Bottom tip — NO CurvedLoop here anymore ── */}
          <div style={S.bottomTip}>
            💡 Bechne se pehle local vyapari se bhi poochho — ye wholesale mandi ka daam hai.
          </div>
        </div>
      )}

      {/* ══ STEP 2: DISTRICT ══ */}
      {step === 'district' && crop && (
        <div style={{ position: 'relative', zIndex: 1, paddingBottom: '2rem' }}>
          <div style={S.distHeader}>
            <span style={S.distCropBadge}>{crop.emoji} {crop.hindi} selected</span>
            <h1 style={S.distTitle}>Apna District Chuniye</h1>
            <p style={S.distSubtitle}>19 districts · Tap to see today's price</p>
          </div>
          <div style={S.distGrid}>
            {DISTRICTS.map((d, i) => (
              <button
                key={d.name}
                style={{ ...S.distCard, animationDelay: `${i * 0.03}s` }}
                onClick={() => { setDistrict(d.name); fetchPrices(crop, d.name) }}
              >
                <span style={S.distCardIcon}>{d.icon}</span>
                <span style={S.distCardName}>{d.name}</span>
                <span style={S.distCardTag}>{d.tag}</span>
                <span style={S.distCardArrow}>→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ LOADING ══ */}
      {step === 'loading' && (
        <div style={S.centered}>
          <div style={S.spinner} />
          <p style={{ fontWeight: 700, color: '#1b4332', fontSize: '1.1rem', margin: 0 }}>
            Mandi se bhav aa raha hai…
          </p>
          <p style={{ color: '#6b7c6b', margin: 0 }}>Thoda ruko 🙏</p>
        </div>
      )}

      {/* ══ ERROR ══ */}
      {step === 'error' && (
        <div style={S.container}>
          <div style={S.errorCard}>
            {errMsg === 'no_key' && (
              <>
                <div style={S.errIcon}>🔑</div>
                <p style={S.errT}>API Key chahiye</p>
                <p style={S.errB}>.env mein<br /><strong>NEXT_PUBLIC_DATAGOV_API_KEY</strong><br />set karo</p>
                <a href="https://data.gov.in/user/register" target="_blank" rel="noopener noreferrer" style={S.greenBtn}>Free Key Lo 👉</a>
              </>
            )}
            {errMsg === 'bad_key' && (<><div style={S.errIcon}>⚠️</div><p style={S.errT}>API Key Galat Hai</p><p style={S.errB}>.env file mein sahi key daalo</p></>)}
            {errMsg === 'no_data' && (<><div style={S.errIcon}>😕</div><p style={S.errT}>Data Nahi Mila</p><p style={S.errB}>{crop?.hindi} ka {district} mein aaj data nahi aaya.<br />Kal dobara check karo.</p></>)}
            {(errMsg === 'network' || errMsg === 'server') && (<><div style={S.errIcon}>📡</div><p style={S.errT}>Internet Error</p><p style={S.errB}>Internet check karo aur dobara try karo.</p></>)}
            <button style={S.outlineBtn} onClick={reset}>↩ Wapas Jao</button>
          </div>
        </div>
      )}

      {/* ══ RESULT ══ */}
      {step === 'result' && best && crop && advice && (
        <div style={S.resultPage}>
          <div style={{ ...S.rAdvice, background: advice.color }}>
            <span style={{ fontSize: '3rem', lineHeight: 1, flexShrink: 0 }}>{advice.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={S.rAdviceTitle}>{advice.text}</div>
              <div style={S.rAdviceSub}>{advice.sub}</div>
            </div>
            <div style={{ flexShrink: 0, textAlign: 'right' as const }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>📅 {best.arrival_date}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.2rem' }}>📍 {district}</div>
            </div>
          </div>

          <div style={S.resultGrid}>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1rem' }}>
              <div style={S.rHeroPrice}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(1px 3px 6px rgba(0,0,0,0.15))' }}>{crop.emoji}</span>
                  <div>
                    <div style={S.rCropName}>{crop.hindi} <span style={{ fontWeight: 500, color: '#6b7c6b', fontSize: '0.9rem' }}>({crop.odia})</span></div>
                    <div style={S.rCropLoc}>🏪 {best.market}</div>
                  </div>
                </div>
                <div style={S.rPriceRow}>
                  <div style={{ ...S.rPriceBox, borderTop: '4px solid #ef4444' }}>
                    <div style={S.rPriceBoxLabel}>⬇ Kam</div>
                    <div style={{ ...S.rPriceVal, color: '#dc2626' }}>{priceForUnit(parseFloat(best.min_price), unitObj.kg)}</div>
                    <div style={S.rPriceUnit}>{unitObj.label}</div>
                  </div>
                  <div style={{ ...S.rPriceBox, borderTop: '4px solid #16a34a', background: '#f0faf4', boxShadow: '0 4px 16px rgba(22,163,74,0.15)' }}>
                    <div style={S.rPriceBoxLabel}>✅ Aaj ka</div>
                    <div style={{ ...S.rPriceVal, color: '#16a34a', fontSize: '1.9rem' }}>{unitPrice}</div>
                    <div style={S.rPriceUnit}>{unitObj.label}</div>
                  </div>
                  <div style={{ ...S.rPriceBox, borderTop: '4px solid #2d6a4f' }}>
                    <div style={S.rPriceBoxLabel}>⬆ Zyada</div>
                    <div style={{ ...S.rPriceVal, color: '#2d6a4f' }}>{priceForUnit(parseFloat(best.max_price), unitObj.kg)}</div>
                    <div style={S.rPriceUnit}>{unitObj.label}</div>
                  </div>
                </div>
                <div style={S.rQuintalNote}>📦 1 Quintal (100kg) = ₹{parseFloat(best.modal_price).toLocaleString('en-IN')}</div>
              </div>

              {records.length > 1 && (
                <div style={S.rMandiCard}>
                  <div style={S.rMandiTitle}>🏪 Baaki Mandis</div>
                  {records.slice(0, 6).map((r, i) => (
                    <div key={i} style={{ ...S.rMandiRow, background: i === 0 ? '#f0faf4' : i % 2 === 0 ? '#fafcf8' : '#fff', borderLeft: i === 0 ? '5px solid #16a34a' : '5px solid #e8f0e4' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {i === 0 && <span style={{ background: '#16a34a', color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '99px' }}>BEST</span>}
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1b4332' }}>{r.market}</span>
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: i === 0 ? '#16a34a' : '#2d6a4f' }}>{priceForUnit(parseFloat(r.modal_price), unitObj.kg)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1rem' }}>
              <div style={S.rUnitCard}>
                <div style={S.rUnitTitle}>🧮 Kitna Bechoge?</div>
                <div style={S.rUnitGrid}>
                  {UNITS.map((u, i) => (
                    <button key={i} style={{ ...S.rUnitBtn, background: i === unitIdx ? '#1b4332' : '#f3f8f0', color: i === unitIdx ? '#fff' : '#1b4332', borderColor: i === unitIdx ? '#1b4332' : '#c8dfc0', fontWeight: i === unitIdx ? 900 : 600 }} onClick={() => setUnitIdx(i)}>
                      {u.label}
                    </button>
                  ))}
                </div>
                <div style={S.rUnitResult}>
                  <div style={S.rUnitResultLabel}>{unitObj.label} bechoge toh milega</div>
                  <div style={S.rUnitResultPrice}>{unitPrice}</div>
                  <div style={S.rUnitResultSub}>10 × = {priceForUnit(parseFloat(best.modal_price), unitObj.kg * 10)}</div>
                </div>
              </div>

              <div style={S.rActions}>
                <a href={`https://wa.me/?text=${encodeURIComponent(buildWAMsg(crop, district, best, unitObj.label, unitPrice, advice))}`} target="_blank" rel="noopener noreferrer" style={S.waBtn}>
                  <span style={{ fontSize: '1.3rem' }}>💬</span> WhatsApp pe bhejo
                </a>
                <button style={S.alertSetupBtn} onClick={() => setStep('alert_setup')}>🔔 Auto Alert Lagao</button>
                <div style={S.tip}>💡 Bechne se pehle local vyapari se bhi poochho — ye wholesale daam hai.</div>
                <button style={S.resetBtn} onClick={reset}>🔄 Doosri Fasal Dekho</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ ALERT SETUP ══ */}
      {step === 'alert_setup' && crop && (
        <div style={S.container}>
          <div style={S.alertCard}>
            <div style={{ fontSize: '3rem', textAlign: 'center' as const }}>🔔</div>
            <h2 style={S.alertTitle}>Auto Alert Lagao</h2>
            <p style={S.alertDesc}>Jab bhi <strong>{crop.hindi}</strong> ka bhav {district} mein 5% se zyada upar ya neeche jaye, hum aapko WhatsApp pe turant batayenge.</p>
            <div style={S.alertFieldWrap}>
              <label style={S.alertLabel}>Aapka WhatsApp Number</label>
              <div style={S.phoneRow}>
                <span style={S.phonePrefix}>+91</span>
                <input style={S.phoneInput} type="tel" placeholder="10-digit mobile number" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
              </div>
            </div>
            {alertSaved ? (
              <div style={S.alertSuccess}>✅ Alert set ho gaya!<br /><span style={{ fontSize: '0.85rem', fontWeight: 400 }}>Jab {crop.hindi} ka bhav 5%+ badlega, tab WhatsApp pe message ayega.</span></div>
            ) : (
              <button style={{ ...S.greenBtn, opacity: phone.length === 10 ? 1 : 0.5, cursor: phone.length === 10 ? 'pointer' : 'not-allowed' }} onClick={saveAlert} disabled={phone.length !== 10}>🔔 Alert Set Karo</button>
            )}
            {savedAlerts.length > 0 && (
              <div style={{ marginTop: '1.5rem', width: '100%' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7c6b', textTransform: 'uppercase' as const, marginBottom: '0.5rem' }}>Active Alerts</div>
                {savedAlerts.map((a, i) => (
                  <div key={i} style={S.savedAlertRow}>
                    <span>{a.cropEmoji} {a.cropHindi} — {a.district}</span>
                    <button style={S.removeBtn} onClick={() => {
                      const updated = savedAlerts.filter((_, j) => j !== i)
                      setSavedAlerts(updated)
                      try { localStorage.setItem('km_alerts', JSON.stringify(updated)) } catch {}
                    }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <button style={S.outlineBtn} onClick={() => setStep('result')}>← Wapas Jao</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin       { to{transform:rotate(360deg)} }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatDrift { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes ticker     { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @media(max-width:900px){
          .heroSplit{grid-template-columns:1fr!important;min-height:auto!important}
          .heroRight{display:none!important}
          .cropGridFull{grid-template-columns:repeat(2,1fr)!important}
        }
        @media(max-width:700px){ .resultGrid-r{grid-template-columns:1fr !important} }
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  pageWrap: {
    minHeight: '100vh',
    position: 'relative' as const,
    fontFamily: "'Segoe UI',system-ui,sans-serif",
    paddingBottom: '4rem',
  },

  /* ── TOP BAR: orange sticky bar with scrolling ticker ── */
  topBar: {
    width: '100%',
    height: '44px',
    overflow: 'hidden',
    background: 'linear-gradient(90deg, #c2410c 0%, #ea580c 40%, #f97316 70%, #fb923c 100%)',
    borderBottom: '1px solid rgba(255,255,255,0.18)',
    display: 'flex',
    alignItems: 'center',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    boxShadow: '0 3px 18px rgba(234,88,12,0.45)',
  },
  backBtn: {
    background: 'rgba(0,0,0,0.22)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: '#fff',
    borderRadius: '10px',
    padding: '0.3rem 0.8rem',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginLeft: '0.75rem',
    flexShrink: 0,
    whiteSpace: 'nowrap' as const,
    lineHeight: 1,
  },

  /* CurvedLoop fills remaining width — no scale hack, same as homepage */
  topMarqueeWrap: {
    flex: 1,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
  },

  /* Two copies of the text side-by-side; CSS animation scrolls the pair left by 50% */
  tickerTrack: {
    display: 'flex',
    whiteSpace: 'nowrap' as const,
    animation: 'ticker 28s linear infinite',
    willChange: 'transform',
  },
  tickerText: {
    display: 'inline-block',
    fontFamily: "'Bebas Neue', 'DM Sans', sans-serif",
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: '#ffffff',
    textShadow: '0 1px 4px rgba(0,0,0,0.3)',
    paddingRight: '2rem',
  },

  container: {
    padding: '1rem',
    maxWidth: 520,
    margin: '0 auto',
    position: 'relative' as const,
    zIndex: 1,
  },

  heroSplit: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    alignItems: 'center',
    gap: '3rem',
    padding: '4rem 5vw 3rem',
    minHeight: '45vh',
    animation: 'fadeUp 0.6s ease both',
  },
  heroLeft: { display: 'flex', flexDirection: 'column' as const, gap: '1.25rem' },
  heroBadge: {
    display: 'inline-block',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.35)',
    color: '#fff',
    fontSize: '0.88rem',
    fontWeight: 700,
    padding: '0.4rem 1.1rem',
    borderRadius: '99px',
    letterSpacing: '0.04em',
    alignSelf: 'flex-start',
  },
  heroTitle: {
    fontSize: 'clamp(2.8rem,5vw,4.5rem)',
    fontWeight: 900,
    color: '#fff',
    lineHeight: 1.05,
    margin: 0,
    letterSpacing: '-0.04em',
  },
  heroAccent: { color: '#f4a261' },
  heroDesc: { fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.75, margin: 0 },
  pillRow: { display: 'flex', gap: '0.65rem', flexWrap: 'wrap' as const },
  heroPill: {
    background: 'rgba(0,0,0,0.38)',
    border: '1px solid rgba(255,255,255,0.32)',
    color: '#fff',
    fontSize: '0.88rem',
    fontWeight: 700,
    padding: '0.45rem 1.1rem',
    borderRadius: '99px',
  },

  cropGridFull: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '1.1rem',
    padding: '0 5vw',
  },
  cropCardFull: {
    position: 'relative' as const,
    background: 'rgba(244, 162, 97, 0.18)',
    border: '2px solid rgba(244, 162, 97, 0.35)',
    borderRadius: '22px',
    padding: '1.75rem 0.75rem 1.25rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.4rem',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(244, 162, 97, 0.15)',
    WebkitTapHighlightColor: 'transparent',
    animation: 'fadeUp 0.5s ease both',
    transition: 'transform 0.15s, background 0.15s',
  },
  cropArrowNew: { position: 'absolute' as const, top: '0.8rem', right: '1rem', fontSize: '1.1rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700 },
  cropEmojiNew: { fontSize: '3.4rem', lineHeight: 1, filter: 'drop-shadow(1px 3px 8px rgba(0,0,0,0.3))', marginBottom: '0.2rem' },
  cropHindiNew: { fontSize: '1.1rem', fontWeight: 900, color: '#000', letterSpacing: '-0.01em' },
  cropOdiaNew: { fontSize: '0.85rem', color: '#000', fontWeight: 500 },

  bottomTip: {
    margin: '1.5rem 5vw 0',
    padding: '1rem 1.4rem',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: '16px',
    fontSize: '0.92rem',
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 1.6,
  },

  distHeader: { position: 'relative' as const, zIndex: 1, textAlign: 'center' as const, padding: '2.5rem 1.5rem 1.5rem', animation: 'fadeUp 0.5s ease both' },
  distCropBadge: { display: 'inline-block', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: '0.85rem', fontWeight: 800, padding: '0.3rem 1rem', borderRadius: '99px', marginBottom: '0.75rem', letterSpacing: '0.04em' },
  distTitle: { fontSize: 'clamp(2rem,4.5vw,3rem)', fontWeight: 900, color: '#fff', margin: '0 0 0.4rem', letterSpacing: '-0.03em' },
  distSubtitle: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', margin: 0 },
  distGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.85rem', padding: '0 1.5rem', maxWidth: 960, margin: '0 auto' },
  distCard: { position: 'relative' as const, background: 'rgba(0,0,0,0.45)', border: '2px solid rgba(255,255,255,0.22)', borderRadius: '18px', padding: '1.1rem 1rem 0.9rem', display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-start', gap: '0.2rem', cursor: 'pointer', textAlign: 'left' as const, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', WebkitTapHighlightColor: 'transparent', animation: 'fadeUp 0.45s ease both', transition: 'transform 0.15s' },
  distCardIcon: { fontSize: '2rem', lineHeight: 1, marginBottom: '0.2rem', filter: 'drop-shadow(1px 2px 4px rgba(0,0,0,0.3))' },
  distCardName: { fontSize: '1.05rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.01em' },
  distCardTag: { fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase' as const, letterSpacing: '0.06em' },
  distCardArrow: { position: 'absolute' as const, top: '0.85rem', right: '0.9rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700 },

  centered: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' },
  spinner: { width: 56, height: 56, borderRadius: '50%', border: '6px solid #e2eed8', borderTop: '6px solid #2d6a4f', animation: 'spin 0.85s linear infinite' },
  errorCard: { background: '#fff', borderRadius: '20px', padding: '2rem 1.5rem', marginTop: '1rem', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', textAlign: 'center' as const },
  errIcon: { fontSize: '3rem' },
  errT: { fontSize: '1.2rem', fontWeight: 800, color: '#1b4332', margin: 0 },
  errB: { fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.7, margin: 0 },
  greenBtn: { background: '#2d6a4f', color: '#fff', padding: '0.85rem 1.5rem', borderRadius: '14px', fontSize: '1rem', fontWeight: 700, textDecoration: 'none', display: 'block', width: '100%', textAlign: 'center' as const, border: 'none', cursor: 'pointer' },
  outlineBtn: { background: '#fff', border: '2px solid #2d6a4f', color: '#2d6a4f', padding: '0.85rem', borderRadius: '14px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', width: '100%' },

  resultPage: { position: 'relative' as const, zIndex: 1, padding: '1rem 1.5rem 3rem', maxWidth: 1100, margin: '0 auto' },
  resultGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '1rem' },
  rAdvice: { borderRadius: '20px', padding: '1.25rem 1.75rem', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '1.25rem', animation: 'fadeUp 0.3s ease', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' },
  rAdviceTitle: { fontSize: '1.7rem', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em' },
  rAdviceSub: { fontSize: '0.92rem', color: 'rgba(255,255,255,0.92)', marginTop: '0.3rem', fontWeight: 500 },
  rActions: { display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' },
  rHeroPrice: { background: '#fff', borderRadius: '22px', padding: '1.4rem', marginBottom: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', animation: 'fadeUp 0.4s 0.05s ease both' },
  rCropName: { fontSize: '1.15rem', fontWeight: 900, color: '#1b4332' },
  rCropLoc: { fontSize: '0.82rem', color: '#6b7c6b', marginTop: '0.15rem' },
  rPriceRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem', marginBottom: '0.85rem', alignItems: 'end' },
  rPriceBox: { background: '#f8faf5', borderRadius: '16px', padding: '0.85rem 0.5rem', textAlign: 'center' as const, transition: 'transform 0.15s' },
  rPriceBoxLabel: { fontSize: '0.72rem', fontWeight: 700, color: '#6b7c6b', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.4rem' },
  rPriceVal: { fontSize: '1.45rem', fontWeight: 900, lineHeight: 1.1 },
  rPriceUnit: { fontSize: '0.68rem', color: '#9ca3af', marginTop: '0.25rem', fontWeight: 600 },
  rQuintalNote: { fontSize: '0.8rem', color: '#6b7c6b', textAlign: 'center' as const, borderTop: '1px solid #e8f0e4', paddingTop: '0.75rem', fontWeight: 600 },
  rUnitCard: { background: '#fff', borderRadius: '22px', padding: '1.4rem', marginBottom: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', animation: 'fadeUp 0.4s 0.1s ease both' },
  rUnitTitle: { fontSize: '1.05rem', fontWeight: 900, color: '#1b4332', marginBottom: '1rem' },
  rUnitGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '1.1rem' },
  rUnitBtn: { borderRadius: '12px', padding: '0.65rem 0.3rem', fontSize: '0.88rem', cursor: 'pointer', border: '2px solid', transition: 'transform 0.12s', WebkitTapHighlightColor: 'transparent' },
  rUnitResult: { background: '#f0faf4', borderRadius: '16px', padding: '1.1rem', textAlign: 'center' as const },
  rUnitResultLabel: { fontSize: '0.78rem', fontWeight: 700, color: '#6b7c6b', textTransform: 'uppercase' as const, letterSpacing: '0.06em' },
  rUnitResultPrice: { fontSize: '3.2rem', fontWeight: 900, color: '#1b4332', lineHeight: 1.1, margin: '0.2rem 0', letterSpacing: '-0.04em' },
  rUnitResultSub: { fontSize: '0.85rem', color: '#6b7c6b' },
  rMandiCard: { background: '#fff', borderRadius: '22px', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', animation: 'fadeUp 0.4s 0.15s ease both' },
  rMandiTitle: { fontSize: '1rem', fontWeight: 800, color: '#1b4332', marginBottom: '0.75rem' },
  rMandiRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px', padding: '0.8rem 1rem', marginBottom: '0.4rem' },
  waBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', background: '#25d366', color: '#fff', padding: '1rem', borderRadius: '16px', fontSize: '1.05rem', fontWeight: 800, textDecoration: 'none', marginBottom: '0.75rem', boxShadow: '0 4px 14px rgba(37,211,102,0.3)' },
  alertSetupBtn: { width: '100%', padding: '0.9rem', background: '#fff', border: '2px solid #f59e0b', color: '#92400e', borderRadius: '16px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' } as React.CSSProperties,
  tip: { background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#92400e', lineHeight: 1.6 },
  resetBtn: { width: '100%', padding: '1rem', background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(45,106,79,0.25)' },
  alertCard: { background: '#fff', borderRadius: '20px', padding: '1.75rem 1.25rem', marginTop: '0.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '1rem' },
  alertTitle: { fontSize: '1.4rem', fontWeight: 800, color: '#1b4332', margin: 0 },
  alertDesc: { fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.7, textAlign: 'center' as const, margin: 0 },
  alertFieldWrap: { width: '100%' },
  alertLabel: { fontSize: '0.85rem', fontWeight: 700, color: '#1b4332', display: 'block', marginBottom: '0.5rem' },
  phoneRow: { display: 'flex', alignItems: 'center', border: '2px solid #e2eed8', borderRadius: '12px', overflow: 'hidden' },
  phonePrefix: { background: '#f3f8f3', padding: '0.8rem 0.75rem', fontSize: '1rem', fontWeight: 700, color: '#1b4332', borderRight: '2px solid #e2eed8', flexShrink: 0 },
  phoneInput: { flex: 1, padding: '0.8rem', fontSize: '1.1rem', border: 'none', outline: 'none', color: '#1b4332' },
  alertSuccess: { background: '#dcfce7', border: '2px solid #86efac', borderRadius: '14px', padding: '1rem', textAlign: 'center' as const, fontWeight: 700, color: '#16a34a', lineHeight: 1.6, width: '100%' },
  savedAlertRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f3f8f3', borderRadius: '10px', padding: '0.65rem 0.85rem', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600, color: '#1b4332', width: '100%' },
  removeBtn: { background: 'none', border: 'none', color: '#dc2626', fontWeight: 800, cursor: 'pointer', fontSize: '1rem' },
}