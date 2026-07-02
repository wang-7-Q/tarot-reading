import type { Spread } from '../types';

interface Props {
  spread: Spread;
  children: React.ReactNode[];
}

export default function SpreadLayout({ spread, children }: Props) {
  if (spread.id === 'single-card') {
    return (
      <div className="spread-layout single-card">
        <div className="spread-position">
          {children[0]}
          <span className="spread-position-label">{spread.positions[0].label}</span>
        </div>
      </div>
    );
  }

  if (spread.id === 'three-card') {
    return (
      <div className="spread-layout three-card">
        {children.map((child, i) => (
          <div key={i} className="spread-position">
            {child}
            <span className="spread-position-label">
              {spread.positions[i].label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (spread.id === 'relationship') {
    const positions = [
      { col: 1, row: 1 }, { col: 3, row: 1 },
      { col: 2, row: 1 },
      { col: 1, row: 2 }, { col: 3, row: 2 },
      { col: 2, row: 2 },
      { col: 2, row: 3 },
    ];
    return (
      <div className="spread-layout relationship">
        {children.map((child, i) => (
          <div
            key={i}
            className="spread-position"
            style={{ gridColumn: positions[i].col, gridRow: positions[i].row }}
          >
            {child}
            <span className="spread-position-label">
              {spread.positions[i].label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Celtic Cross: grid layout
  return (
    <div className="spread-layout celtic-cross">
      {children.map((child, i) => (
        <div key={i} className="spread-position">
          {child}
          <span className="spread-position-label">
            {spread.positions[i].label}
          </span>
        </div>
      ))}
    </div>
  );
}
