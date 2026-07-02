import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import QuestionInput from '../components/QuestionInput';
import StepIndicator from '../components/StepIndicator';
import { useReading } from '../context/ReadingContext';
import { recommendSpreads } from '../api/client';

const quickPrompts = [
  '这段关系接下来会如何发展？',
  '我现在的工作选择该怎么判断？',
  '最近我需要留意什么机会？',
];

export default function HomePage() {
  const navigate = useNavigate();
  const { setQuestion } = useReading();
  const [questionDraft, setQuestionDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (question: string) => {
    setIsLoading(true);
    setError('');
    setQuestion(question);

    try {
      const result = await recommendSpreads(question);
      navigate('/recommend', { state: { recommendations: result } });
    } catch (err) {
      console.error('Recommend failed:', err);
      setError('无法连接到服务器，请确保后端已启动');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrowseAll = async () => {
    navigate('/recommend', { state: { recommendations: null } });
  };

  return (
    <div className="page page-center">
      <motion.div
        className="hero-shell"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <section className="hero-copy" aria-labelledby="home-title">
          <StepIndicator active="question" />
          <div>
            <p className="eyebrow">Tarot reading</p>
            <h1 id="home-title" className="hero-title">塔罗指引</h1>
          </div>
          <p className="hero-lede">
            把一个真实的问题放到桌面上。系统会先帮你选择牌阵，再引导你抽牌、翻牌，并生成一份完整解读。
          </p>

          <div className="prompt-card">
            <QuestionInput
              onSubmit={handleSubmit}
              isLoading={isLoading}
              value={questionDraft}
              onChange={setQuestionDraft}
            />
          </div>

          <div className="quick-prompts" aria-label="快捷问题">
            {quickPrompts.map(prompt => (
              <button
                key={prompt}
                type="button"
                className="quick-prompt"
                onClick={() => setQuestionDraft(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          {error && <div className="error-banner">{error}</div>}

          <button onClick={handleBrowseAll} className="btn btn-ghost">
            浏览全部牌阵
          </button>
        </section>

        <section className="hero-panel" aria-hidden="true">
          <motion.div
            className="oracle-dial"
            animate={{ rotate: [0, 1.5, 0, -1.5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div
              className="oracle-card"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              ✦
            </motion.div>
          </motion.div>
        </section>
      </motion.div>
    </div>
  );
}
