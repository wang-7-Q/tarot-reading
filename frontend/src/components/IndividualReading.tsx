import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { IndividualReading as ReadingType } from '../types';

interface Props {
  reading: ReadingType;
  index: number;
}

export default function IndividualReading({ reading, index }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.15 }}
    >
      <div className="card-surface individual-card" onClick={() => setIsOpen(!isOpen)}>
        <div className="individual-summary">
          <div className="individual-icon">✧</div>
          <div>
            <div className="individual-title-row">
              <strong>
                {reading.card.name_zh}
                {reading.reversed && (
                  <span style={{ color: 'var(--color-reverse)', fontSize: 'var(--text-sm)', marginLeft: 4 }}>
                    逆位
                  </span>
                )}
              </strong>
              <span className="individual-position">
                {reading.position}
              </span>
            </div>
            <p className="reading-preview">
              {reading.reading.slice(0, 80)}...
            </p>
          </div>
          <motion.span animate={{ rotate: isOpen ? 180 : 0 }} style={{ color: 'var(--color-text-dim)' }}>
            ▼
          </motion.span>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                marginTop: 12, paddingTop: 12,
                borderTop: '1px solid var(--color-border)',
                lineHeight: 1.95, fontSize: 'var(--text-base)',
              }}>
                {reading.reading}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
