import { SKILL_CATEGORIES } from '../data/content';

export default function Skills() {
  return (
    <section id="skills" style={{ padding: 'clamp(48px,8vw,80px) clamp(16px,5vw,64px)', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Education */}
      <div className="reveal" style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <h2 className="s-banner" style={{ fontSize: 'clamp(18px,3vw,28px)' }}>
            EDUCATION
          </h2>
        </div>
        <div className="ncard" style={{ padding: '28px', display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1, minWidth: '240px' }}>
            <div className="nss" style={{ background: '#e51152', border: '3px solid #1b1b1c', width: '62px', height: '62px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: "'Anybody',sans-serif", fontWeight: 900, fontSize: '13px', color: '#fff', textAlign: 'center', lineHeight: 1.1 }}>B.E.</span>
            </div>
            <div>
              <h3 style={{ fontFamily: "'Anybody',sans-serif", fontWeight: 900, fontSize: '22px', textTransform: 'uppercase' }}>BITS PILANI</h3>
              <div className="sticker" style={{ background: '#fdc003', color: '#1b1b1c', fontSize: '14px', margin: '8px 0' }}>
                Bachelor of Engineering in Mechanical Engineering
              </div>
              <p style={{ fontSize: '12px', color: '#5c3f42' }}>Aug 2023 – Present · Rajasthan, India</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1, minWidth: '240px' }}>
            <div className="nss" style={{ background: '#2addcd', border: '3px solid #1b1b1c', width: '62px', height: '62px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: "'Anybody',sans-serif", fontWeight: 900, fontSize: '13px', color: '#1b1b1c', textAlign: 'center', lineHeight: 1.1 }}>M.Sc.</span>
            </div>
            <div>
              <h3 style={{ fontFamily: "'Anybody',sans-serif", fontWeight: 900, fontSize: '22px', textTransform: 'uppercase' }}>BITS PILANI</h3>
              <div className="sticker" style={{ background: '#2addcd', color: '#1b1b1c', fontSize: '14px', margin: '8px 0' }}>
                Master of Science in Biological Sciences
              </div>
              <p style={{ fontSize: '12px', color: '#5c3f42' }}>Aug 2023 – Present · Dual Degree</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="reveal" style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <h2 className="s-banner" style={{ fontSize: 'clamp(18px,3.5vw,32px)' }}>
          TECHNICAL SKILLS
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,300px),1fr))', gap: '20px' }}>
        {SKILL_CATEGORIES.map((category) => (
          <div key={category.title} className="ncard reveal" style={{ padding: '24px', position: 'relative' }}>
            <div
              className="nss"
              style={{
                position: 'absolute',
                top: '-14px',
                left: '20px',
                background: category.iconBg,
                border: '3px solid #1b1b1c',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              {category.icon}
            </div>
            <h4 style={{ fontFamily: "'Anybody',sans-serif", fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', marginTop: '14px', marginBottom: '16px', borderBottom: '3px solid #1b1b1c', paddingBottom: '10px' }}>
              {category.title}
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {category.tags.map((tag) =>
                typeof tag === 'string' ? (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ) : (
                  <span key={tag.label} className="tag" style={{ background: tag.bg }}>
                    {tag.label}
                  </span>
                )
              )}
            </div>
          </div>
        ))}

        <div className="ncard reveal" style={{ padding: '24px', position: 'relative', background: '#1b1b1c', color: '#fff' }}>
          <div className="sticker" style={{ background: '#fdc003', color: '#1b1b1c', fontSize: '10px', position: 'absolute', top: '-14px', left: '20px' }}>
            100%
          </div>
          <h4 style={{ fontFamily: "'Anybody',sans-serif", fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', marginTop: '14px', marginBottom: '8px', color: '#2addcd' }}>
            GEEK
          </h4>
          <p style={{ fontSize: '12px', color: '#e5e2e3', lineHeight: 1.7 }}>4 internships · 4 shipped projects · 2 degrees (simultaneously). Still shipping.</p>
        </div>
      </div>
    </section>
  );
}
