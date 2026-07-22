export default function Footer() {
  return (
    <footer
      style={{
        background: '#1b1b1c',
        borderTop: '3px solid #1b1b1c',
        padding: 'clamp(20px,4vw,36px) clamp(16px,5vw,64px)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ fontFamily: "'Anybody',sans-serif", fontWeight: 900, fontSize: 'clamp(16px,3vw,28px)', color: '#fcf8f9', letterSpacing: '-0.01em' }}>
        © DEV SATISH 
      </div>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <a href="https://linkedin.com/in/devsatish" target="_blank" rel="noreferrer" className="footer-link">
          LinkedIn
        </a>
        <a href="https://github.com/devsatish08" target="_blank" rel="noreferrer" className="footer-link">
          GitHub
        </a>
        <a href="mailto:devsatish08@gmail.com" className="footer-link">
          Email
        </a>
      </div>
    </footer>
  );
}
