import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SpreadLayout from '../components/SpreadLayout';
import CardDeck from '../components/CardDeck';
import FlipReveal from '../components/FlipReveal';
import { useReading } from '../context/ReadingContext';
import { drawCards, interpretReading } from '../api/client';
import type { DrawnCardWithData } from '../types';

export default function DrawPage() {
  const navigate = useNavigate();
  const { session, setDrawnCards, setInterpretation } = useReading();
  const [availableCards, setAvailableCards] = useState<DrawnCardWithData[]>([]);
  const [drawn, setDrawn] = useState<(DrawnCardWithData | null)[]>([]);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [isShuffling, setIsShuffling] = useState(false);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [error, setError] = useState('');

  const spread = session.spread;

  useEffect(() => {
    let cancelled = false;
    if (!spread) {
      navigate('/');
      return;
    }
    drawCards(spread.id, spread.card_count)
      .then(result => {
        if (cancelled) return;
        setAvailableCards(result.cards);
        setDrawn(new Array(spread.card_count).fill(null));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Load cards failed:', err);
        setError('加载牌堆失败');
      });
    return () => { cancelled = true; };
  }, [spread, navigate]);

  const handleShuffle = useCallback(() => {
    let cancelled = false;
    setIsShuffling(true);
    if (spread) {
      drawCards(spread.id, spread.card_count)
        .then(result => {
          if (cancelled) return;
          setAvailableCards(result.cards);
          setDrawn(new Array(spread.card_count).fill(null));
          setRevealed(new Set());
          setIsShuffling(false);
        })
        .catch((err) => {
          if (cancelled) return;
          console.error('Shuffle failed:', err);
          setError('洗牌失败');
          setIsShuffling(false);
        });
    }
    return () => { cancelled = true; };
  }, [spread]);

  const handleDraw = useCallback(() => {
    if (!spread) return;
    const nextEmpty = drawn.findIndex(d => d === null);
    if (nextEmpty === -1 || availableCards.length === 0) return;

    const newCard = availableCards[availableCards.length - 1];
    setAvailableCards(prev => prev.slice(0, -1));
    setDrawn(prev => {
      const next = [...prev];
      next[nextEmpty] = newCard;
      return next;
    });
  }, [drawn, availableCards, spread]);

  const handleReveal = useCallback((index: number) => {
    setRevealed(prev => new Set([...prev, index]));
  }, []);

  const allDrawn = drawn.every(d => d !== null);
  const allRevealed = spread && revealed.size === spread.card_count;

  const handleInterpret = async () => {
    if (!spread || !session.question) return;
    setIsInterpreting(true);
    setError('');

    const validCards = drawn.filter(Boolean) as DrawnCardWithData[];
    setDrawnCards(validCards);

    try {
      const result = await interpretReading(
        session.question,
        spread.id,
        validCards.map(c => ({
          position_index: c.position_index,
          card_id: c.card.id,
          reversed: c.reversed,
        }))
      );
      setInterpretation(result);
      navigate('/interpret');
    } catch (err) {
      console.error('Interpret failed:', err);
      setError('AI 解读请求失败，请确保 ANTHROPIC_API_KEY 已配置且后端已启动');
    } finally {
      setIsInterpreting(false);
    }
  };

  if (!spread) return null;

  return (
    <div className="page">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 4 }}>{spread.name_zh}</h2>
          <p style={{ color: 'var(--color-text-dim)' }}>请抽取 {spread.card_count} 张牌</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <SpreadLayout spread={spread}>
          {drawn.map((card, i) => (
            <div key={i} style={{ minHeight: 146 }}>
              {card ? (
                <FlipReveal
                  card={card.card}
                  reversed={card.reversed}
                  label={spread.positions[i].label}
                  isRevealed={revealed.has(i)}
                  onReveal={() => handleReveal(i)}
                />
              ) : (
                <div style={{
                  width: 100, height: 146,
                  border: '2px dashed var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-text-dim)', fontSize: 28,
                }}>
                  ?
                </div>
              )}
            </div>
          ))}
        </SpreadLayout>

        {!allDrawn && (
          <CardDeck
            onShuffle={handleShuffle}
            onDraw={handleDraw}
            remaining={availableCards.length}
            isShuffling={isShuffling}
          />
        )}

        {allRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center' }}
          >
            <button
              onClick={handleInterpret}
              className="btn btn-primary"
              disabled={isInterpreting}
              style={{ fontSize: 'var(--text-lg)', padding: '16px 48px' }}
            >
              {isInterpreting ? (
                <>
                  <span className="spinner" />
                  AI 解读中...
                </>
              ) : (
                '✨ 开始解读'
              )}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
