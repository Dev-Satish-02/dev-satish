import { motion } from 'framer-motion';
import { useCursorState } from '../hooks/useCursor';
import '../styles/cursor.css';

export default function CustomCursor() {
  const cursor = useCursorState();

  if (!cursor.isEnabled) {
    return null;
  }

  const ringClassName = `custom-cursor-ring custom-cursor-ring--${cursor.variant}`;
  const innerTextClassName = cursor.label ? 'custom-cursor-text custom-cursor-text--visible' : 'custom-cursor-text';

  return (
    <div className="custom-cursor-wrapper" style={{ mixBlendMode: cursor.config.blendMode }}>
      <motion.div
        className={ringClassName}
        style={{
          x: cursor.ringX,
          y: cursor.ringY,
          scale: cursor.ringScale,
          width: cursor.config.ringSize,
          height: cursor.config.ringSize,
          borderColor: cursor.config.outlineColor,
          opacity: cursor.variant === 'input' ? cursor.config.subtleOpacity : 1,
        }}
      />

      <motion.div
        className="custom-cursor-dot"
        style={{
          x: cursor.cursorX,
          y: cursor.cursorY,
          scale: cursor.dotScale,
          width: cursor.config.dotSize,
          height: cursor.config.dotSize,
          backgroundColor: cursor.config.color,
        }}
      />

      <div className={innerTextClassName}>{cursor.label}</div>
    </div>
  );
}
