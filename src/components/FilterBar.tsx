import React, { useState } from 'react';
import { DimensionFilter, SubCollectionFilter, StackLimitFilter } from '../types/minecraft';

interface FilterBarProps {
  dimension: DimensionFilter;
  subCollection: SubCollectionFilter;
  stackLimit: StackLimitFilter;
  matchingCount: number;
  onSelectDimension: (d: DimensionFilter) => void;
  onSelectSubCollection: (s: SubCollectionFilter) => void;
  onSelectStackLimit: (limit: StackLimitFilter) => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  dimension,
  subCollection,
  stackLimit,
  matchingCount,
  onSelectDimension,
  onSelectSubCollection,
  onSelectStackLimit,
  onResetFilters
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters =
    dimension !== 'all' || subCollection !== 'all' || stackLimit !== 'all';

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '412px',
        backgroundColor: 'rgba(20, 16, 12, 0.88)',
        border: '2px solid #373737',
        borderRadius: '2px',
        padding: '6px 8px',
        marginBottom: '6px',
        boxSizing: 'border-box'
      }}
    >
      {/* Toggle header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: '#7df53b', fontWeight: 'bold' }}>
            🏷 Tags & Dimensions
          </span>
          {hasActiveFilters && (
            <span
              style={{
                fontSize: '10px',
                backgroundColor: '#d35400',
                color: '#fff',
                padding: '1px 5px',
                borderRadius: '2px'
              }}
            >
              Filters Active
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#aaaaaa' }}>{matchingCount} items</span>
          <span style={{ fontSize: '11px', color: '#7df53b' }}>{isOpen ? '▲ Hide' : '▼ Expand'}</span>
        </div>
      </div>

      {/* Expanded Filter Options */}
      {isOpen && (
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #444' }}>
          {/* Dimension Selector */}
          <div style={{ marginBottom: '6px' }}>
            <div style={{ fontSize: '10px', color: '#888', marginBottom: '2px' }}>
              DIMENSION:
            </div>
            <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
              <button
                className={`mc-btn ${dimension === 'all' ? 'active' : ''}`}
                style={{ fontSize: '10px', padding: '2px 6px' }}
                onClick={() => onSelectDimension('all')}
              >
                All Dimensions
              </button>
              <button
                className={`mc-btn ${dimension === 'overworld' ? 'active mc-btn-green' : ''}`}
                style={{ fontSize: '10px', padding: '2px 6px' }}
                onClick={() => onSelectDimension('overworld')}
              >
                🌲 Overworld
              </button>
              <button
                className={`mc-btn ${dimension === 'nether' ? 'active mc-btn-red' : ''}`}
                style={{ fontSize: '10px', padding: '2px 6px' }}
                onClick={() => onSelectDimension('nether')}
              >
                🔥 The Nether
              </button>
              <button
                className={`mc-btn ${dimension === 'end' ? 'active' : ''}`}
                style={{ fontSize: '10px', padding: '2px 6px' }}
                onClick={() => onSelectDimension('end')}
              >
                🌌 The End
              </button>
            </div>
          </div>

          {/* Sub-Collection Selector */}
          <div style={{ marginBottom: '6px' }}>
            <div style={{ fontSize: '10px', color: '#888', marginBottom: '2px' }}>
              SPECIAL SUB-COLLECTIONS:
            </div>
            <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
              <button
                className={`mc-btn ${subCollection === 'all' ? 'active' : ''}`}
                style={{ fontSize: '10px', padding: '2px 5px' }}
                onClick={() => onSelectSubCollection('all')}
              >
                All
              </button>
              <button
                className={`mc-btn ${subCollection === 'armor_trims_sherds' ? 'active' : ''}`}
                style={{ fontSize: '10px', padding: '2px 5px' }}
                onClick={() => onSelectSubCollection('armor_trims_sherds')}
              >
                🛡 Trims & Sherds
              </button>
              <button
                className={`mc-btn ${subCollection === 'mob_drops_trophies' ? 'active' : ''}`}
                style={{ fontSize: '10px', padding: '2px 5px' }}
                onClick={() => onSelectSubCollection('mob_drops_trophies')}
              >
                💀 Mob Drops
              </button>
              <button
                className={`mc-btn ${subCollection === 'ores_minerals' ? 'active' : ''}`}
                style={{ fontSize: '10px', padding: '2px 5px' }}
                onClick={() => onSelectSubCollection('ores_minerals')}
              >
                ⛏ Ores & Minerals
              </button>
              <button
                className={`mc-btn ${subCollection === 'flora_agriculture' ? 'active' : ''}`}
                style={{ fontSize: '10px', padding: '2px 5px' }}
                onClick={() => onSelectSubCollection('flora_agriculture')}
              >
                🌾 Flora & Crops
              </button>
              <button
                className={`mc-btn ${subCollection === 'enchantments_potions' ? 'active' : ''}`}
                style={{ fontSize: '10px', padding: '2px 5px' }}
                onClick={() => onSelectSubCollection('enchantments_potions')}
              >
                🧪 Potions & Books
              </button>
            </div>
          </div>

          {/* Stack Limit Selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#888', marginBottom: '2px' }}>
                STACK LIMIT:
              </div>
              <div style={{ display: 'flex', gap: '3px' }}>
                <button
                  className={`mc-btn ${stackLimit === 'all' ? 'active' : ''}`}
                  style={{ fontSize: '10px', padding: '2px 6px' }}
                  onClick={() => onSelectStackLimit('all')}
                >
                  All
                </button>
                <button
                  className={`mc-btn ${stackLimit === 64 ? 'active' : ''}`}
                  style={{ fontSize: '10px', padding: '2px 6px' }}
                  onClick={() => onSelectStackLimit(64)}
                >
                  64x
                </button>
                <button
                  className={`mc-btn ${stackLimit === 16 ? 'active' : ''}`}
                  style={{ fontSize: '10px', padding: '2px 6px' }}
                  onClick={() => onSelectStackLimit(16)}
                >
                  16x
                </button>
                <button
                  className={`mc-btn ${stackLimit === 1 ? 'active' : ''}`}
                  style={{ fontSize: '10px', padding: '2px 6px' }}
                  onClick={() => onSelectStackLimit(1)}
                >
                  1x (Non-stackable)
                </button>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                className="mc-btn mc-btn-red"
                style={{ fontSize: '10px', padding: '3px 8px', alignSelf: 'flex-end' }}
                onClick={onResetFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
