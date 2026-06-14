import { motion } from 'framer-motion';

interface Props {
  narrative: string;
}

export default function NarrativeBlock({ narrative }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="card-surface card-glow"
    >
      <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 12 }}>📖 整体叙事</h3>
      <p style={{ lineHeight: 2, color: 'var(--color-text)', fontSize: 'var(--text-base)' }}>
        {narrative.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < narrative.split('\n').length - 1 && <br />}
          </span>
        ))}
      </p>
    </motion.div>
  );
}
