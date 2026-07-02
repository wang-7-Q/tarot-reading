interface Props {
  onNewReading: () => void;
  onReshuffle: () => void;
}

export default function ActionBar({ onNewReading, onReshuffle }: Props) {
  return (
    <div className="action-bar">
      <button onClick={onReshuffle} className="btn btn-primary">
        重新抽牌
      </button>
      <button onClick={onNewReading} className="btn btn-ghost">
        新的解读
      </button>
    </div>
  );
}
