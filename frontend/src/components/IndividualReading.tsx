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
      <div className="card-surface" onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 28 }}>🃏</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong>
                {reading.card.name_zh}
                {reading.reversed && (
                  <span style={{ color: 'var(--color-reverse)', fontSize: 'var(--text-sm)', marginLeft: 4 }}>
                    逆位
                  </span>
                )}
              </strong>
              <span style={{ color: 'var(--color-text-dim)', fontSize: 'var(--text-sm)' }}>
                — {reading.position}
              </span>
            </div>
            <p style={{ color: 'var(--color-text-dim)', fontSize: 'var(--text-sm)', marginTop: 2 }}>
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
                lineHeight: 1.9, fontSize: 'var(--text-base)',
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
