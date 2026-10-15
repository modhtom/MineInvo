import React, { useRef, useEffect, useCallback } from 'react';

interface MinecraftScrollbarProps {
  totalRows: number;
  visibleRows: number;
  currentRow: number;
  trackHeight: number;
  onScrollRow: (newRow: number) => void;
}

export const MinecraftScrollbar: React.FC<MinecraftScrollbarProps> = ({
  totalRows,
  visibleRows,
  currentRow,
  trackHeight,
  onScrollRow
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startRowRef = useRef(0);

  const maxRow = Math.max(0, totalRows - visibleRows);
  const isScrollable = maxRow > 0;

  // Authentic Minecraft scroll thumb height
  const thumbHeight = 28;
  const availableTrack = trackHeight - thumbHeight - 4; // 2px padding top/bottom

  // Thumb top offset in pixels
  const thumbTop = isScrollable
    ? Math.round((currentRow / maxRow) * availableTrack) + 2
    : 2;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isScrollable) return;
    e.preventDefault();
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startRowRef.current = currentRow;
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    if (!isScrollable || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const clickFraction = Math.max(0, Math.min(1, clickY / trackHeight));
    const targetRow = Math.round(clickFraction * maxRow);
    onScrollRow(targetRow);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current || !isScrollable) return;
      const deltaY = e.clientY - startYRef.current;
      const rowDelta = (deltaY / availableTrack) * maxRow;
      const newRow = Math.max(0, Math.min(maxRow, Math.round(startRowRef.current + rowDelta)));
      onScrollRow(newRow);
    },
    [isScrollable, availableTrack, maxRow, onScrollRow]
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={trackRef}
      onClick={handleTrackClick}
      style={{
        width: '14px',
        height: `${trackHeight}px`,
        backgroundColor: '#8b8b8b',
        border: '2px solid #373737',
        borderRightColor: '#ffffff',
        borderBottomColor: '#ffffff',
        position: 'relative',
        cursor: isScrollable ? 'pointer' : 'default',
        boxSizing: 'border-box',
        flexShrink: 0
      }}
      title={isScrollable ? 'Scroll items' : 'All items visible'}
    >
      {/* Scroll Thumb */}
      <div
        onMouseDown={handleMouseDown}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '10px',
          height: `${thumbHeight}px`,
          position: 'absolute',
          top: `${thumbTop}px`,
          left: '0px',
          backgroundColor: isScrollable ? '#c6c6c6' : '#8b8b8b',
          border: '2px solid #ffffff',
          borderRightColor: '#373737',
          borderBottomColor: '#373737',
          boxShadow: isScrollable ? 'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #555555' : 'none',
          cursor: isScrollable ? 'grab' : 'default',
          opacity: isScrollable ? 1 : 0.4
        }}
      />
    </div>
  );
};
