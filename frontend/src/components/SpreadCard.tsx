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
      className={`card-surface spread-card ${recommended ? 'card-glow' : ''}`}
      onClick={() => onSelect(spread)}
      whileHover={{ y: -4 }}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(spread);
        }
      }}
    >
      {recommended && (
        <div className="recommended-ribbon">
          推荐
        </div>
      )}
      <div className="spread-icon">
        {icons[spread.id] || '🃏'}
      </div>
      <div className="spread-body">
        <div className="spread-title-row">
          <h3 className="spread-title">{spread.name_zh}</h3>
          <span className="spread-count">{spread.card_count} 张牌</span>
        </div>
        <p className="spread-description">
          {spread.description}
        </p>
        <div className="tag-row">
          {spread.tags.map(tag => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
