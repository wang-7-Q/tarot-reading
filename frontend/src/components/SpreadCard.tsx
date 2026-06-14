import { motion } from 'framer-motion';
import type { Spread } from '../types';

interface Props {
  spread: Spread;
  recommended: boolean;
  onSelect: (spread: Spread) => void;
}

export default function SpreadCard({ spread, recommended, onSelect }: Props) {
  const icons: Record<string, string> = {
    'single-card': '🔮',
    'three-card': '✨',
    'relationship': '💞',
    'celtic-cross': '🌟',
  };

  return (
    <motion.div
      className={`card-surface ${recommended ? 'card-glow' : ''}`}
      onClick={() => onSelect(spread)}
      whileHover={{ y: -4 }}
      style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
    >
      {recommended && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: 'var(--color-accent)', color: 'white',
          padding: '4px 12px', fontSize: 'var(--text-sm)',
          borderBottomLeftRadius: 'var(--radius-sm)',
        }}>
          推荐
        </div>
      )}
      <div style={{ fontSize: 28, marginBottom: 8 }}>
        {icons[spread.id] || '🃏'}
      </div>
      <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 4 }}>
        {spread.name_zh}
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-dim)', marginLeft: 8 }}>
          {spread.card_count}张牌
        </span>
      </h3>
      <p style={{ color: 'var(--color-text-dim)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
        {spread.description}
      </p>
      <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
        {spread.tags.map(tag => (
          <span key={tag} style={{
            fontSize: 'var(--text-sm)', color: 'var(--color-accent)',
            background: 'rgba(167,139,250,0.1)', padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
          }}>
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
