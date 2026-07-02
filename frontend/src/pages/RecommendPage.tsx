import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SpreadCard from '../components/SpreadCard';
import StepIndicator from '../components/StepIndicator';
import { useReading } from '../context/ReadingContext';
import { fetchSpreads } from '../api/client';
import type { Spread, RecommendResponse } from '../types';

interface LocationState {
  recommendations?: RecommendResponse | null;
}

export default function RecommendPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, setSpread } = useReading();
  const [allSpreads, setAllSpreads] = useState<Spread[]>([]);
  const [error, setError] = useState('');
  const state = location.state as LocationState | null;
  const recommendations = state?.recommendations ?? null;

  useEffect(() => {
    fetchSpreads()
      .then(setAllSpreads)
      .catch((err) => { console.error('Load spreads failed:', err); setError('加载牌阵失败'); });
  }, []);

  const handleSelect = (spread: Spread) => {
    setSpread(spread);
    navigate('/draw');
  };

  const displayedSpreads = recommendations ? recommendations.spreads : allSpreads;

  return (
    <div className="page page-narrow page-stack">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <StepIndicator active="spread" />
        <h2 className="page-title">选择牌阵</h2>
        {session.question && (
          <p className="page-subtitle">
            针对「{session.question}」，我为你优先排好了适合的牌阵。
          </p>
        )}
        {!session.question && (
          <p className="page-subtitle">
            浏览全部可用牌阵，选择一个最贴近当下问题的结构。
          </p>
        )}
      </motion.div>

      {error && <div className="error-banner">{error}</div>}

      <div className="spread-list">
        {displayedSpreads.map((spread, i) => (
          <SpreadCard
            key={spread.id}
            spread={spread}
            recommended={recommendations !== null && i === 0}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <button onClick={() => navigate('/')} className="btn btn-ghost">
        返回重新提问
      </button>
    </div>
  );
}
