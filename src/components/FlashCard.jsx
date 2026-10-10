// A full-bleed single-colour card: the series' "text is the image" cut.
export default function FlashCard({ tone = 'ink', big, line, left, right }) {
  return (
    <section className={`flashcard flash-in tone-${tone}`} aria-label={line}>
      {big && (
        <div className="flashcard-big" aria-hidden="true">
          {big}
        </div>
      )}
      {left && <div className="flashcard-corner tl">{left}</div>}
      <p className="flashcard-line">{line}</p>
      {right && <div className="flashcard-corner br">{right}</div>}
    </section>
  );
}
