'use client'
import { useState } from 'react'

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .contact-wrap {
  min-height: 100vh;
  background: url('/contact-bg.jpg') center center / cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  font-family: 'DM Sans', sans-serif;
  position: relative;
}

.contact-wrap::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.25);
  pointer-events: none;
}

.contact-card {
  position: relative;
  z-index: 1;
}

        .contact-card {
          width: 100%;
          max-width: 960px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,0.18);
          min-height: 580px;
        }

        /* ── LEFT PANEL ── */
        .contact-left {
          background: #1e2a1a;
          padding: 56px 44px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        /* decorative leaf shape top-left */
        .contact-left::before {
          content: '';
          position: absolute;
          top: -60px;
          left: -60px;
          width: 220px;
          height: 220px;
          background: radial-gradient(circle, rgba(181,240,42,0.12) 0%, transparent 70%);
          border-radius: 50%;
        }

        .contact-left-top h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3rem, 6vw, 4.8rem);
          line-height: 0.9;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: #f4f4f0;
          margin-bottom: 20px;
        }

        .contact-left-top h1 span {
          color: #b5f02a;
        }

        .contact-left-top p {
          font-size: 0.88rem;
          color: rgba(244,244,240,0.55);
          line-height: 1.7;
          max-width: 260px;
          font-weight: 300;
        }

        .contact-info-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 40px;
        }

        .contact-info-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .contact-info-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(181,240,42,0.12);
          border: 1px solid rgba(181,240,42,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .contact-info-text h4 {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #b5f02a;
          margin-bottom: 2px;
        }

        .contact-info-text p {
          font-size: 0.82rem;
          color: rgba(244,244,240,0.6);
          line-height: 1.5;
          font-weight: 300;
        }

        .contact-dept {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(181,240,42,0.4);
          margin-top: 32px;
        }

        /* ── RIGHT PANEL ── */
        .contact-right {
          background: #b5f02a;
          padding: 56px 44px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 18px;
        }

        .contact-right h2 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.4rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #1e2a1a;
          margin-bottom: 4px;
        }

        .contact-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .contact-field label {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(30,42,26,0.6);
        }

        .contact-field input,
        .contact-field textarea,
        .contact-field select {
          width: 100%;
          padding: 11px 14px;
          background: rgba(255,255,255,0.55);
          border: 1.5px solid rgba(30,42,26,0.15);
          border-radius: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          color: #1e2a1a;
          outline: none;
          transition: border-color 0.18s, background 0.18s;
          resize: none;
        }

        .contact-field input::placeholder,
        .contact-field textarea::placeholder {
          color: rgba(30,42,26,0.4);
        }

        .contact-field input:focus,
        .contact-field textarea:focus,
        .contact-field select:focus {
          border-color: #1e2a1a;
          background: rgba(255,255,255,0.8);
        }

        .contact-field select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%231e2a1a' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
          cursor: pointer;
        }

        .contact-submit {
          margin-top: 6px;
          padding: 13px 0;
          width: 100%;
          background: #1e2a1a;
          color: #f4f4f0;
          border: none;
          border-radius: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.18s, transform 0.15s;
        }

        .contact-submit:hover {
          background: #2d4020;
          transform: translateY(-2px);
        }

        .contact-success {
          text-align: center;
          padding: 40px 0;
        }

        .contact-success span {
          font-size: 3rem;
          display: block;
          margin-bottom: 16px;
        }

        .contact-success h3 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2rem;
          color: #1e2a1a;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .contact-success p {
          font-size: 0.88rem;
          color: rgba(30,42,26,0.65);
          margin-top: 8px;
        }

        /* ── Responsive ── */
        @media (max-width: 720px) {
          .contact-card { grid-template-columns: 1fr; }
          .contact-left { padding: 40px 28px; }
          .contact-right { padding: 40px 28px; }
          .contact-info-list { margin-top: 28px; }
        }
      `}</style>

      <div className="contact-wrap ">
        <div className="contact-card">

          {/* ══ LEFT ══ */}
          <div className="contact-left">
            <div className="contact-left-top">
              <h1>Get In<br /><span>Touch</span></h1>
              <p>Have questions about your crops or livestock? Our team of experts is here to help farmers across Odisha.</p>

              <div className="contact-info-list">
                <div className="contact-info-item">
                  <div className="contact-info-icon">📞</div>
                  <div className="contact-info-text">
                    <h4>Helpline</h4>
                    <p>1800-XXX-XXXX (Toll Free)<br />Mon–Sat, 8am–6pm</p>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon">📧</div>
                  <div className="contact-info-text">
                    <h4>Email</h4>
                    <p>support@krishimitra.in</p>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon">📍</div>
                  <div className="contact-info-text">
                    <h4>Location</h4>
                    <p>Bhubaneswar, Odisha, India</p>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon">💬</div>
                  <div className="contact-info-text">
                    <h4>WhatsApp</h4>
                    <p>Send "HELP" to +91-XXXXX-XXXXX<br />Replies in Odia</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="contact-dept">KrishiMitra — Farmer Support Division</p>
          </div>

          {/* ══ RIGHT ══ */}
          <div className="contact-right">
            {sent ? (
              <div className="contact-success">
                <span>✅</span>
                <h3>Message Sent!</h3>
                <p>We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <>
                <h2>Send a Message</h2>

                <div className="contact-field">
                  <label>Your Name</label>
                  <input type="text" placeholder="Full name" />
                </div>

                <div className="contact-field">
                  <label>Phone Number</label>
                  <input type="tel" placeholder="10-digit mobile number" />
                </div>

                <div className="contact-field">
                  <label>Topic</label>
                  <select defaultValue="">
                    <option value="" disabled>Select a topic</option>
                    <option>Livestock Health</option>
                    <option>Crop Disease</option>
                    <option>Market Prices</option>
                    <option>Mind Pulse</option>
                    <option>Partnership</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="contact-field">
                  <label>Message</label>
                  <textarea rows={4} placeholder="Describe your issue or question..." />
                </div>

                <button className="contact-submit" onClick={() => setSent(true)}>
                  Send Message
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  )
}