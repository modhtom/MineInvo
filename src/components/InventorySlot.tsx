import React from 'react';
import { MinecraftItem, VisualStyle } from '../types/minecraft';

interface InventorySlotProps {
  item: MinecraftItem;
  isCollected: boolean;
  isPinned: boolean;
  visualStyle: VisualStyle;
  onToggleCollect: (item: MinecraftItem) => void;
  onTogglePin: (item: MinecraftItem) => void;
  onHover: (item: MinecraftItem, e: React.MouseEvent) => void;
  onLeave: () => void;
}

export const InventorySlot: React.FC<InventorySlotProps> = ({
  item,
  isCollected,
  isPinned,
  visualStyle,
  onToggleCollect,
  onTogglePin,
  onHover,
  onLeave
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      e.preventDefault();
      onTogglePin(item);
    } else {
      onToggleCollect(item);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onTogglePin(item);
  };

  return (
    <div
      className={`mc-slot ${isCollected ? 'collected' : 'uncollected'} style-${visualStyle}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={(e) => onHover(item, e)}
      onMouseMove={(e) => onHover(item, e)}
      onMouseLeave={onLeave}
      title=""
    >
      <img
        src={item.texture}
        alt={item.name}
        className={`mc-item-icon style-${visualStyle}`}
        loading="lazy"
        draggable={false}
      />

      {/* Checkmark badge */}
      {isCollected && visualStyle === 'checkmark' && (
        <span className="mc-collected-badge">✔</span>
      )}

      {/* Operator block indicator */}
      {item.isOperator && (
        <span className="mc-op-indicator" title="Technical item">
          *
        </span>
      )}

      {/* Pinned pin indicator */}
      {isPinned && (
        <span
          style={{
            position: 'absolute',
            top: '1px',
            right: '2px',
            fontSize: '9px',
            color: '#ffff55',
            textShadow: '1px 1px 0px #000000'
          }}
          title="Pinned to hotbar"
        >
          ★
        </span>
      )}
    </div>
  );
};
