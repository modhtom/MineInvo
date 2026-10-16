import React from 'react';
import { MinecraftItem } from '../types/minecraft';

interface ItemTooltipProps {
  item: MinecraftItem | null;
  position: { x: number; y: number };
  isCollected: boolean;
  isPinned: boolean;
}

export const ItemTooltip: React.FC<ItemTooltipProps> = ({
  item,
  position,
  isCollected,
  isPinned
}) => {
  if (!item) return null;

  // Keep tooltip on screen
  const safeX = Math.min(position.x + 16, window.innerWidth - 280);
  const safeY = Math.max(10, Math.min(position.y - 30, window.innerHeight - 180));

  const isRare =
    item.id.includes('netherite') ||
    item.id.includes('golden_apple') ||
    item.id.includes('elytra') ||
    item.id.includes('trident') ||
    item.id.includes('mace') ||
    item.id.includes('dragon');

  return (
    <div
      className="mc-tooltip-container"
      style={{
        left: `${safeX}px`,
        top: `${safeY}px`
      }}
    >
      <div
        className="mc-tooltip-title"
        style={{ color: isRare ? '#ffff55' : item.isOperator ? '#ffaa00' : '#ffffff' }}
      >
        {item.name}
      </div>

      <div className="mc-tooltip-id">{item.id}</div>

      <div style={{ color: '#aaaaaa', fontSize: '11px', marginBottom: '2px' }}>
        Category: <span style={{ color: '#e0e0e0' }}>{item.categoryName}</span>
      </div>

      <div style={{ color: '#aaaaaa', fontSize: '11px', marginBottom: '4px' }}>
        Dimension:{' '}
        <span
          style={{
            color:
              item.dimension === 'nether'
                ? '#ff7777'
                : item.dimension === 'end'
                ? '#d980fa'
                : '#55ff55'
          }}
        >
          {item.dimension === 'nether'
            ? '🔥 The Nether'
            : item.dimension === 'end'
            ? '🌌 The End'
            : '🌲 Overworld'}
        </span>{' '}
        • Stack: {item.stackSize}x
      </div>

      {item.subCollection && (
        <div style={{ color: '#f39c12', fontSize: '10px', marginBottom: '2px' }}>
          ⭐ Sub-Collection:{' '}
          {item.subCollection === 'armor_trims_sherds'
            ? 'Armor Trims & Sherds'
            : item.subCollection === 'mob_drops_trophies'
            ? 'Mob Drops & Trophies'
            : item.subCollection === 'ores_minerals'
            ? 'Ores & Minerals'
            : item.subCollection === 'flora_agriculture'
            ? 'Flora & Agriculture'
            : 'Enchantments & Potions'}
        </div>
      )}

      {item.isOperator && (
        <div style={{ color: '#ffaa00', fontSize: '11px', marginTop: '2px' }}>
          ⚠ Technical / Operator Block
        </div>
      )}

      <div className="mc-tooltip-status">
        {isCollected ? (
          <span style={{ color: '#55ff55' }}>✔ Collected in world</span>
        ) : (
          <span style={{ color: '#ff7777' }}>✖ Not yet collected</span>
        )}
      </div>

      <div style={{ color: '#888888', fontSize: '10px', marginTop: '4px' }}>
        Left-click: Toggle collected • Shift-click: {isPinned ? 'Unpin' : 'Pin'}
        <br />
        <span style={{ color: '#7df53b' }}>Click Item Banner to view Crafting Recipe</span>
      </div>
    </div>
  );
};
