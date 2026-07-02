import { motion } from 'framer-motion';

interface Props {
  onShuffle: () => void;
  onDraw: () => void;
  remaining: number;
  isShuffling: boolean;
}

export default function CardDeck({ onShuffle, onDraw, remaining, isShuffling }: Props) {
  return (
    <div className="deck-shell">
      <div className="deck-stack" aria-hidden="true">
        {Array.from({ length: Math.min(remaining, 5) }).map((_, i) => (
          <motion.div
            key={i}
            animate={isShuffling ? { x: [0, -20, 30, -10, 0], rotate: [-5, 5, -3, 2, 0] } : {}}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="deck-card"
            style={{ top: i * 2, left: i * 2 }}
          >
            ✦
          </motion.div>
        ))}
      </div>

      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
        剩余 {remaining} 张牌
      </p>

      <div className="deck-actions">
        <button onClick={onShuffle} className="btn btn-ghost" disabled={isShuffling}>
          洗牌
        </button>
        <button onClick={onDraw} className="btn btn-primary" disabled={remaining === 0 || isShuffling}>
          抽牌
        </button>
      </div>
    </div>
  );
}
