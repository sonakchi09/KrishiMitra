'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'

type LivestockResult = {
  status: string
  predicted_class: string
  odia_name: string
  confidence: number
  severity: 'low' | 'moderate' | 'high' | string
  advice_odia: string
  home_remedy: string
  see_vet_urgently: boolean
  low_confidence: boolean
}

const SEVERITY_COLOR: Record<string, string> = {
  low: '#2d6a4f',
  moderate: '#d97706',
  high: '#dc2626',
}
const SEVERITY_BG: Record<string, string> = {
  low: '#ecfdf5',
  moderate: '#fffbeb',
  high: '#fef2f2',
}
const SEVERITY_BORDER: Record<string, string> = {
  low: '#6ee7b7',
  moderate: '#fcd34d',
  high: '#fca5a5',
}

export default function LivestockPage() {
  const [result, setResult] = useState<LivestockResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)
    setResult(null)
    setPreview(URL.createObjectURL(file))
    setLoading(true)

    try {
      const fd = new FormData()
      fd.append('file', file)

      const res = await fetch('/api/livestock', {
        method: 'POST',
        body: fd,
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Server error ${res.status}: ${txt}`)
      }

      const data: LivestockResult = await res.json()

      if (data.status !== 'success') {
        throw new Error('Diagnosis failed. Please try a clearer image.')
      }

      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const sev = result?.severity ?? 'low'
  const sevColor = SEVERITY_COLOR[sev] ?? '#2d6a4f'
  const sevBg = SEVERITY_BG[sev] ?? '#ecfdf5'
  const sevBorder = SEVERITY_BORDER[sev] ?? '#6ee7b7'

  return (
    <>
      <style>{`
        .page { max-width: 640px; margin: 0 auto; padding: 3rem 1.5rem; }
        .page__back { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.875rem; color: #6b7c6b; text-decoration: none; margin-bottom: 1.5rem; transition: color 0.2s; }
        .page__back:hover { color: #2d6a4f; }
        .page__title { font-size: 1.9rem; font-weight: 800; color: #1b4332; margin-bottom: 0.4rem; }
        .page__desc { color: #6b7c6b; font-size: 0.95rem; margin-bottom: 2rem; }

        .card { background: #ffffff; border: 1px solid #d8e8d0; border-radius: 18px; padding: 1.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }

        .dropzone { border: 2px dashed #a8d5b5; border-radius: 12px; padding: 2rem 1rem; text-align: center; cursor: pointer; transition: background 0.2s, border-color 0.2s; background: #f7fcf9; }
        .dropzone:hover { background: #edf7f1; border-color: #4caf82; }
        .dropzone__icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .dropzone__label { font-size: 0.95rem; color: #3a6b50; font-weight: 600; margin-bottom: 0.25rem; }
        .dropzone__sub { font-size: 0.8rem; color: #8aab95; }

        .preview-wrap { margin-top: 1rem; border-radius: 10px; overflow: hidden; max-height: 220px; display: flex; justify-content: center; background: #f0f0f0; }
        .preview-wrap img { max-height: 220px; object-fit: contain; width: 100%; }

        .loader { margin-top: 1.5rem; display: flex; align-items: center; gap: 0.75rem; color: #3a6b50; font-size: 0.9rem; font-weight: 600; }
        .spinner { width: 22px; height: 22px; border: 3px solid #d8e8d0; border-top-color: #2d6a4f; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .error-box { margin-top: 1.25rem; background: #fff5f5; border: 1px solid #fca5a5; border-radius: 10px; padding: 1rem 1.25rem; color: #b91c1c; font-size: 0.9rem; }

        .result { margin-top: 1.5rem; border-radius: 14px; overflow: hidden; border: 1px solid #b7dfc6; }
        .result__header { background: #1b4332; padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; }
        .result__name { font-size: 1.1rem; font-weight: 800; color: #fff; text-transform: capitalize; }
        .result__odia { font-size: 0.95rem; color: #a7f3c8; font-weight: 500; }
        .result__conf { font-size: 0.8rem; background: rgba(255,255,255,0.15); color: #fff; border-radius: 20px; padding: 0.2rem 0.65rem; font-weight: 600; white-space: nowrap; }

        .result__body { background: #f7fcf9; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.9rem; }

        .badge-row { display: flex; gap: 0.6rem; flex-wrap: wrap; }
        .badge { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.8rem; font-weight: 700; border-radius: 20px; padding: 0.25rem 0.75rem; border: 1px solid; }

        .section-label { font-size: 0.75rem; font-weight: 700; color: #1b4332; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.3rem; }
        .info-box { background: #fff; border: 1px solid #d8e8d0; border-radius: 10px; padding: 0.85rem 1rem; font-size: 1rem; color: #1a2e1a; line-height: 1.6; }

        .vet-warning { display: flex; align-items: flex-start; gap: 0.6rem; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 10px; padding: 0.75rem 1rem; font-size: 0.88rem; color: #b91c1c; font-weight: 600; }
        .low-conf-note { display: flex; align-items: flex-start; gap: 0.6rem; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 10px; padding: 0.75rem 1rem; font-size: 0.88rem; color: #78350f; }
      `}</style>

      <div className="page">
        <Link href="/" className="page__back">
          ← Back to Home
        </Link>
        <h1 className="page__title">🐄 Livestock Health Monitor</h1>
        <p className="page__desc">
          Upload a clear photo of your animal. We'll detect early signs of
          illness and suggest treatment in Odia.
        </p>

        <div className="card">
          <div
            className="dropzone"
            onClick={() => fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="dropzone__icon">🐄</div>
            <div className="dropzone__label">
              Click or drag & drop an animal photo
            </div>
            <div className="dropzone__sub">JPG, PNG, WEBP — max 10 MB</div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />
          </div>

          {preview && (
            <div className="preview-wrap">
              <img src={preview} alt="Uploaded animal" />
            </div>
          )}

          {loading && (
            <div className="loader">
              <div className="spinner" />
              Analysing your animal photo…
            </div>
          )}

          {error && <div className="error-box">⚠️ {error}</div>}

          {result && !loading && (
            <div className="result">
              <div className="result__header">
                <div>
                  <div className="result__name">
                    {result.predicted_class.replace(/_/g, ' ')}
                  </div>
                  <div className="result__odia">{result.odia_name}</div>
                </div>
                <div className="result__conf">
                  {result.confidence.toFixed(1)}% confident
                </div>
              </div>

              <div className="result__body">
                <div className="badge-row">
                  <span
                    className="badge"
                    style={{
                      color: sevColor,
                      background: sevBg,
                      borderColor: sevBorder,
                    }}
                  >
                    🌡 Severity: {sev.charAt(0).toUpperCase() + sev.slice(1)}
                  </span>
                  {result.see_vet_urgently && (
                    <span
                      className="badge"
                      style={{
                        color: '#b91c1c',
                        background: '#fef2f2',
                        borderColor: '#fca5a5',
                      }}
                    >
                      🚨 Urgent Vet Visit
                    </span>
                  )}
                </div>

                {result.see_vet_urgently && (
                  <div className="vet-warning">
                    🚨{' '}
                    <span>
                      This animal needs urgent veterinary attention. Contact a
                      vet immediately.
                    </span>
                  </div>
                )}

                {result.low_confidence && (
                  <div className="low-conf-note">
                    ⚠️{' '}
                    <span>
                      Low confidence — try a clearer, better-lit photo for more
                      accurate results.
                    </span>
                  </div>
                )}

                <div>
                  <div className="section-label">Treatment Advice (ଓଡ଼ିଆ)</div>
                  <div className="info-box">{result.advice_odia}</div>
                </div>

                {result.home_remedy && (
                  <div>
                    <div className="section-label">
                      Home Remedy (ଘରୋଇ ଉପଚାର)
                    </div>
                    <div className="info-box">{result.home_remedy}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
