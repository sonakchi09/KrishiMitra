'use client'
import { useState } from 'react'
import Link from 'next/link'
import ImageUpload from '../ImageUpload'

export default function LivestockPage() {
  const [result, setResult] = useState<string | null>(null)
  return (
    <>
      <style>{`
        .page { max-width: 640px; margin: 0 auto; padding: 3rem 1.5rem; }
        .page__back { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.875rem; color: #6b7c6b; text-decoration: none; margin-bottom: 1.5rem; transition: color 0.2s; }
        .page__back:hover { color: #2d6a4f; }
        .page__title { font-size: 1.9rem; font-weight: 800; color: #1b4332; margin-bottom: 0.4rem; }
        .page__desc { color: #6b7c6b; font-size: 0.95rem; margin-bottom: 2rem; }
        .card { background: #ffffff; border: 1px solid #d8e8d0; border-radius: 18px; padding: 1.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .result { margin-top: 1.5rem; background: #f0faf4; border: 1px solid #b7dfc6; border-radius: 12px; padding: 1.25rem 1.5rem; }
        .result__title { font-size: 0.85rem; font-weight: 700; color: #1b4332; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
        .result__text { font-size: 0.95rem; color: #1a2e1a; white-space: pre-wrap; line-height: 1.65; }
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
          <ImageUpload
            apiEndpoint="/api/livestock"
            label="Upload Animal Photo"
            onResult={setResult}
          />
          {result && (
            <div className="result">
              <div className="result__title">Diagnosis</div>
              <p className="result__text">{result}</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
