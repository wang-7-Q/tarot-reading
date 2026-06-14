import { motion } from 'framer-motion';
import type { Guidance } from '../types';

interface Props {
  guidance: Guidance;
}

export default function GuidanceBlock({ guidance }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="card-surface"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <h4 style={{ color: 'var(--color-positive)', marginBottom: 8 }}>✨ 关键指引</h4>
          <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
            {guidance.key_points.map((point, i) => (
              <li key={i} style={{ color: 'var(--color-text)' }}>{point}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{ color: 'var(--color-warning)', marginBottom: 8 }}>⚠️ 需要注意</h4>
          <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
            {guidance.cautions.map((caution, i) => (
              <li key={i} style={{ color: 'var(--color-text)' }}>{caution}</li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
