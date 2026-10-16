import React from 'react';
import { MinecraftItem } from '../types/minecraft';

interface RecipeModalProps {
  item: MinecraftItem | null;
  isOpen: boolean;
  isCollected: boolean;
  isPinned: boolean;
  itemMap: Map<string, MinecraftItem>;
  onClose: () => void;
  onToggleCollect: (item: MinecraftItem) => void;
  onTogglePin: (item: MinecraftItem) => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({
  item,
  isOpen,
  isCollected,
  isPinned,
  itemMap,
  onClose,
  onToggleCollect,
  onTogglePin
}) => {
  if (!isOpen || !item) return null;

  const recipe = item.recipe;

  // Helper to render 3x3 crafting grid
  const renderCraftingGrid = () => {
    if (!recipe) return null;

    if (recipe.type === 'shaped' && recipe.grid) {
      // Pad or normalize to 3x3
      const grid3x3: (string | null)[][] = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
      ];

      for (let r = 0; r < Math.min(3, recipe.grid.length); r++) {
        for (let c = 0; c < Math.min(3, recipe.grid[r].length); c++) {
          grid3x3[r][c] = recipe.grid[r][c];
        }
      }

      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 40px)', gap: '2px' }}>
          {grid3x3.flatMap((row, rIdx) =>
            row.map((ingId, cIdx) => {
              const ingItem = ingId ? itemMap.get(ingId) : null;
              return (
                <div
                  key={`craft-${rIdx}-${cIdx}`}
                  className="mc-slot"
                  style={{ width: '40px', height: '40px' }}
                  title={ingItem ? ingItem.name : 'Empty'}
                >
                  {ingItem ? (
                    <img
                      src={ingItem.texture}
                      alt={ingItem.name}
                      style={{ width: '30px', height: '30px' }}
                    />
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      );
    }

    if (recipe.type === 'shapeless' && recipe.ingredients) {
      return (
        <div>
          <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
            Shapeless Ingredients:
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {recipe.ingredients.map((ingId, idx) => {
              const ingItem = itemMap.get(ingId);
              return (
                <div
                  key={`shapeless-${idx}`}
                  className="mc-slot"
                  style={{ width: '40px', height: '40px' }}
                  title={ingItem ? ingItem.name : ingId}
                >
                  {ingItem ? (
                    <img
                      src={ingItem.texture}
                      alt={ingItem.name}
                      style={{ width: '30px', height: '30px' }}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div
        className="mc-modal-content"
        style={{ maxWidth: '520px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with item icon, name, and badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #a0a0a0',
            paddingBottom: '10px',
            marginBottom: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="mc-slot" style={{ width: '46px', height: '46px', cursor: 'default' }}>
              <img
                src={item.texture}
                alt={item.name}
                style={{ width: '36px', height: '36px', imageRendering: 'pixelated' }}
              />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', color: '#2a2a2a' }}>{item.name}</h2>
              <div style={{ fontSize: '11px', color: '#666666' }}>
                {item.id} • {item.categoryName}
              </div>
            </div>
          </div>

          <button className="mc-btn" onClick={onClose} style={{ padding: '2px 8px', fontSize: '14px' }}>
            ✕
          </button>
        </div>

        {/* Dimension & Stack Info Badges */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {item.dimension === 'overworld' && (
            <span
              style={{
                fontSize: '11px',
                backgroundColor: '#27ae60',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '2px',
                fontWeight: 'bold',
                textShadow: '1px 1px 0px #000'
              }}
            >
              🌲 Overworld
            </span>
          )}
          {item.dimension === 'nether' && (
            <span
              style={{
                fontSize: '11px',
                backgroundColor: '#c0392b',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '2px',
                fontWeight: 'bold',
                textShadow: '1px 1px 0px #000'
              }}
            >
              🔥 The Nether
            </span>
          )}
          {item.dimension === 'end' && (
            <span
              style={{
                fontSize: '11px',
                backgroundColor: '#8e44ad',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '2px',
                fontWeight: 'bold',
                textShadow: '1px 1px 0px #000'
              }}
            >
              🌌 The End
            </span>
          )}

          <span
            style={{
              fontSize: '11px',
              backgroundColor: '#555555',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '2px',
              textShadow: '1px 1px 0px #000'
            }}
          >
            Stack: {item.stackSize}x
          </span>

          {item.subCollection && (
            <span
              style={{
                fontSize: '11px',
                backgroundColor: '#d35400',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '2px',
                textShadow: '1px 1px 0px #000'
              }}
            >
              ⭐{' '}
              {item.subCollection === 'armor_trims_sherds'
                ? 'Armor Trims & Sherds'
                : item.subCollection === 'mob_drops_trophies'
                ? 'Mob Drop / Trophy'
                : item.subCollection === 'ores_minerals'
                ? 'Ores & Minerals'
                : item.subCollection === 'flora_agriculture'
                ? 'Flora & Crops'
                : 'Enchantments & Potions'}
            </span>
          )}
        </div>

        {/* Crafting Recipe Area */}
        <div
          style={{
            backgroundColor: '#a8a8a8',
            border: '2px solid #555',
            padding: '12px',
            borderRadius: '2px',
            marginBottom: '14px'
          }}
        >
          <div
            style={{
              fontSize: '13px',
              color: '#1a1a1a',
              fontWeight: 'bold',
              marginBottom: '8px'
            }}
          >
            Crafting Recipe:
          </div>

          {recipe ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {renderCraftingGrid()}

              <div style={{ fontSize: '20px', color: '#333333' }}>➡</div>

              <div
                className="mc-slot"
                style={{ width: '48px', height: '48px', position: 'relative' }}
                title={`${item.name} (${recipe.resultCount || 1})`}
              >
                <img
                  src={item.texture}
                  alt={item.name}
                  style={{ width: '36px', height: '36px' }}
                />
                {(recipe.resultCount || 1) > 1 && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '3px',
                      fontSize: '12px',
                      color: '#ffffff',
                      textShadow: '1px 1px 0px #000',
                      fontWeight: 'bold'
                    }}
                  >
                    {recipe.resultCount}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: '#444444', fontStyle: 'italic' }}>
              ℹ Not directly crafted on a crafting grid. Sourced naturally from the world.
            </div>
          )}
        </div>

        {/* How to Obtain / Sourcing Guide */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '13px',
              color: '#1a1a1a',
              fontWeight: 'bold',
              marginBottom: '4px'
            }}
          >
            🗺 How to Obtain:
          </div>
          <div
            style={{
              fontSize: '12px',
              color: '#333333',
              lineHeight: 1.5,
              backgroundColor: '#dedede',
              padding: '8px 10px',
              border: '1px solid #999',
              borderRadius: '2px'
            }}
          >
            {item.source}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className={`mc-btn ${isCollected ? 'mc-btn-green' : ''}`}
              onClick={() => onToggleCollect(item)}
            >
              {isCollected ? '✔ Collected' : '+ Mark Collected'}
            </button>
            <button className="mc-btn" onClick={() => onTogglePin(item)}>
              {isPinned ? '★ Pinned to Hotbar' : '☆ Pin to Hotbar'}
            </button>
          </div>

          <button className="mc-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
