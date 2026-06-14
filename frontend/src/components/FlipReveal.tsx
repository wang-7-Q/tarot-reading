import { motion } from 'framer-motion';
import type { TarotCard } from '../types';

interface Props {
  card: TarotCard;
  reversed: boolean;
  label: string;
  isRevealed: boolean;
  onReveal: () => void;
}

export default function FlipReveal({ card, reversed, label, isRevealed, onReveal }: Props) {
  return (
    <div
      onClick={!isRevealed ? onReveal : undefined}
      style={{
        width: 100, height: 146,
        perspective: 800,
        cursor: isRevealed ? 'default' : 'pointer',
      }}
    >
      <motion.div
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%', height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Card Back */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          background: 'linear-gradient(135deg, #2d1f5e, #1a1230)',
          border: '2px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
        }}>
          🌙
        </div>

        {/* Card Front */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: 'var(--color-surface-raised)',
          border: `2px solid ${reversed ? 'var(--color-reverse)' : 'var(--color-accent)'}`,
          borderRadius: 'var(--radius-md)',
          padding: 12,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center',
          overflow: 'hidden',
        }}>
          {reversed && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              background: 'var(--color-reverse)', color: 'white',
              fontSize: 10, padding: '2px 0',
            }}>
              逆位
            </div>
          )}
          <div style={{ fontSize: 24, marginTop: reversed ? 16 : 4 }}>🃏</div>
          <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>{card.name_zh}</div>
          <div style={{ fontSize: 10, color: 'var(--color-text-dim)' }}>{card.name_en}</div>
          <div style={{ fontSize: 10, color: 'var(--color-accent)', marginTop: 'auto', paddingBottom: 4 }}>
            {label}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
