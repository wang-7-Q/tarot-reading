import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SpreadLayout from '../components/SpreadLayout';
import CardDeck from '../components/CardDeck';
import FlipReveal from '../components/FlipReveal';
import StepIndicator from '../components/StepIndicator';
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
    if (!spread) {
      setError('牌阵信息丢失，请返回重新选择');
      return;
    }
    setIsInterpreting(true);
    setError('');

    const question = session.question || '请为我解读这些塔罗牌';
    const validCards = drawn.filter(Boolean) as DrawnCardWithData[];
    setDrawnCards(validCards);

    try {
      const result = await interpretReading(
        question,
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
      setError('AI 解读失败，请查看后端终端日志排查');
    } finally {
      setIsInterpreting(false);
    }
  };

  if (!spread) return null;

  return (
    <div className="page page-stack">
      <motion.div
        className="page-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <StepIndicator active="draw" />
        <h2 className="page-title">{spread.name_zh}</h2>
        <p className="page-subtitle">
          请依次抽取 {spread.card_count} 张牌，抽完后点按牌面翻开。
        </p>
      </motion.div>

      {error && <div className="error-banner">{error}</div>}

      <section className="draw-stage" aria-label="当前牌阵">
        <SpreadLayout spread={spread}>
          {drawn.map((card, i) => (
            <div key={i}>
              {card ? (
                <div className="drawn-card">
                  <FlipReveal
                    card={card.card}
                    reversed={card.reversed}
                    label={spread.positions[i].label}
                    isRevealed={revealed.has(i)}
                    onReveal={() => handleReveal(i)}
                  />
                  {revealed.has(i) && (
                    <motion.div
                      className="drawn-card-note"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="drawn-card-name">
                        <span>{card.card.name_zh}</span>
                        <strong>{card.reversed ? '逆位' : '正位'}</strong>
                      </div>
                      <p className="drawn-card-keywords">
                        {(card.reversed ? card.card.keywords_reversed : card.card.keywords_upright).slice(0, 3).join(' · ')}
                      </p>
                      <p className="drawn-card-meaning">
                        {card.card.description}
                      </p>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="card-placeholder">
                  ?
                </div>
              )}
            </div>
          ))}
        </SpreadLayout>
      </section>

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
          >
            {isInterpreting ? (
              <>
                <span className="spinner" />
                AI 解读中...
              </>
            ) : (
              '开始解读'
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
}
