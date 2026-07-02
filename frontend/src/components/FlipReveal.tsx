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
      className="tarot-card"
      onClick={!isRevealed ? onReveal : undefined}
      role={!isRevealed ? 'button' : undefined}
      tabIndex={!isRevealed ? 0 : undefined}
      onKeyDown={(event) => {
        if (!isRevealed && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onReveal();
        }
      }}
      style={{ cursor: isRevealed ? 'default' : 'pointer' }}
    >
      <motion.div
        className="tarot-card-inner"
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="tarot-card-face tarot-card-back">
          ✦
        </div>

        <div className={`tarot-card-face tarot-card-front ${reversed ? 'is-reversed' : ''}`}>
          {reversed && (
            <div className="reverse-badge">
              逆位
            </div>
          )}
          <div className="tarot-symbol" style={{ marginTop: reversed ? 10 : 0 }}>✧</div>
          <div className="tarot-name">{card.name_zh}</div>
          <div className="tarot-en">{card.name_en}</div>
          <div className="tarot-position">
            {label}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
