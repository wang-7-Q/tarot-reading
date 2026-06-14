import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SpreadCard from '../components/SpreadCard';
import { useReading } from '../context/ReadingContext';
import { fetchSpreads } from '../api/client';
import type { Spread, RecommendResponse } from '../types';

export default function RecommendPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, setSpread } = useReading();
  const [allSpreads, setAllSpreads] = useState<Spread[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const recs = (location.state as any)?.recommendations as RecommendResponse | null;
    setRecommendations(recs);

    fetchSpreads()
      .then(setAllSpreads)
      .catch(() => setError('加载牌阵失败'));
  }, [location.state]);

  const handleSelect = (spread: Spread) => {
    setSpread(spread);
    navigate('/draw');
  };

  const displayedSpreads = recommendations ? recommendations.spreads : allSpreads;

  return (
    <div className="page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 4 }}>选择牌阵</h2>
        {session.question && (
          <p style={{ color: 'var(--color-text-dim)', marginBottom: 24 }}>
            针对「{session.question}」推荐以下牌阵：
          </p>
        )}
        {!session.question && (
          <p style={{ color: 'var(--color-text-dim)', marginBottom: 24 }}>
            浏览全部可用牌阵：
          </p>
        )}

        {error && <div className="error-banner" style={{ marginBottom: 16 }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {displayedSpreads.map((spread, i) => (
            <SpreadCard
              key={spread.id}
              spread={spread}
              recommended={recommendations !== null && i === 0}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <button onClick={() => navigate('/')} className="btn btn-ghost" style={{ marginTop: 24 }}>
          ← 返回重新提问
        </button>
      </motion.div>
    </div>
  );
}
