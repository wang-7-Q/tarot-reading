import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NarrativeBlock from '../components/NarrativeBlock';
import IndividualReading from '../components/IndividualReading';
import GuidanceBlock from '../components/GuidanceBlock';
import ActionBar from '../components/ActionBar';
import { useReading } from '../context/ReadingContext';

export default function InterpretPage() {
  const navigate = useNavigate();
  const { session, resetSession } = useReading();
  const { interpretation, spread, question } = session;

  if (!interpretation || !spread) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p style={{ color: 'var(--color-text-dim)' }}>没有解读结果，请先完成抽牌</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', marginBottom: 8 }}
        >
          <h2 style={{ fontSize: 'var(--text-xl)' }}>{spread.name_zh} · 解读</h2>
          <p style={{ color: 'var(--color-text-dim)', marginTop: 4 }}>「{question}」</p>
        </motion.div>

        <NarrativeBlock narrative={interpretation.narrative} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {interpretation.individual.map((reading, i) => (
            <IndividualReading key={i} reading={reading} index={i} />
          ))}
        </div>

        <GuidanceBlock guidance={interpretation.guidance} />

        <div style={{ marginTop: 8 }}>
          <ActionBar
            onReshuffle={() => navigate('/draw')}
            onNewReading={() => {
              resetSession();
              navigate('/');
            }}
          />
        </div>
      </div>
    </div>
  );
}
