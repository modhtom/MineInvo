import React, { useRef } from 'react';
import { MinecraftItem, VisualStyle } from '../types/minecraft';
import { InventorySlot } from './InventorySlot';
import { MinecraftScrollbar } from './MinecraftScrollbar';

interface InventoryGridProps {
  items: MinecraftItem[];
  collectedSet: Set<string>;
  pinnedSet: Set<string>;
  visualStyle: VisualStyle;
  rowOffset: number;
  onScrollRow: (newRow: number) => void;
  searchQuery: string;
  onToggleCollect: (item: MinecraftItem) => void;
  onTogglePin: (item: MinecraftItem) => void;
  onHoverItem: (item: MinecraftItem, e: React.MouseEvent) => void;
  onLeaveItem: () => void;
  onClearSearch: () => void;
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({
  items,
  collectedSet,
  pinnedSet,
  visualStyle,
  rowOffset,
  onScrollRow,
  searchQuery,
  onToggleCollect,
  onTogglePin,
  onHoverItem,
  onLeaveItem,
  onClearSearch
}) => {
  const visibleCols = 9;
  const visibleRows = 5;
  const pageSize = visibleCols * visibleRows; // 45 slots

  const totalRows = Math.ceil(items.length / visibleCols);
  const maxRowOffset = Math.max(0, totalRows - visibleRows);

  const touchStartY = useRef<number | null>(null);

  // Wheel event for desktop mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (totalRows <= visibleRows) return;
    e.preventDefault();
    if (e.deltaY > 0) {
      onScrollRow(Math.min(maxRowOffset, rowOffset + 1));
    } else if (e.deltaY < 0) {
      onScrollRow(Math.max(0, rowOffset - 1));
    }
  };

  // Touch swipe support for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null || totalRows <= visibleRows) return;
    const deltaY = touchStartY.current - e.touches[0].clientY;
    // Step by 1 row for every 20px of swipe
    if (Math.abs(deltaY) > 20) {
      if (deltaY > 0) {
        onScrollRow(Math.min(maxRowOffset, rowOffset + 1));
      } else {
        onScrollRow(Math.max(0, rowOffset - 1));
      }
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
  };

  // Slice exactly 45 items for the 9x5 window
  const startIndex = rowOffset * visibleCols;
  const displayItems = items.slice(startIndex, startIndex + pageSize);
  const emptySlotCount = Math.max(0, pageSize - displayItems.length);

  // Empty search state
  if (items.length === 0) {
    return (
      <div
        style={{
          width: '378px',
          height: '198px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: '#404040',
          textAlign: 'center',
          padding: '12px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ fontSize: '24px' }}>🔍</div>
        <div style={{ fontSize: '13px', color: '#2a2a2a', fontWeight: 'bold' }}>
          {searchQuery
            ? `No items found matching "${searchQuery}"`
            : 'No items match current filter.'}
        </div>
        <div style={{ fontSize: '11px', color: '#555555' }}>
          Try clearing search or switching filter to "All Items".
        </div>
        <button
          className="mc-btn"
          onClick={onClearSearch}
          style={{ fontSize: '11px', padding: '3px 8px', marginTop: '4px' }}
        >
          Reset Search
        </button>
      </div>
    );
  }

  return (
    <div
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '6px',
        width: '378px',
        height: '198px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        touchAction: 'none' // Prevent browser default elastic bounce while dragging inventory
      }}
    >
      {/* 9 columns x 5 rows grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, 38px)',
          gridTemplateRows: 'repeat(5, 38px)',
          gap: '2px',
          width: '358px',
          height: '198px',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {displayItems.map((item) => (
          <InventorySlot
            key={item.id}
            item={item}
            isCollected={collectedSet.has(item.id)}
            isPinned={pinnedSet.has(item.id)}
            visualStyle={visualStyle}
            onToggleCollect={onToggleCollect}
            onTogglePin={onTogglePin}
            onHover={onHoverItem}
            onLeave={onLeaveItem}
          />
        ))}

        {/* Empty placeholder slots to complete the 45 slots */}
        {Array.from({ length: emptySlotCount }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="mc-slot"
            style={{ cursor: 'default', opacity: 0.55 }}
          />
        ))}
      </div>

      {/* Dedicated Minecraft Scrollbar on the right */}
      <MinecraftScrollbar
        totalRows={totalRows}
        visibleRows={visibleRows}
        currentRow={rowOffset}
        trackHeight={198}
        onScrollRow={onScrollRow}
      />
    </div>
  );
};
