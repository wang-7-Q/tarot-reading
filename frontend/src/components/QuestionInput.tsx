import { useState } from 'react';

interface Props {
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

export default function QuestionInput({ onSubmit, isLoading }: Props) {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (trimmed && !isLoading) {
      onSubmit(trimmed);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 480 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="请输入你的问题..."
          autoFocus
          disabled={isLoading}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={!question.trim() || isLoading}>
          {isLoading ? <span className="spinner" /> : '🔮'}
        </button>
      </div>
    </form>
  );
}
