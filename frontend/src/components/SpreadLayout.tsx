import type { Spread } from '../types';

interface Props {
  spread: Spread;
  children: React.ReactNode[];
}

export default function SpreadLayout({ spread, children }: Props) {
  if (spread.id === 'single-card') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {children[0]}
      </div>
    );
  }

  if (spread.id === 'three-card') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
        {children.map((child, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {child}
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-dim)' }}>
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 100px)',
        gridTemplateRows: 'repeat(3, auto)',
        gap: 16,
        justifyContent: 'center',
      }}>
        {children.map((child, i) => (
          <div key={i} style={{
            gridColumn: positions[i].col,
            gridRow: positions[i].row,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            {child}
            <span style={{ fontSize: 11, color: 'var(--color-text-dim)', textAlign: 'center' }}>
              {spread.positions[i].label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Celtic Cross: grid layout
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 100px)',
      gridTemplateRows: 'repeat(4, auto)',
      gap: 12,
      justifyContent: 'center',
    }}>
      {children.map((child, i) => (
        <div key={i} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          {child}
          <span style={{ fontSize: 10, color: 'var(--color-text-dim)', textAlign: 'center' }}>
            {spread.positions[i].label}
          </span>
        </div>
      ))}
    </div>
  );
}
