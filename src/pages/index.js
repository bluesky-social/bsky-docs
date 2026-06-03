import React, { useEffect } from 'react'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import Butterfly from '../components/Navbar/Butterfly'

import '../css/landing.css'

// Static crop of atproto.com's amber dot-globe, used in the third row's logo card.
const atprotoGlobe = require('@site/static/img/atproto-globe.png').default

// ---------------------------------------------------------------------------
// Decorative, static markup carried over verbatim from the design mockup
// (../bps-website/prototypes/landing-bsky.html). These blocks are pure SVG /
// pre-tokenized HTML with no interactivity, so we inject them as raw HTML
// rather than transcribing ~130 SVG nodes + template-literal braces into JSX.
// ---------------------------------------------------------------------------

const HERO_TOPO_HTML = `
<svg viewBox="0 0 1180 540" preserveAspectRatio="xMidYMid slice">
  <g>
    <path class="line" d="M 1180,40 C 1080,30 980,80 920,160 C 860,240 760,260 700,340 C 640,420 720,500 880,520 L 1180,520 Z"/>
    <path class="line" d="M 1180,90 C 1090,80 1000,120 950,200 C 900,280 800,290 760,360 C 720,430 800,490 920,500 L 1180,500 Z"/>
    <path class="line" d="M 1180,140 C 1100,135 1030,170 990,240 C 950,310 850,320 820,380 C 800,440 870,470 960,478 L 1180,478 Z"/>
    <path class="line bold" d="M 1180,190 C 1110,190 1060,220 1030,280 C 1000,340 920,355 890,400 C 870,440 920,455 1000,460 L 1180,460 Z"/>
    <path class="line" d="M 1180,240 C 1130,240 1090,260 1070,310 C 1050,360 1010,380 990,410 C 980,430 1010,440 1050,442 L 1180,442 Z"/>
    <path class="line" d="M 1180,290 C 1150,290 1130,300 1115,330 C 1100,360 1080,380 1080,400 C 1080,415 1110,420 1140,420 L 1180,420 Z"/>
    <path class="line" d="M 1180,340 C 1160,340 1145,350 1140,370 C 1135,390 1120,395 1130,400 L 1180,400 Z"/>
    <path class="line"      d="M 540,540 C 600,520 700,510 760,480 C 820,450 880,440 920,440 C 1000,440 1080,448 1180,460"/>
    <path class="line"      d="M 600,540 C 660,530 740,520 780,500 C 820,480 860,470 900,470 C 1000,470 1080,478 1180,490"/>
    <path class="line bold" d="M 670,540 C 730,535 800,528 830,520 C 860,510 880,505 900,505 C 1000,505 1080,512 1180,522"/>
    <path class="line" d="M 480,0 C 520,40 600,60 680,40 C 760,20 820,40 900,30 L 1180,30"/>
    <path class="line" d="M 520,0 C 560,30 620,50 700,40 C 780,30 830,50 900,50 L 1180,50"/>
  </g>
  <g style="color: var(--c-jetstream)">
    <circle class="pin-ring" cx="980" cy="280" r="22"/>
    <circle class="pin-ring" cx="980" cy="280" r="40" style="stroke-dasharray:2 4"/>
    <circle class="pin warm" cx="980" cy="280" r="5.5"/>
  </g>
  <text x="998" y="278" class="label warm">RELAY · APPVIEW · JETSTREAM</text>
  <g style="color: var(--c-relay)">
    <circle class="pin cool" cx="600" cy="160" r="3.2"/>
    <circle class="pin cool" cx="640" cy="200" r="3.2"/>
    <circle class="pin cool" cx="580" cy="240" r="3.2"/>
    <circle class="pin cool" cx="660" cy="270" r="3.2"/>
  </g>
  <text x="690" y="172" class="label cool">PDS · ×1,206</text>
  <g style="color: var(--c-api)">
    <circle class="pin-ring" cx="1110" cy="430" r="14"/>
    <circle class="pin mag" cx="1110" cy="430" r="3.8"/>
  </g>
  <text x="998" y="446" class="label mag" style="text-anchor:end">→ YOUR APP</text>
  <text x="1080" y="244" class="label" opacity="0.6">+260</text>
  <text x="1090" y="346" class="label" opacity="0.6">+180</text>
  <text x="780" y="514" class="label" opacity="0.5">+080</text>
</svg>`

const HERO_GRAIN_HTML = `
<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1180 540">
  <filter id="hero-grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="5" stitchTiles="stitch"/>
  </filter>
  <rect width="1180" height="540" filter="url(#hero-grain)"/>
</svg>`

const PROOF_GRAIN_HTML = `
<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1180 360">
  <filter id="proof-grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="11" stitchTiles="stitch"/>
  </filter>
  <rect width="1180" height="360" filter="url(#proof-grain)"/>
</svg>`

const PROOF_GUTTER_HTML =
  Array.from({ length: 16 }, (_, i) => `<span class="ln code-ln">${i + 1}</span>`).join('')

// Pre-tokenized TS sample. Single-quoted lines so the literal backticks and
// ${...} template-literal markers inside the code stay inert.
const PROOF_CODE_HTML = [
  '<span class="tk-kw">import</span> <span class="tk-pun">{</span> <span class="tk-cls">Jetstream</span><span class="tk-pun">,</span> <span class="tk-fn">isCreate</span> <span class="tk-pun">}</span> <span class="tk-kw">from</span> <span class="tk-str">\'@atproto/jetstream\'</span><span class="tk-pun">;</span>',
  '<span class="tk-kw">import</span> <span class="tk-pun">{</span> <span class="tk-id">app</span> <span class="tk-pun">}</span> <span class="tk-kw">from</span> <span class="tk-str">\'@atproto/api\'</span><span class="tk-pun">;</span>',
  '',
  '<span class="tk-kw">const</span> <span class="tk-id">jetstream</span> <span class="tk-pun">=</span> <span class="tk-kw">new</span> <span class="tk-cls">Jetstream</span><span class="tk-pun">({</span>',
  '  <span class="tk-id">collections</span><span class="tk-pun">:</span> <span class="tk-pun">[</span><span class="tk-id">app</span><span class="tk-pun">.</span><span class="tk-prop">bsky</span><span class="tk-pun">.</span><span class="tk-prop">graph</span><span class="tk-pun">.</span><span class="tk-prop">follow</span><span class="tk-pun">,</span> <span class="tk-id">app</span><span class="tk-pun">.</span><span class="tk-prop">bsky</span><span class="tk-pun">.</span><span class="tk-prop">feed</span><span class="tk-pun">.</span><span class="tk-prop">repost</span><span class="tk-pun">,</span> <span class="tk-id">app</span><span class="tk-pun">.</span><span class="tk-prop">bsky</span><span class="tk-pun">.</span><span class="tk-prop">feed</span><span class="tk-pun">.</span><span class="tk-prop">post</span><span class="tk-pun">],</span>',
  '<span class="tk-pun">});</span>',
  '',
  '<span class="tk-kw">for await</span> <span class="tk-pun">(</span><span class="tk-kw">const</span> <span class="tk-id">event</span> <span class="tk-kw">of</span> <span class="tk-id">jetstream</span><span class="tk-pun">) {</span>',
  '  <span class="tk-kw">if</span> <span class="tk-pun">(</span><span class="tk-fn">isCreate</span><span class="tk-pun">(</span><span class="tk-id">event</span><span class="tk-pun">,</span> <span class="tk-id">app</span><span class="tk-pun">.</span><span class="tk-prop">bsky</span><span class="tk-pun">.</span><span class="tk-prop">graph</span><span class="tk-pun">.</span><span class="tk-prop">follow</span><span class="tk-pun">)) {</span>',
  '    <span class="tk-id">console</span><span class="tk-pun">.</span><span class="tk-fn">log</span><span class="tk-pun">(</span><span class="tk-tmpl">`🌱  ${<span class="tk-tag"></span><span class="tk-id">event</span><span class="tk-pun">.</span><span class="tk-prop">did</span><span class="tk-tag"></span>}  follows  ${<span class="tk-tag"></span><span class="tk-id">event</span><span class="tk-pun">.</span><span class="tk-prop">commit</span><span class="tk-pun">.</span><span class="tk-prop">record</span><span class="tk-pun">.</span><span class="tk-prop">subject</span><span class="tk-tag"></span>}`</span><span class="tk-pun">);</span>',
  '  <span class="tk-pun">}</span> <span class="tk-kw">else if</span> <span class="tk-pun">(</span><span class="tk-fn">isCreate</span><span class="tk-pun">(</span><span class="tk-id">event</span><span class="tk-pun">,</span> <span class="tk-id">app</span><span class="tk-pun">.</span><span class="tk-prop">bsky</span><span class="tk-pun">.</span><span class="tk-prop">feed</span><span class="tk-pun">.</span><span class="tk-prop">repost</span><span class="tk-pun">)) {</span>',
  '    <span class="tk-id">console</span><span class="tk-pun">.</span><span class="tk-fn">log</span><span class="tk-pun">(</span><span class="tk-tmpl">`♻️  ${<span class="tk-tag"></span><span class="tk-id">event</span><span class="tk-pun">.</span><span class="tk-prop">did</span><span class="tk-tag"></span>}  reposts  ${<span class="tk-tag"></span><span class="tk-id">event</span><span class="tk-pun">.</span><span class="tk-prop">commit</span><span class="tk-pun">.</span><span class="tk-prop">record</span><span class="tk-pun">.</span><span class="tk-prop">subject</span><span class="tk-pun">.</span><span class="tk-prop">uri</span><span class="tk-tag"></span>}`</span><span class="tk-pun">);</span>',
  '  <span class="tk-pun">}</span> <span class="tk-kw">else if</span> <span class="tk-pun">(</span><span class="tk-fn">isCreate</span><span class="tk-pun">(</span><span class="tk-id">event</span><span class="tk-pun">,</span> <span class="tk-id">app</span><span class="tk-pun">.</span><span class="tk-prop">bsky</span><span class="tk-pun">.</span><span class="tk-prop">feed</span><span class="tk-pun">.</span><span class="tk-prop">post</span><span class="tk-pun">) &amp;&amp;</span> <span class="tk-id">event</span><span class="tk-pun">.</span><span class="tk-prop">commit</span><span class="tk-pun">.</span><span class="tk-prop">record</span><span class="tk-pun">.</span><span class="tk-prop">reply</span><span class="tk-pun">) {</span>',
  '    <span class="tk-id">console</span><span class="tk-pun">.</span><span class="tk-fn">log</span><span class="tk-pun">(</span><span class="tk-tmpl">`💭  ${<span class="tk-tag"></span><span class="tk-id">event</span><span class="tk-pun">.</span><span class="tk-prop">did</span><span class="tk-tag"></span>}  replies  ${<span class="tk-tag"></span><span class="tk-id">event</span><span class="tk-pun">.</span><span class="tk-prop">commit</span><span class="tk-pun">.</span><span class="tk-prop">record</span><span class="tk-pun">.</span><span class="tk-prop">reply</span><span class="tk-pun">.</span><span class="tk-prop">parent</span><span class="tk-pun">.</span><span class="tk-prop">uri</span><span class="tk-tag"></span>}`</span><span class="tk-pun">);</span>',
  '  <span class="tk-pun">}</span>',
  '<span class="tk-pun">}</span>',
].join('\n')

// ---------------------------------------------------------------------------
// Product cards — wired to real docs / repos. Tweak these targets freely.
//
// Two rows of three: a top row of "protocol services" (the austere, mono /
// endpoint styling) and a bottom row in the friendlier "legacy Bluesky"
// styling. Each row's third cell is a logo/decor cell.
// ---------------------------------------------------------------------------

const DECOR_WORD = 'BLUESKYPROTOCOLSERVICES'.repeat(11)

// Top-row card: dark, mono, with an endpoint line.
function ProtocolCard({ title, em, endpoint, what, href, to }) {
  const inner = (
    <>
      <h3>
        {title} <em>{em}</em>
      </h3>
      <span className="endpoint">{endpoint}</span>
      <p className="what">{what}</p>
      <span className="more">Learn More →</span>
    </>
  )
  return href ? (
    <a className="cell prod" href={href} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    <Link className="cell prod" to={to}>
      {inner}
    </Link>
  )
}

// Bottom-row card: friendlier "legacy Bluesky" styling, pill CTA.
function FriendlyCard({ title, what, cta, href, to }) {
  const inner = (
    <>
      <h3>{title}</h3>
      <p className="what">{what}</p>
      <span className="more">{cta} →</span>
    </>
  )
  return href ? (
    <a className="cell friendly" href={href} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    <Link className="cell friendly" to={to}>
      {inner}
    </Link>
  )
}

// Thin-stroke line icons, echoing atproto.com's card iconography.
function TutorialsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 6.5C10.4 5.4 7.8 5 4 5v12c3.8 0 6.4.4 8 1.5 1.6-1.1 4.2-1.5 8-1.5V5c-3.8 0-6.4.4-8 1.5Z" />
      <path d="M12 6.5v12" />
    </svg>
  )
}
function SdkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8.5 8 4 12l4.5 4M15.5 8 20 12l-4.5 4M13.5 5.5l-3 13" />
    </svg>
  )
}

// Third-row card: atproto.com design language (amber accent, thin line icon).
function AtprotoCard({ icon, title, what, href }) {
  return (
    <a className="cell atproto" href={href} target="_blank" rel="noopener noreferrer">
      <span className="atproto-icon" aria-hidden="true">{icon}</span>
      <h3>{title}</h3>
      <p className="what">{what}</p>
      <span className="more">Learn more →</span>
    </a>
  )
}

// Port of the mockup's runnable-proof + copy-button behavior.
function useProof() {
  useEffect(() => {
    const proof = document.getElementById('proof')
    const runBtn = document.getElementById('proof-run')
    const copyBtn = document.getElementById('proof-copy')
    const out = document.getElementById('proof-out')
    const gutter = document.getElementById('proof-gutter')
    if (!proof || !runBtn || !out || !gutter) return

    const DIDS = [
      'did:plc:7iza6de2dwap2sbkpav7c6c6', 'did:plc:z72i7hdynmk6r22z27h6tvur',
      'did:plc:ragtjsm2j2vknwkz3zp4oxrd', 'did:plc:ewvi7nxzyoun6zhxrhs64oiz',
      'did:plc:oky5czdrnfjpqslsw2a5iclo', 'did:plc:44ybard66vv44zksje25o7dz',
      'did:plc:wzsilnxf24ehtmmc3gssy5bu', 'did:plc:6z5jrxbpiwzljyq4yvxj7gxd',
      'did:plc:lz7yu4xxzm2ndqecxw4qg2nd', 'did:plc:t1xq3w5pl9k2nvm6dcr7b8ux',
      'did:plc:af0nxjk5cm2pq8whdtzs3l4r', 'did:plc:bn5xq8we4r2tk7m3djpz6vyc',
    ]
    const TIDS = [
      '3kj2xq8wlmc24', '3kl9pn4rt6s2v', '3km4rx9pn8d3w', '3kn8qm2vt5f4r',
      '3kp7sj6wn9c8x', '3kr2tk5xm7b9q', '3ks5tn8vp9c4r', '3kt9wj7xm6b2k',
      '3ku4ql8nm5d9p', '3kv2xn7wj6c8m',
    ]
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
    const pickPair = (arr) => {
      const a = pick(arr)
      let b
      do { b = pick(arr) } while (b === a)
      return [a, b]
    }
    const follow = () => {
      const p = pickPair(DIDS)
      return '<span class="line-follow"><b>🌱</b>  <span class="did">' + p[0] + '</span>  follows  <span class="did">' + p[1] + '</span></span>'
    }
    const repost = () => {
      const p = pickPair(DIDS)
      return '<span class="line-repost"><b>♻️</b>  <span class="did">' + p[0] + '</span>  reposts  <span class="uri">at://' + p[1] + '/app.bsky.feed.post/' + pick(TIDS) + '</span></span>'
    }
    const reply = () => {
      const p = pickPair(DIDS)
      return '<span class="line-reply"><b>💭</b>  <span class="did">' + p[0] + '</span>  replies  <span class="uri">at://' + p[1] + '/app.bsky.feed.post/' + pick(TIDS) + '</span></span>'
    }
    const nextLine = () => {
      const r = Math.random()
      if (r < 0.45) return follow()
      if (r < 0.75) return repost()
      return reply()
    }

    let streamId = null
    let lineCount = 0

    const appendLine = () => {
      out.insertAdjacentHTML('beforeend', nextLine() + '\n')
      lineCount += 1
      const ln = document.createElement('span')
      ln.className = 'ln out-ln'
      ln.textContent = String(lineCount)
      gutter.appendChild(ln)
      const prev = gutter.querySelector('.out-ln.is-active')
      if (prev) prev.classList.remove('is-active')
      ln.classList.add('is-active')
      out.scrollTop = out.scrollHeight
      gutter.scrollTop = gutter.scrollHeight
    }
    const start = () => {
      proof.classList.add('is-running')
      runBtn.classList.add('is-running')
      runBtn.querySelector('.run-label').textContent = 'Stop'
      out.innerHTML = ''
      Array.prototype.forEach.call(gutter.querySelectorAll('.out-ln'), (n) => n.remove())
      lineCount = 0
      for (let i = 0; i < 6; i++) appendLine()
      streamId = setInterval(appendLine, 180 + Math.round(Math.random() * 80))
    }
    const stop = () => {
      if (streamId) { clearInterval(streamId); streamId = null }
      proof.classList.remove('is-running')
      runBtn.classList.remove('is-running')
      runBtn.querySelector('.run-label').textContent = 'Run'
      const prev = gutter.querySelector('.out-ln.is-active')
      if (prev) prev.classList.remove('is-active')
    }
    const onRun = () => { if (streamId) stop(); else start() }
    const onCopy = () => {
      const pre = proof.querySelector('pre.code')
      if (!pre || !navigator.clipboard) return
      navigator.clipboard.writeText(pre.textContent).then(() => {
        const prevLabel = copyBtn.textContent
        copyBtn.textContent = 'Copied'
        setTimeout(() => { copyBtn.textContent = prevLabel }, 1400)
      })
    }

    runBtn.addEventListener('click', onRun)
    if (copyBtn) copyBtn.addEventListener('click', onCopy)
    return () => {
      if (streamId) clearInterval(streamId)
      runBtn.removeEventListener('click', onRun)
      if (copyBtn) copyBtn.removeEventListener('click', onCopy)
    }
  }, [])
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext()
  useProof()
  return (
    <Layout
      title="Bluesky Developer Platform"
      description="High scale open social, unlocked for every builder. Explore guides and tutorials to the Bluesky API."
    >
      <main className="bps-home">
        {/* ===== HERO ===== */}
        <section className="hero">
          <div className="blobs">
            <div className="blob b1"></div>
            <div className="blob b2"></div>
            <div className="blob b3"></div>
            <div className="blob b4"></div>
          </div>
          <div
            className="topo"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: HERO_TOPO_HTML }}
          />
          <div
            className="grain"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: HERO_GRAIN_HTML }}
          />
          <div className="copy">
            <h1>
              High scale open social
              <br />
              <span className="quiet">unlocked for every builder.</span>
            </h1>
            <p className="lede">
              <em>Billions</em> of interactions across millions of accounts, streaming to you in{' '}
              <em>realtime</em>.
              <br />
              What will <em className="you">you</em> build on the <em className="atmo">Atmosphere</em>?
            </p>
            <div className="cta-row">
              <Link className="btn ghost" to="/docs/jetstream">
                Explore the network
              </Link>
              <Link className="btn primary" to="/docs/get-started">
                Get started with Bluesky
              </Link>
            </div>
            <p className="signoff">
              Bluesky open social network, operated by <b>Bluesky PBC.</b>
            </p>
          </div>
        </section>

        {/* ===== PROOF (runnable) ===== */}
        <div className="proof" id="proof">
          <div className="window">
            <div
              className="grain"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: PROOF_GRAIN_HTML }}
            />
            <div className="head">
              <span className="left">
                <span className="lang">TS</span>
                <span className="filename">
                  <b>jetstream.ts</b>
                </span>
              </span>
              <span className="right">
                <button className="btn copy" id="proof-copy" type="button">
                  Copy
                </button>
                <button className="btn run" id="proof-run" type="button">
                  <span className="play"></span>
                  <span className="run-label">Run</span>
                </button>
              </span>
            </div>
            <div className="stage">
              <div
                className="gutter"
                id="proof-gutter"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: PROOF_GUTTER_HTML }}
              />
              <div className="pane">
                <pre className="code" dangerouslySetInnerHTML={{ __html: PROOF_CODE_HTML }} />
                <pre className="out" id="proof-out" aria-live="polite"></pre>
              </div>
            </div>
          </div>

          <aside className="cta">
            <h2>
              Less asking.
              <br />
              More building.
            </h2>
            <p>
              No API keys, no signup, no waiting to get started. <b>Free and open.</b> You're in.
            </p>
            <h2 className="next">
              Backed by
              <br />
              AT&nbsp;Protocol.
            </h2>
            <p>Lay foundations on top of an open network that can't be taken away.</p>
            <Link className="more" to="/docs/jetstream">
              More examples →
            </Link>
          </aside>
        </div>

        {/* ===== PRODUCT GRID (2 rows × 3) ===== */}
        <section className="prod-grid">
          <div className="cells">
            {/* Top row — protocol services */}
            <ProtocolCard
              title="Jetstream"
              em="v2"
              endpoint="wss://jetstream2.us-east.bsky.network"
              what="Replay data from the network or stream in real time. Slice the data you care about."
              href="/docs/jetstream"
            />
            <ProtocolCard
              title="The"
              em="Relay"
              endpoint="wss://bsky.network"
              what="Sync the full Atmosphere in a zero trust setting. Build your own independent infrastructure."
              href="/docs/relay"
            />
            <div className="cell decor" aria-hidden="true">
              <div className="repeat">{DECOR_WORD}</div>
            </div>

            {/* Bottom row — friendly / legacy Bluesky */}
            <FriendlyCard
              title="Bluesky API"
              what="Develop against Bluesky. Work with profiles, posts, threads, relationships, interactions, and feeds."
              cta="Get Started"
              to="/docs/get-started"
            />
            <FriendlyCard
              title="HTTP Reference"
              what="Browse every API endpoint used by Bluesky, with full request and response schemas."
              cta="Browse the reference"
              // NOTE: temporary target — the HTTP reference is moving off this
              // site to a standalone OpenAPI site. Update when that lands.
              href="https://endpoints-production-21ea.up.railway.app/"
            />
            <div className="cell friendly logocard" aria-hidden="true">
              <Butterfly className="friendlyBfly" />
              <span className="friendlyWord">Bluesky</span>
            </div>

            {/* Third row — atproto.com (amber accent, thin line icons) */}
            <AtprotoCard
              icon={<TutorialsIcon />}
              title="Tutorials"
              what="Step-by-step guides for building on the AT Protocol — custom feeds, bots, and more."
              href="https://atproto.com/guides/tutorials"
            />
            <AtprotoCard
              icon={<SdkIcon />}
              title="SDKs"
              what="Reference and community SDKs for TypeScript, Go, and many others."
              href="https://atproto.com/sdks"
            />
            <a
              className="cell atproto globecard"
              href="https://atproto.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img className="globeImg" src={atprotoGlobe} alt="" aria-hidden="true" />
              <span className="globeWord">AT&nbsp;Protocol</span>
            </a>
          </div>
        </section>

        {/* ===== QUOTE ===== */}
        <section className="quote">
          <blockquote>
            <span className="line">We reject kings, presidents, and voting.</span>
            <span className="line">
              We believe in <em>rough consensus</em> and <em>running code</em>.
            </span>
            <cite>
              — <b>David Clark</b>, IETF
            </cite>
          </blockquote>
        </section>
      </main>
    </Layout>
  )
}
