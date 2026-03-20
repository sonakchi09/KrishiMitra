'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

// ── Types ────────────────────────────────────────────────
type MsgType = 'text' | 'audio'

interface Message {
  id: string
  from: 'bot' | 'user'
  type: MsgType
  text: string // always present (transcript for audio, text for text)
  audioDuration?: number // seconds, for audio bubbles
  time: string
}

function uid() {
  return Math.random().toString(36).slice(2, 9)
}
function nowStr() {
  return new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── Groq API ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Mitra — a warm, caring mental wellness companion for rural farmers in Odisha, India.

  PERSONALITY:
  - You are like a trusted elder brother/sister (bhaiya/didi), NOT a clinical therapist
  - Speak in simple Hindi (Hindustani) mixed with common Odia words
  - Use VERY simple words — no medical jargon, no complicated sentences
  - Be warm, gentle, never judgmental
  - Short replies — 2 to 4 sentences max per message
  - Use emojis occasionally to feel friendly (not excessive)
  - Always respond in the SAME language the user writes in (Hindi, Odia, or English)
  - If user seems very distressed, gently suggest iCall helpline: 9152987821

  ROLE:
  - Listen deeply. Reflect back feelings. Ask gentle follow-up questions.
  - You are a conversation partner, not a questionnaire
  - Never diagnose. Never prescribe. Never give medical advice.
  - Focus on emotional support, coping, hope

  CONTEXT:
  - Users are farmers facing crop failure, debt, loneliness, illness, family stress
  - Many have never talked to anyone about mental health
  - Your job is to make them feel heard and less alone

  START: Begin with a warm greeting and ask how their day was. Keep it very natural.`

async function callGroq(
  history: { role: string; parts: { text: string }[] }[],
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY
  if (!apiKey)
    return 'API key nahi mili. .env mein NEXT_PUBLIC_GROQ_API_KEY set karo.'

  // Convert Gemini-style history to OpenAI-style messages
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((h) => ({
      role: h.role === 'model' ? 'assistant' : 'user',
      content: h.parts.map((p) => p.text).join(''),
    })),
  ]

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.88,
      max_tokens: 300,
    }),
  })

  if (!res.ok) {
    if (res.status === 429)
      return 'Thoda wait karo... abhi bahut log baat kar rahe hain 😅'
    return 'Kuch gadbad ho gayi. Dobara try karo.'
  }
  const data = await res.json()
  return (
    data.choices?.[0]?.message?.content ??
    'Kuch samajh nahi aaya, dobara bolna.'
  )
}

// ── TTS: play/pause for a single message ─────────────────
// We manage one global utterance at a time
let activeMsgId: string | null = null

function ttsPlay(msgId: string, text: string, onEnd: () => void): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  activeMsgId = msgId
  const clean = text.replace(/[^\x00-\x7F\u0900-\u097F ]/g, '')
  const utt = new SpeechSynthesisUtterance(clean)
  utt.lang = 'hi-IN'
  utt.rate = 0.88
  utt.pitch = 1.05
  utt.onend = () => {
    activeMsgId = null
    onEnd()
  }
  utt.onerror = () => {
    activeMsgId = null
    onEnd()
  }
  window.speechSynthesis.speak(utt)
}

function ttsPause() {
  window.speechSynthesis?.pause()
}
function ttsResume() {
  window.speechSynthesis?.resume()
}
function ttsStop() {
  activeMsgId = null
  window.speechSynthesis?.cancel()
}

// ── Waveform bars (visual only, decorative) ──────────────
function Waveform({ playing }: { playing: boolean }) {
  const bars = [3, 5, 8, 5, 10, 7, 4, 9, 6, 3, 7, 5, 8, 4, 6]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 20 }}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: h + 2,
            borderRadius: 3,
            background: playing ? '#2d6a4f' : '#a0b8a8',
            animation: playing
              ? `waveBar 0.8s ease-in-out ${(i * 0.07).toFixed(2)}s infinite alternate`
              : 'none',
            transition: 'background 0.3s',
          }}
        />
      ))}
    </div>
  )
}

// ── Audio bubble (bot or user voice msg) ─────────────────
function AudioBubble({
  msg,
  isUser,
  playingId,
  pausedId,
  onPlay,
  onPause,
  onStop,
}: {
  msg: Message
  isUser: boolean
  playingId: string | null
  pausedId: string | null
  onPlay: (id: string, text: string) => void
  onPause: (id: string) => void
  onStop: () => void
}) {
  const isPlaying = playingId === msg.id
  const isPaused = pausedId === msg.id
  const dur = msg.audioDuration ?? Math.max(3, Math.ceil(msg.text.length / 12))

  function handleBtn() {
    if (isPlaying) {
      onPause(msg.id)
    } else if (isPaused) {
      onPlay(msg.id, msg.text)
    } else {
      onPlay(msg.id, msg.text)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.6rem 0.85rem',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser ? '#d9fdd3' : '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.09)',
        minWidth: 200,
      }}
    >
      {/* Play/Pause button */}
      <button
        onClick={handleBtn}
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: '#2d6a4f',
          border: 'none',
          color: '#fff',
          fontSize: '1rem',
          cursor: 'pointer',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      {/* Waveform */}
      <Waveform playing={isPlaying} />

      {/* Duration */}
      <span
        style={{
          fontSize: '0.75rem',
          color: '#6b7c6b',
          marginLeft: 'auto',
          flexShrink: 0,
        }}
      >
        {dur}s
      </span>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────
export default function MindPulsePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [recSeconds, setRecSeconds] = useState(0)
  const [started, setStarted] = useState(false)
  // TTS state
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [pausedId, setPausedId] = useState<string | null>(null)

  const geminiHistory = useRef<{ role: string; parts: { text: string }[] }[]>(
    [],
  )
  const bottomRef = useRef<HTMLDivElement>(null)
  const recRef = useRef<any>(null)
  const recTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ── TTS controls ──
  function handlePlay(id: string, text: string) {
    ttsStop()
    setPlayingId(id)
    setPausedId(null)
    ttsPlay(id, text, () => {
      setPlayingId(null)
      setPausedId(null)
    })
  }
  function handlePause(id: string) {
    ttsPause()
    setPlayingId(null)
    setPausedId(id)
  }
  function handleStop() {
    ttsStop()
    setPlayingId(null)
    setPausedId(null)
  }

  // ── Add messages ──
  function addMsg(msg: Message) {
    setMessages((prev) => [...prev, msg])
  }

  // ── Start chat ──
  async function startChat() {
    setStarted(true)
    setLoading(true)
    const greeting = await callGroq([])
    const id = uid()
    geminiHistory.current = [{ role: 'model', parts: [{ text: greeting }] }]
    addMsg({ id, from: 'bot', type: 'text', text: greeting, time: nowStr() })
    setLoading(false)
  }

  // ── Send text message ──
  async function sendText(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setInput('')

    const userMsgId = uid()
    addMsg({
      id: userMsgId,
      from: 'user',
      type: 'text',
      text: trimmed,
      time: nowStr(),
    })
    geminiHistory.current = [
      ...geminiHistory.current,
      { role: 'user', parts: [{ text: trimmed }] },
    ]

    setLoading(true)
    const reply = await callGroq(geminiHistory.current)
    geminiHistory.current = [
      ...geminiHistory.current,
      { role: 'model', parts: [{ text: reply }] },
    ]
    addMsg({
      id: uid(),
      from: 'bot',
      type: 'text',
      text: reply,
      time: nowStr(),
    })
    setLoading(false)
    inputRef.current?.focus()
  }

  // ── Send voice message (WhatsApp style) ──
  async function sendVoice(transcript: string, durationSecs: number) {
    if (!transcript.trim() || loading) return

    // Show user's voice bubble
    const userMsgId = uid()
    addMsg({
      id: userMsgId,
      from: 'user',
      type: 'audio',
      text: transcript,
      audioDuration: durationSecs,
      time: nowStr(),
    })

    geminiHistory.current = [
      ...geminiHistory.current,
      { role: 'user', parts: [{ text: transcript }] },
    ]

    setLoading(true)
    const reply = await callGroq(geminiHistory.current)
    geminiHistory.current = [
      ...geminiHistory.current,
      { role: 'model', parts: [{ text: reply }] },
    ]

    // Bot always replies as text (user taps to listen)
    addMsg({
      id: uid(),
      from: 'bot',
      type: 'text',
      text: reply,
      time: nowStr(),
    })
    setLoading(false)
  }

  // ── Mic hold to record ──
  function startMic() {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    if (!SR) {
      alert('Aapke phone mein voice nahi chala. Type karein.')
      return
    }

    setRecSeconds(0)
    recTimer.current = setInterval(() => setRecSeconds((s) => s + 1), 1000)

    const rec = new SR()
    rec.lang = 'hi-IN'
    rec.interimResults = false
    recRef.current = rec
    const startedAt = Date.now()

    rec.onstart = () => setListening(true)
    rec.onend = () => {
      setListening(false)
      if (recTimer.current) clearInterval(recTimer.current)
    }
    rec.onerror = () => {
      setListening(false)
      if (recTimer.current) clearInterval(recTimer.current)
    }
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      const dur = Math.round((Date.now() - startedAt) / 1000)
      sendVoice(transcript, Math.max(1, dur))
    }
    rec.start()
  }

  function stopMic() {
    recRef.current?.stop()
    if (recTimer.current) clearInterval(recTimer.current)
    setListening(false)
  }

  // ─────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      {/* HEADER */}
      <div style={S.header}>
        <div style={S.avatarWrap}>
          <div style={S.avatarCircle}>🧠</div>
          {(loading || listening) && <span style={S.onlineDot} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={S.botName}>Mitra Bot</div>
          <div style={S.botStatus}>
            {listening
              ? `🔴 Recording... ${recSeconds}s`
              : loading
                ? '✍️ Likh raha hoon...'
                : 'Aapka mann ka dost ❤️'}
          </div>
        </div>
        <div style={S.freeBadge}>FREE</div>
      </div>

      {/* CHAT AREA */}
      <div style={S.chatArea}>
        {/* Intro */}
        {!started && (
          <div style={S.introCard}>
            <div style={{ fontSize: '3.2rem' }}>🌿</div>
            <h2 style={S.introTitle}>Mitra Bot</h2>
            <p style={S.introText}>
              Main aapka dost hoon — ek aisa insaan jise aap kuch bhi bol sakte
              ho.
              <br />
              <br />
              Koi judge nahi karega. Koi doctor nahi. Bas sunne wala ek dost. 🙏
            </p>
            <div style={S.pillRow}>
              <span style={S.pill}>🎤 Bolo ya likho</span>
              <span style={S.pill}>🔊 Tap karke suno</span>
              <span style={S.pill}>🔒 Private</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: 0 }}>
              Hindi • English • Odia — koi bhi bhasha chalegi
            </p>
            <button style={S.startBtn} onClick={startChat}>
              Baat Karo Mitra Se 👉
            </button>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => {
          const isUser = msg.from === 'user'
          return (
            <div
              key={msg.id}
              style={{
                ...S.msgRow,
                justifyContent: isUser ? 'flex-end' : 'flex-start',
              }}
            >
              {!isUser && <div style={S.msgAvatar}>🧠</div>}

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                }}
              >
                {/* AUDIO bubble */}
                {msg.type === 'audio' ? (
                  <AudioBubble
                    msg={msg}
                    isUser={isUser}
                    playingId={playingId}
                    pausedId={pausedId}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onStop={handleStop}
                  />
                ) : (
                  /* TEXT bubble */
                  <div style={isUser ? S.userBubble : S.botBubble}>
                    {msg.text.split('\n').map((line, j, arr) => (
                      <span key={j}>
                        {line}
                        {j < arr.length - 1 && <br />}
                      </span>
                    ))}

                    {/* Bot text: tap speaker to listen */}
                    {!isUser && (
                      <button
                        style={{
                          ...S.speakerBtn,
                          background:
                            playingId === msg.id ? '#e8f5e9' : 'transparent',
                        }}
                        onClick={() =>
                          playingId === msg.id
                            ? handlePause(msg.id)
                            : pausedId === msg.id
                              ? handlePlay(msg.id, msg.text)
                              : handlePlay(msg.id, msg.text)
                        }
                        title="Suno"
                      >
                        {playingId === msg.id ? '⏸ Roko' : '🔊 Suno'}
                      </button>
                    )}
                  </div>
                )}

                <div style={S.timeStamp}>{msg.time}</div>
              </div>
            </div>
          )
        })}

        {/* Typing dots */}
        {loading && started && (
          <div style={{ ...S.msgRow, justifyContent: 'flex-start' }}>
            <div style={S.msgAvatar}>🧠</div>
            <div style={S.botBubble}>
              <div style={{ display: 'flex', gap: 5, padding: '3px 0' }}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{ ...S.dot, animationDelay: `${i * 0.22}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT BAR */}
      {started && (
        <>
          {/* Recording overlay */}
          {listening && (
            <div style={S.recordingBar}>
              <div style={S.recDot} />
              <span style={{ fontWeight: 700, color: '#dc2626' }}>
                Recording... {recSeconds}s
              </span>
              <span style={{ color: '#6b7c6b', fontSize: '0.8rem' }}>
                Chodo bhejne ke liye
              </span>
            </div>
          )}

          {!listening && (
            <div style={S.inputBar}>
              <input
                ref={inputRef}
                style={S.inputField}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendText(input)}
                placeholder="Yahan likho..."
                disabled={loading}
              />
              {input.trim() ? (
                <button
                  style={{ ...S.roundBtn, background: '#2d6a4f' }}
                  onClick={() => sendText(input)}
                  disabled={loading}
                >
                  ➤
                </button>
              ) : (
                <button
                  style={{
                    ...S.roundBtn,
                    background: '#f4a261',
                    fontSize: '1.3rem',
                  }}
                  onPointerDown={startMic}
                  onPointerUp={stopMic}
                  onPointerLeave={stopMic}
                  disabled={loading}
                  title="Dabake rako aur bolo"
                >
                  🎤
                </button>
              )}
            </div>
          )}

          {listening && (
            <div style={{ ...S.inputBar, justifyContent: 'center' }}>
              <button
                style={{
                  ...S.roundBtn,
                  background: '#dc2626',
                  width: 56,
                  height: 56,
                  fontSize: '1.5rem',
                }}
                onPointerUp={stopMic}
                onPointerLeave={stopMic}
              >
                🔴
              </button>
            </div>
          )}

          <div style={S.hint}>
            {input.trim()
              ? 'Enter ya ➤ dabao bhejne ke liye'
              : '🎤 Dabakar rako + bolo → chodo = bhejna'}
          </div>
        </>
      )}

      <style>{`
          @keyframes fadeUp    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
          @keyframes dotBounce { 0%,80%,100%{transform:translateY(0);opacity:.3} 40%{transform:translateY(-8px);opacity:1} }
          @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.35} }
          @keyframes waveBar   { from{transform:scaleY(0.4)} to{transform:scaleY(1.2)} }
          @keyframes recPulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
        `}</style>
    </div>
  )
}

// ── Styles ───────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  page: {
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    background: '#ece5dd',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    maxWidth: 560,
    margin: '0 auto',
  },
  header: {
    background: '#2d6a4f',
    color: '#fff',
    padding: '0.75rem 1.1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
    flexShrink: 0,
  },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: '50%',
    background: '#40916c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.4rem',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 11,
    height: 11,
    borderRadius: '50%',
    background: '#4ade80',
    border: '2px solid #2d6a4f',
    animation: 'pulse 1.5s infinite',
  },
  botName: { fontWeight: 800, fontSize: '1rem' },
  botStatus: { fontSize: '0.73rem', opacity: 0.88 },
  freeBadge: {
    marginLeft: 'auto',
    background: '#40916c',
    padding: '0.2rem 0.55rem',
    borderRadius: '99px',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
  },
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem 0.8rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.55rem',
  },
  introCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '2rem 1.5rem',
    margin: '0.5rem 0',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    animation: 'fadeUp 0.3s ease',
  },
  introTitle: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#1b4332',
    margin: 0,
  },
  introText: {
    fontSize: '0.95rem',
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 1.7,
    margin: 0,
  },
  pillRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pill: {
    background: '#f0faf4',
    border: '1px solid #c8e6d0',
    borderRadius: '99px',
    padding: '0.3rem 0.75rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#2d6a4f',
  },
  startBtn: {
    background: '#2d6a4f',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    padding: '1rem 2.5rem',
    fontSize: '1.1rem',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(45,106,79,0.3)',
    width: '100%',
  },
  msgRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '0.45rem',
    animation: 'fadeUp 0.2s ease',
  },
  msgAvatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: '#40916c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    flexShrink: 0,
  },
  botBubble: {
    background: '#fff',
    borderRadius: '18px 18px 18px 4px',
    padding: '0.75rem 0.95rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.09)',
    fontSize: '0.975rem',
    color: '#1a2e1a',
    lineHeight: 1.65,
  },
  userBubble: {
    background: '#d9fdd3',
    borderRadius: '18px 18px 4px 18px',
    padding: '0.75rem 0.95rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.09)',
    fontSize: '0.975rem',
    color: '#1a2e1a',
    lineHeight: 1.65,
  },
  speakerBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginTop: '0.45rem',
    border: '1px solid #d8e8d0',
    borderRadius: '8px',
    padding: '0.22rem 0.6rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#2d6a4f',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  timeStamp: {
    fontSize: '0.68rem',
    color: '#9ca3af',
    marginTop: '0.2rem',
    paddingLeft: '0.2rem',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#a0aec0',
    display: 'inline-block',
    animation: 'dotBounce 1s ease-in-out infinite',
  },
  recordingBar: {
    background: '#fff0f0',
    borderTop: '1px solid #fca5a5',
    padding: '0.6rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexShrink: 0,
  },
  recDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: '#dc2626',
    flexShrink: 0,
    animation: 'recPulse 1s infinite',
  },
  inputBar: {
    background: '#f0f2f5',
    padding: '0.6rem 0.75rem',
    display: 'flex',
    gap: '0.45rem',
    alignItems: 'center',
    borderTop: '1px solid #dde5d8',
    flexShrink: 0,
  },
  inputField: {
    flex: 1,
    padding: '0.75rem 1rem',
    borderRadius: '24px',
    border: 'none',
    fontSize: '1rem',
    background: '#fff',
    outline: 'none',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    color: '#1a2e1a',
  },
  roundBtn: {
    width: 46,
    height: 46,
    borderRadius: '50%',
    border: 'none',
    color: '#fff',
    fontSize: '1rem',
    cursor: 'pointer',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.14)',
    transition: 'background 0.2s',
  },
  hint: {
    background: '#f0f2f5',
    textAlign: 'center' as const,
    fontSize: '0.68rem',
    color: '#9ca3af',
    paddingBottom: '0.5rem',
    flexShrink: 0,
  },
}
