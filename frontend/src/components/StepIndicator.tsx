interface Props {
  active: 'question' | 'spread' | 'draw' | 'reading';
}

const steps = [
  { id: 'question', label: '提问' },
  { id: 'spread', label: '选牌阵' },
  { id: 'draw', label: '抽牌' },
  { id: 'reading', label: '解读' },
] as const;

export default function StepIndicator({ active }: Props) {
  return (
    <nav className="step-indicator" aria-label="占卜流程">
      {steps.map((step, index) => (
        <span
          key={step.id}
          className={`step-pill ${step.id === active ? 'is-active' : ''}`}
          aria-current={step.id === active ? 'step' : undefined}
        >
          <span>{index + 1}</span>
          {step.label}
        </span>
      ))}
    </nav>
  );
}
