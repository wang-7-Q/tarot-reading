import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NarrativeBlock from '../components/NarrativeBlock';
import IndividualReading from '../components/IndividualReading';
import GuidanceBlock from '../components/GuidanceBlock';
import ActionBar from '../components/ActionBar';
import StepIndicator from '../components/StepIndicator';
import { useReading } from '../context/ReadingContext';

export default function InterpretPage() {
  const navigate = useNavigate();
  const { session, resetSession } = useReading();
  const { interpretation, spread, question } = session;

  if (!interpretation || !spread) {
    return (
      <div className="page page-center" style={{ flexDirection: 'column', gap: 16 }}>
        <p style={{ color: 'var(--color-text-muted)' }}>没有解读结果，请先完成抽牌</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="page page-stack">
        <motion.div
          className="page-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <StepIndicator active="reading" />
          <h2 className="page-title">{spread.name_zh} · 解读</h2>
          <p className="page-subtitle">「{question}」</p>
        </motion.div>

        <div className="reading-grid">
          <div className="reading-stack">
            <NarrativeBlock narrative={interpretation.narrative} />

            <div className="reading-stack">
              {interpretation.individual.map((reading, i) => (
                <IndividualReading key={i} reading={reading} index={i} />
              ))}
            </div>
          </div>

          <GuidanceBlock guidance={interpretation.guidance} />
        </div>

        <ActionBar
          onReshuffle={() => navigate('/draw')}
          onNewReading={() => {
            resetSession();
            navigate('/');
          }}
        />
    </div>
  );
}
