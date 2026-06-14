import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import QuestionInput from '../components/QuestionInput';
import { useReading } from '../context/ReadingContext';
import { recommendSpreads } from '../api/client';

export default function HomePage() {
  const navigate = useNavigate();
  const { setQuestion } = useReading();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (question: string) => {
    setIsLoading(true);
    setError('');
    setQuestion(question);

    try {
      const result = await recommendSpreads(question);
      navigate('/recommend', { state: { recommendations: result } });
    } catch {
      setError('无法连接到服务器，请确保后端已启动');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrowseAll = async () => {
    navigate('/recommend', { state: { recommendations: null } });
  };

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: 64, lineHeight: 1 }}
        >
          🃏
        </motion.div>

        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>塔罗指引</h1>

        <p style={{ color: 'var(--color-text-dim)', maxWidth: 360, lineHeight: 1.8 }}>
          静心思考你的问题，然后输入下方<br />
          系统将为你推荐最合适的牌阵
        </p>

        <QuestionInput onSubmit={handleSubmit} isLoading={isLoading} />

        {error && <div className="error-banner">{error}</div>}

        <button onClick={handleBrowseAll} className="btn btn-ghost" style={{ fontSize: 'var(--text-sm)' }}>
          或 手动浏览全部牌阵 →
        </button>
      </motion.div>
    </div>
  );
}
