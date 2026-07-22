import { EXPERIENCE } from '../data/content';

function ExperienceItem({ item }) {
  const isRight = item.side === 'right';
  const rowClass = isRight
    ? `tl-item-right reveal${item.isLast ? ' tl-item-left-last' : ''}`
    : `tl-item-left reveal${item.isLast ? ' tl-item-left-last' : ''}`;
  const markerClass = isRight ? 'tl-marker-right nss' : 'tl-marker-left nss';

  return (
    <div className={rowClass}>
      <div className="ncard" style={{ padding: '24px', maxWidth: '420px', width: '100%', opacity: item.dimmed ? 0.8 : 1 }}>
        <div
          className="sticker"
          style={{
            background: item.dateStickerBg || '#1b1b1c',
            color: '#fff',
            fontSize: '10px',
            marginBottom: '12px',
          }}
        >
          {item.date}
        </div>
        <h3 style={{ fontFamily: "'Anybody',sans-serif", fontWeight: 900, fontSize: '22px', textTransform: 'uppercase', marginBottom: '4px' }}>
          {item.company}
        </h3>
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#5c3f42', marginBottom: '12px' }}>{item.role}</p>
        <p
          style={{ fontSize: '12px', lineHeight: 1.7, color: '#5c3f42', marginBottom: '14px' }}
          dangerouslySetInnerHTML={{ __html: item.description }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {item.tags.map((tag) => (
            <span key={tag.label} className="tag" style={{ background: tag.bg }}>
              {tag.label}
            </span>
          ))}
        </div>
      </div>
      <div className={markerClass} style={{ background: item.marker.bg, color: item.marker.color }}>
        {item.marker.num}
      </div>
    </div>
  );
}

export default function Experience() {
  return (
    <section
      id="experience"
      style={{ padding: 'clamp(48px,8vw,80px) clamp(16px,5vw,64px)', maxWidth: '1100px', margin: '0 auto' }}
    >
      <div className="reveal" style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0 }}>
          <h2 className="s-banner" style={{ background: '#fdc003', fontSize: 'clamp(24px,4vw,40px)' }}>
            THE JOURNEY
          </h2>
        </div>
      </div>

      <div style={{ position: 'relative', padding: '0 0 20px' }}>
        <div className="tl-line" />
        {EXPERIENCE.map((item) => (
          <ExperienceItem key={item.company} item={item} />
        ))}
      </div>
    </section>
  );
}
