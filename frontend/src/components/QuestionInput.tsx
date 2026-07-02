import { useState } from 'react';

interface Props {
  onSubmit: (question: string) => void;
  isLoading: boolean;
  value?: string;
  onChange?: (question: string) => void;
}

export default function QuestionInput({ onSubmit, isLoading, value, onChange }: Props) {
  const [internalQuestion, setInternalQuestion] = useState('');
  const question = value ?? internalQuestion;

  const updateQuestion = (next: string) => {
    if (onChange) {
      onChange(next);
      return;
    }
    setInternalQuestion(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (trimmed && !isLoading) {
      onSubmit(trimmed);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="question-form">
      <div className="question-row">
        <input
          type="text"
          value={question}
          onChange={e => updateQuestion(e.target.value)}
          placeholder="写下你最想被看见的问题"
          autoFocus
          disabled={isLoading}
        />
        <button
          type="submit"
          className="btn btn-primary question-submit"
          disabled={!question.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner" />
              分析中
            </>
          ) : (
            '开始'
          )}
        </button>
      </div>
    </form>
  );
}
