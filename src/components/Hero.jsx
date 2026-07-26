export default function Hero() {
  return (
    <section
      id="hero"
      style={{
        padding: 'clamp(48px,8vw,80px) clamp(16px,5vw,64px) clamp(48px,8vw,80px)',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '40px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
          <div
            className="sticker reveal"
            style={{
              background: '#e51152',
              color: '#fff',
              marginBottom: '20px',
              transform: 'rotate(-8deg)',
              display: 'inline-flex',
            }}
          >
            🔥 HELLO WORLD
          </div>
          <h1
            className="hero-name reveal"
            style={{
              fontFamily: "'Anybody',sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(60px,10vw,84px)',
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            DEV
            <br />
            SATISH
          </h1>
          <div className="reveal" style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
            <div className="washi-teal" style={{ position: 'absolute', inset: '-6px -4px', zIndex: 0 }} />
            <h2
              style={{
                position: 'relative',
                zIndex: 1,
                fontFamily: "'Anybody',sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(18px,3vw,26px)',
                background: '#fcf8f9',
                border: '3px solid #1b1b1c',
                padding: '6px 14px',
                transform: 'rotate(1.5deg)',
                display: 'inline-block',
                color: '#e51152',
              }}
            >
              Full Stack Engineer &amp; AI Builder.
            </h2>
          </div>
          <p
            className="reveal"
            style={{
              background: '#fff',
              border: '3px solid #1b1b1c',
              padding: '16px',
              fontSize: '15px',
              lineHeight: 1.7,
              color: '#5c3f42',
              maxWidth: '440px',
              boxShadow: '4px 4px 0 #e5e2e3',
              marginBottom: '32px',
            }}
          >
            Building ML pipelines, trading algorithms, and scalable full-stack apps across four internships. BITS
            Pilani — Mechanical + Biological Sciences.
          </p>
          <div className="reveal" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <a href="#contact" className="nbtn" style={{ background: '#e51152', color: '#fff', padding: '14px 28px', fontSize: '13px' }}>
              Get in Touch 👋
            </a>
            <a href="mailto:devsatish08@gmail.com" className="nbtn" style={{ background: '#fdc003', color: '#1b1b1c', padding: '14px 18px', fontSize: '13px' }}>
              ↓ Email
            </a>
            <a href="https://github.com/Dev-Satish-02" target="_blank" rel="noreferrer" className="nbtn" style={{ background: '#fff', color: '#1b1b1c', padding: '14px 18px', fontSize: '13px' }}>
              GitHub ↗
            </a>
          </div>
        </div>

        <div style={{ flex: '0 0 auto', maxWidth: '380px', width: '100%', position: 'relative', marginTop: '40px' }}>
          <div className="polaroid reveal" style={{ transform: 'rotate(3deg)' }}>
            <div
              className="washi-pink"
              style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '120px',
                height: '28px',
                zIndex: 10,
              }}
            />
            <div
              style={{
                border: '3px solid #1b1b1c',
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src={`${import.meta.env.BASE_URL}images/pixel.png`}
                alt="Dev Satish"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
            <div style={{ position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
              <span className="sticker" style={{ background: '#fcf8f9', fontSize: '11px', transform: 'rotate(-2deg)', display: 'inline-block' }}>
                DEV_MODE: ON
              </span>
            </div>
          </div>
          <div
            className="sticker nss reveal"
            style={{
              position: 'absolute',
              top: '20%',
              right: '-40px',
              background: '#2addcd',
              color: '#1b1b1c',
              fontSize: '11px',
              zIndex: 20,
              transform: 'rotate(8deg)',
            }}
          >
            TypeScript
          </div>
          <div
            className="nss reveal"
            style={{
              position: 'absolute',
              top: '5%',
              left: '-20px',
              background: '#fdc003',
              border: '3px solid #1b1b1c',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              zIndex: 20,
            }}
          >
            ⚙️
          </div>
          <div
            className="sticker reveal"
            style={{
              position: 'absolute',
              bottom: '18%',
              left: '-36px',
              background: '#e51152',
              color: '#fff',
              fontSize: '10px',
              transform: 'rotate(-12deg)',
              zIndex: 20,
            }}
          >
            PyTorch
          </div>
        </div>
      </div>
    </section>
  );
}
