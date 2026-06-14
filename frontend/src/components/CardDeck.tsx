import { motion } from 'framer-motion';

interface Props {
  onShuffle: () => void;
  onDraw: () => void;
  remaining: number;
  isShuffling: boolean;
}

export default function CardDeck({ onShuffle, onDraw, remaining, isShuffling }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ position: 'relative', width: 80, height: 110 }}>
        {Array.from({ length: Math.min(remaining, 5) }).map((_, i) => (
          <motion.div
            key={i}
            animate={isShuffling ? { x: [0, -20, 30, -10, 0], rotate: [-5, 5, -3, 2, 0] } : {}}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            style={{
              position: 'absolute',
              top: i * 2,
              left: i * 2,
              width: 80, height: 110,
              background: 'linear-gradient(135deg, #2d1f5e, #1a1230)',
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}
          >
            🌙
          </motion.div>
        ))}
      </div>

      <p style={{ color: 'var(--color-text-dim)', fontSize: 'var(--text-sm)' }}>
        剩余 {remaining} 张牌
      </p>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onShuffle} className="btn btn-ghost" disabled={isShuffling}>
          🔀 洗牌
        </button>
        <button onClick={onDraw} className="btn btn-primary" disabled={remaining === 0 || isShuffling}>
          🃏 抽牌
        </button>
      </div>
    </div>
  );
}
