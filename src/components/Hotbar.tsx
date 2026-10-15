import React from 'react';
import { MinecraftItem, VisualStyle } from '../types/minecraft';
import { InventorySlot } from './InventorySlot';

interface HotbarProps {
  pinnedItems: MinecraftItem[];
  collectedSet: Set<string>;
  visualStyle: VisualStyle;
  onToggleCollect: (item: MinecraftItem) => void;
  onTogglePin: (item: MinecraftItem) => void;
  onHoverItem: (item: MinecraftItem, e: React.MouseEvent) => void;
  onLeaveItem: () => void;
}

export const Hotbar: React.FC<HotbarProps> = ({
  pinnedItems,
  collectedSet,
  visualStyle,
  onToggleCollect,
  onTogglePin,
  onHoverItem,
  onLeaveItem
}) => {
  return (
    <div style={{ marginTop: '8px', width: '378px', boxSizing: 'border-box' }}>
      {/* Separator bar matching Minecraft GUI */}
      <div
        style={{
          width: '100%',
          height: '2px',
          backgroundColor: '#373737',
          borderBottom: '1px solid #ffffff',
          marginBottom: '6px'
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '4px',
          padding: '0 2px'
        }}
      >
        <span style={{ fontSize: '11px', color: '#404040' }}>
          Pinned Goals (Shift-click to pin)
        </span>
        <span style={{ fontSize: '11px', color: '#666666' }}>
          {pinnedItems.length} / 9
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, 38px)',
          gap: '2px',
          width: '358px',
          boxSizing: 'border-box'
        }}
      >
        {Array.from({ length: 9 }).map((_, index) => {
          const item = pinnedItems[index];

          if (item) {
            return (
              <InventorySlot
                key={`hotbar-${item.id}-${index}`}
                item={item}
                isCollected={collectedSet.has(item.id)}
                isPinned={true}
                visualStyle={visualStyle}
                onToggleCollect={onToggleCollect}
                onTogglePin={onTogglePin}
                onHover={onHoverItem}
                onLeave={onLeaveItem}
              />
            );
          }

          return (
            <div
              key={`empty-hotbar-${index}`}
              className="mc-slot"
              style={{
                cursor: 'default',
                color: '#666666',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Empty pin slot (Shift+Click an item to pin)"
            >
              {index + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
};
