import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../services/sound';

interface XPProgressBarProps {
  collectedCount: number;
  totalCount: number;
  categoryName?: string;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  collectedCount,
  totalCount,
  categoryName
}) => {
  const percentage = totalCount > 0 ? (collectedCount / totalCount) * 100 : 0;
  const prevPercentageRef = useRef(percentage);

  // Trigger celebration when reaching 100%
  useEffect(() => {
    if (percentage >= 100 && prevPercentageRef.current < 100 && totalCount > 0) {
      sound.playLevelUp();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#7df53b', '#ffff55', '#55ffff', '#ff55ff']
      });
    }
    prevPercentageRef.current = percentage;
  }, [percentage, totalCount]);

  return (
    <div style={{ width: '100%', maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '6px',
          fontSize: '13px',
          color: '#e0e0e0',
          textShadow: '1px 1px 0px #000000'
        }}
      >
        <span>
          {categoryName ? `${categoryName} Progress` : 'Total Collection Progress'}:
        </span>
        <span style={{ color: '#7df53b', fontWeight: 'bold' }}>
          {collectedCount.toLocaleString()} / {totalCount.toLocaleString()} (
          {percentage.toFixed(1)}%)
        </span>
      </div>

      <div className="mc-xp-container" style={{ position: 'relative' }}>
        <div
          className="mc-xp-fill"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
        {/* Minecraft Level Number above the bar */}
        <div className="mc-xp-level">{collectedCount}</div>
      </div>
    </div>
  );
};
