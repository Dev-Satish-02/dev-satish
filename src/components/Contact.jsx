export default function Contact() {
  return (
    <section id="contact" style={{ padding: 'clamp(48px,8vw,80px) clamp(16px,5vw,64px)', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
      <div className="reveal">
        <div style={{ display: 'inline-block', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: "'Anybody',sans-serif", fontWeight: 900, fontSize: 'clamp(32px,6vw,64px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1 }}>
            LET&apos;S BUILD
            <br />
            <span style={{ color: '#e51152' }}>SOMETHING.</span>
          </h2>
        </div>
        <p style={{ fontSize: '14px', color: '#5c3f42', lineHeight: 1.8, maxWidth: '500px', margin: '0 auto 36px' }}>
          Open to internships, collaborations, and interesting problems. I reply to everything.
        </p>

        <a href="mailto:devsatish08@gmail.com" className="nbtn" style={{ background: '#e51152', color: '#fff', padding: '16px 36px', fontSize: '15px', marginBottom: '36px', display: 'inline-flex' }}>
          devsatish08@gmail.com ✉️
        </a>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <a href="https://github.com/devsatish08" target="_blank" rel="noreferrer" className="nbtn" style={{ background: '#1b1b1c', color: '#fff', padding: '12px 24px', fontSize: '12px' }}>
            GitHub ↗
          </a>
          <a href="https://linkedin.com/in/devsatish" target="_blank" rel="noreferrer" className="nbtn" style={{ background: '#fff', color: '#1b1b1c', padding: '12px 24px', fontSize: '12px' }}>
            LinkedIn ↗
          </a>
          <a href="tel:+917506857789" className="nbtn" style={{ background: '#fdc003', color: '#1b1b1c', padding: '12px 24px', fontSize: '12px' }}>
            +91 75068 57789
          </a>
        </div>

        <div className="ncard" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '14px 24px' }}>
          <span className="status-dot" />
          <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Available for opportunities
          </span>
        </div>
      </div>
    </section>
  );
}
