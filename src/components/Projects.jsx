export default function Projects() {
  return (
    <section
      id="projects"
      style={{
        padding: 'clamp(48px,8vw,80px) clamp(16px,5vw,64px)',
        background: '#f0edee',
        borderTop: '3px solid #1b1b1c',
        borderBottom: '3px solid #1b1b1c',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="reveal" style={{ marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <h2 className="s-banner" style={{ fontSize: 'clamp(20px,4vw,36px)' }}>
            THE LAB
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,320px),1fr))', gap: '24px' }}>
          {/* Yearbook Portal */}
          <div className="polaroid reveal" style={{ transform: 'rotate(-1deg)' }}>
            <div className="washi-teal" style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '24px', zIndex: 10 }} />
            <div style={{ background: '#1b1b1c', border: '3px solid #1b1b1c', aspectRatio: '16/10', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#1b1b1c 0%,#2a2a2b 100%)', opacity: 0.9 }} />
              <div style={{ position: 'relative', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Anybody',sans-serif", fontWeight: 900, fontSize: '11px', color: '#2addcd', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                  PERN Stack
                </div>
                <div style={{ fontSize: '36px' }}>📚</div>
              </div>
              <div className="sticker" style={{ position: 'absolute', top: '10px', right: '10px', background: '#fdc003', color: '#1b1b1c', fontSize: '9px', transform: 'rotate(2deg)' }}>
                FEATURED
              </div>
            </div>
            <div style={{ padding: '14px 4px 0' }}>
              <h3 style={{ fontFamily: "'Anybody',sans-serif", fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', marginBottom: '8px' }}>Yearbook Portal</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                <span className="tag" style={{ background: '#b0e6ff' }}>PostgreSQL</span>
                <span className="tag" style={{ background: '#ffd6b0' }}>Express</span>
                <span className="tag" style={{ background: '#d4f5d4' }}>React</span>
                <span className="tag" style={{ background: '#fdc003' }}>Node.js</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#906e71', marginBottom: '4px' }}>STATUS</div>
                  <div className="sticker" style={{ background: '#d4f5d4', fontSize: '11px' }}>● Live</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a href="#" className="nbtn" style={{ background: '#1b1b1c', color: '#fff', padding: '8px 14px', fontSize: '10px' }}>Demo ↗</a>
                  <a href="#" className="nbtn" style={{ background: '#fff', color: '#1b1b1c', padding: '8px 14px', fontSize: '10px' }}>GitHub</a>
                </div>
              </div>
            </div>
          </div>

          {/* Readmebot */}
          <div className="polaroid reveal" style={{ transform: 'rotate(1.5deg)' }}>
            <div className="washi-pink" style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '24px', zIndex: 10 }} />
            <div style={{ background: '#1b1b1c', border: '3px solid #1b1b1c', aspectRatio: '16/10', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: '#2addcd', textAlign: 'left', padding: '14px', lineHeight: 1.8, position: 'relative', zIndex: 1 }}>
                <span style={{ color: '#fdc003' }}>$</span> npx readmebot
                <br />
                <span style={{ color: '#4af0a8' }}>✓</span> Analyzing codebase...
                <br />
                <span style={{ color: '#4af0a8' }}>✓</span> GPT-4 generating docs
                <br />
                <span style={{ color: '#4af0a8' }}>✓</span> README.md created!
                <br />
                <span style={{ color: '#5c3f42' }}>{'// 0.8s startup time'}</span>
              </div>
              <div className="sticker" style={{ position: 'absolute', top: '10px', right: '10px', background: '#e51152', color: '#fff', fontSize: '9px', transform: 'rotate(-2deg)' }}>
                500+ DL/wk
              </div>
            </div>
            <div style={{ padding: '14px 4px 0' }}>
              <h3 style={{ fontFamily: "'Anybody',sans-serif", fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', marginBottom: '8px' }}>Readmebot</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                <span className="tag" style={{ background: '#fdc003' }}>Node.js</span>
                <span className="tag" style={{ background: '#b0e6ff' }}>OpenAI</span>
                <span className="tag" style={{ background: '#e5e2e3' }}>CLI</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#906e71', marginBottom: '4px' }}>DOWNLOADS</div>
                  <div className="sticker" style={{ background: '#fdc003', fontSize: '11px' }}>500+</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a href="https://www.npmjs.com/package/readmebot" target="_blank" rel="noreferrer" className="nbtn" style={{ background: '#e51152', color: '#fff', padding: '8px 14px', fontSize: '10px' }}>npm ↗</a>
                  <a href="#" className="nbtn" style={{ background: '#fff', color: '#1b1b1c', padding: '8px 14px', fontSize: '10px' }}>GitHub</a>
                </div>
              </div>
            </div>
          </div>

          {/* Nirmaan NGO */}
          <div className="polaroid reveal" style={{ transform: 'rotate(-0.5deg)' }}>
            <div className="washi-yellow" style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '24px', zIndex: 10 }} />
            <div style={{ background: 'linear-gradient(135deg,#2addcd,#008379)', border: '3px solid #1b1b1c', aspectRatio: '16/10', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px', position: 'relative' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px' }}>🏛️</div>
                <div style={{ fontFamily: "'Anybody',sans-serif", fontWeight: 900, fontSize: '11px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '8px' }}>
                  NGO Digital Outreach
                </div>
              </div>
            </div>
            <div style={{ padding: '14px 4px 0' }}>
              <h3 style={{ fontFamily: "'Anybody',sans-serif", fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', marginBottom: '8px' }}>Nirmaan NGO</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                <span className="tag" style={{ background: '#2addcd' }}>Angular</span>
                <span className="tag" style={{ background: '#ffd6b0' }}>TypeScript</span>
                <span className="tag" style={{ background: '#d4f5d4' }}>Tailwind</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#906e71', marginBottom: '4px' }}>DEPLOY</div>
                  <div className="sticker" style={{ background: '#b0e6ff', fontSize: '11px' }}>GoDaddy</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a href="#" className="nbtn" style={{ background: '#1b1b1c', color: '#fff', padding: '8px 14px', fontSize: '10px' }}>Demo ↗</a>
                  <a href="#" className="nbtn" style={{ background: '#fff', color: '#1b1b1c', padding: '8px 14px', fontSize: '10px' }}>GitHub</a>
                </div>
              </div>
            </div>
          </div>

          {/* Mess Portal */}
          <div className="polaroid reveal" style={{ transform: 'rotate(1deg)' }}>
            <div className="washi-teal" style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '24px', zIndex: 10 }} />
            <div style={{ background: '#e51152', border: '3px solid #1b1b1c', aspectRatio: '16/10', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px', position: 'relative' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px' }}>🍽️</div>
                <div style={{ fontFamily: "'Anybody',sans-serif", fontWeight: 900, fontSize: '11px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '8px' }}>
                  BITS Pilani
                </div>
              </div>
              <div className="sticker" style={{ position: 'absolute', top: '10px', right: '10px', background: '#fdc003', color: '#1b1b1c', fontSize: '9px', transform: 'rotate(2deg)' }}>
                2K VIEWS
              </div>
            </div>
            <div style={{ padding: '14px 4px 0' }}>
              <h3 style={{ fontFamily: "'Anybody',sans-serif", fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', marginBottom: '8px' }}>BITS Mess Portal</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                <span className="tag" style={{ background: '#b0e6ff' }}>React</span>
                <span className="tag" style={{ background: '#e5e2e3' }}>REST API</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#906e71', marginBottom: '4px' }}>REACH</div>
                  <div className="sticker" style={{ background: '#d4f5d4', fontSize: '11px' }}>2,000+ in 7 days</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a href="#" className="nbtn" style={{ background: '#1b1b1c', color: '#fff', padding: '8px 14px', fontSize: '10px' }}>Demo ↗</a>
                  <a href="#" className="nbtn" style={{ background: '#fff', color: '#1b1b1c', padding: '8px 14px', fontSize: '10px' }}>GitHub</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
