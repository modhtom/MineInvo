import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MinecraftItem,
  CategoryId,
  FilterStatus,
  VisualStyle,
  CategoryInfo,
  CollectionData
} from './types/minecraft';
import {
  loadCollectedItems,
  saveCollectedItems,
  loadPinnedHotbar,
  savePinnedHotbar,
  loadSettings,
  saveSettings,
  exportBackup,
  resetCollection
} from './services/storage';
import { sound } from './services/sound';
import { CreativeTabs, CreativeBottomTabs, TabDefinition } from './components/CreativeTabs';
import { InventoryGrid } from './components/InventoryGrid';
import { Hotbar } from './components/Hotbar';
import { ItemTooltip } from './components/ItemTooltip';
import { XPProgressBar } from './components/XPProgressBar';
import { ResetModal, BatchActionModal, ImportModal, InfoModal } from './components/Modals';
import { LoadingScreen } from './components/LoadingScreen';

// Fallback data is loaded dynamically if fetch fails

export const App: React.FC = () => {
  // Dataset loading state
  const [itemData, setItemData] = useState<CollectionData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Collection state
  const [collectedSet, setCollectedSet] = useState<Set<string>>(() => loadCollectedItems());
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => loadPinnedHotbar());

  // Settings & View state
  const initialSettings = useMemo(() => loadSettings(), []);
  const [activeTab, setActiveTab] = useState<CategoryId | 'all'>('building_blocks');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(initialSettings.filterStatus);
  const [visualStyle, setVisualStyle] = useState<VisualStyle>(initialSettings.visualStyle);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(initialSettings.soundEnabled);
  const [includeOperator, setIncludeOperator] = useState<boolean>(initialSettings.includeOperator);

  // Row scrolling state inside the 9x5 grid (0 to maxRowOffset)
  const [rowOffset, setRowOffset] = useState(0);

  // Tooltip & Selected Item state (for desktop hover and mobile touch inspection)
  const [hoveredItem, setHoveredItem] = useState<MinecraftItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<MinecraftItem | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Modals state
  const [showResetModal, setShowResetModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [batchModalState, setBatchModalState] = useState<{
    isOpen: boolean;
    type: 'collect' | 'uncollect';
  }>({ isOpen: false, type: 'collect' });

  // Fetch dataset asynchronously on mount
  useEffect(() => {
    let isMounted = true;
    fetch('/minecraft-items.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: CollectionData) => {
        if (isMounted) {
          setItemData(data);
          // Set initial selected item as first item
          if (data.items.length > 0) {
            setSelectedItem(data.items[0]);
          }
        }
      })
      .catch(async (err) => {
        console.warn('Falling back to local static dataset:', err);
        if (isMounted) {
          const mod = await import('./data/minecraft-items.json');
          const fb = mod.default as unknown as CollectionData;
          setItemData(fb);
          if (fb.items.length > 0) {
            setSelectedItem(fb.items[0]);
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Save settings when changed
  useEffect(() => {
    saveSettings({
      filterStatus,
      includeOperator,
      visualStyle,
      viewLayout: 'paginated',
      guiScale: 'normal',
      soundEnabled
    });
  }, [filterStatus, includeOperator, visualStyle, soundEnabled]);

  // Save collected state
  const handleToggleCollect = useCallback((item: MinecraftItem) => {
    setSelectedItem(item);
    setCollectedSet((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
        sound.playUncollect();
      } else {
        next.add(item.id);
        sound.playCollect();
      }
      saveCollectedItems(next);
      return next;
    });
  }, []);

  // Pin/Unpin items from 9-slot Hotbar
  const handleTogglePin = useCallback((item: MinecraftItem) => {
    sound.playClick(1.2);
    setSelectedItem(item);
    setPinnedIds((prev) => {
      let next: string[];
      if (prev.includes(item.id)) {
        next = prev.filter((id) => id !== item.id);
      } else {
        if (prev.length >= 9) {
          next = [...prev.slice(1), item.id];
        } else {
          next = [...prev, item.id];
        }
      }
      savePinnedHotbar(next);
      return next;
    });
  }, []);

  // Map item list by category
  const itemMap = useMemo(() => {
    const map = new Map<string, MinecraftItem>();
    if (itemData) {
      itemData.items.forEach((item) => map.set(item.id, item));
    }
    return map;
  }, [itemData]);

  const pinnedItems = useMemo(() => {
    return pinnedIds
      .map((id) => itemMap.get(id))
      .filter((item): item is MinecraftItem => item !== undefined);
  }, [pinnedIds, itemMap]);

  // Tab definitions & counts
  const topTabsList: TabDefinition[] = useMemo(() => {
    if (!itemData) return [];
    const getIcon = (id: string) => itemMap.get(id)?.texture || '';

    const tabs: TabDefinition[] = [
      {
        id: 'building_blocks',
        name: 'Building Blocks',
        iconTexture: getIcon('minecraft:bricks'),
        count: itemData.items.filter((i) => i.category === 'building_blocks').length,
        collectedCount: itemData.items.filter(
          (i) => i.category === 'building_blocks' && collectedSet.has(i.id)
        ).length
      },
      {
        id: 'colored_blocks',
        name: 'Colored Blocks',
        iconTexture: getIcon('minecraft:cyan_wool'),
        count: itemData.items.filter((i) => i.category === 'colored_blocks').length,
        collectedCount: itemData.items.filter(
          (i) => i.category === 'colored_blocks' && collectedSet.has(i.id)
        ).length
      },
      {
        id: 'natural_blocks',
        name: 'Natural Blocks',
        iconTexture: getIcon('minecraft:grass_block'),
        count: itemData.items.filter((i) => i.category === 'natural_blocks').length,
        collectedCount: itemData.items.filter(
          (i) => i.category === 'natural_blocks' && collectedSet.has(i.id)
        ).length
      },
      {
        id: 'functional_blocks',
        name: 'Functional Blocks',
        iconTexture: getIcon('minecraft:oak_sign'),
        count: itemData.items.filter((i) => i.category === 'functional_blocks').length,
        collectedCount: itemData.items.filter(
          (i) => i.category === 'functional_blocks' && collectedSet.has(i.id)
        ).length
      },
      {
        id: 'redstone_blocks',
        name: 'Redstone Blocks',
        iconTexture: getIcon('minecraft:redstone'),
        count: itemData.items.filter((i) => i.category === 'redstone_blocks').length,
        collectedCount: itemData.items.filter(
          (i) => i.category === 'redstone_blocks' && collectedSet.has(i.id)
        ).length
      },
      {
        id: 'hotbar',
        name: 'Saved Hotbars & Pinned',
        iconTexture: getIcon('minecraft:bookshelf'),
        count: pinnedIds.length,
        collectedCount: pinnedIds.filter((id) => collectedSet.has(id)).length
      },
      {
        id: 'search',
        name: 'Search Items',
        iconTexture: getIcon('minecraft:compass'),
        count: itemData.items.length,
        collectedCount: collectedSet.size
      }
    ];
    return tabs;
  }, [itemData, itemMap, collectedSet, pinnedIds]);

  const bottomTabsList: TabDefinition[] = useMemo(() => {
    if (!itemData) return [];
    const getIcon = (id: string) => itemMap.get(id)?.texture || '';

    const tabs: TabDefinition[] = [
      {
        id: 'tools_and_utilities',
        name: 'Tools & Utilities',
        iconTexture: getIcon('minecraft:diamond_pickaxe'),
        count: itemData.items.filter((i) => i.category === 'tools_and_utilities').length,
        collectedCount: itemData.items.filter(
          (i) => i.category === 'tools_and_utilities' && collectedSet.has(i.id)
        ).length
      },
      {
        id: 'combat',
        name: 'Combat',
        iconTexture: getIcon('minecraft:netherite_sword'),
        count: itemData.items.filter((i) => i.category === 'combat').length,
        collectedCount: itemData.items.filter(
          (i) => i.category === 'combat' && collectedSet.has(i.id)
        ).length
      },
      {
        id: 'food_and_drinks',
        name: 'Food & Drinks',
        iconTexture: getIcon('minecraft:golden_apple'),
        count: itemData.items.filter((i) => i.category === 'food_and_drinks').length,
        collectedCount: itemData.items.filter(
          (i) => i.category === 'food_and_drinks' && collectedSet.has(i.id)
        ).length
      },
      {
        id: 'ingredients',
        name: 'Ingredients',
        iconTexture: getIcon('minecraft:iron_ingot'),
        count: itemData.items.filter((i) => i.category === 'ingredients').length,
        collectedCount: itemData.items.filter(
          (i) => i.category === 'ingredients' && collectedSet.has(i.id)
        ).length
      },
      {
        id: 'spawn_eggs',
        name: 'Spawn Eggs',
        iconTexture: getIcon('minecraft:creeper_spawn_egg'),
        count: itemData.items.filter((i) => i.category === 'spawn_eggs').length,
        collectedCount: itemData.items.filter(
          (i) => i.category === 'spawn_eggs' && collectedSet.has(i.id)
        ).length
      },
      {
        id: 'op_blocks',
        name: 'Operator Utilities',
        iconTexture: getIcon('minecraft:command_block'),
        count: itemData.items.filter((i) => i.category === 'op_blocks').length,
        collectedCount: itemData.items.filter(
          (i) => i.category === 'op_blocks' && collectedSet.has(i.id)
        ).length
      },
      {
        id: 'all',
        name: 'All Obtainable Items',
        iconTexture: getIcon('minecraft:chest'),
        count: itemData.obtainableCount,
        collectedCount: itemData.items.filter((i) => i.isObtainable && collectedSet.has(i.id)).length
      }
    ];
    return tabs;
  }, [itemData, itemMap, collectedSet]);

  // Tab selection handler
  const handleSelectTab = (tabId: CategoryId | 'all') => {
    sound.playClick(1.0);
    setActiveTab(tabId);
    setRowOffset(0);
  };

  // Filter items based on activeTab, searchQuery, and filterStatus
  const visibleItems = useMemo(() => {
    if (!itemData) return [];
    let result = itemData.items;

    // Filter by Tab
    if (activeTab === 'search') {
      if (!includeOperator) {
        result = result.filter((i) => i.isObtainable);
      }
    } else if (activeTab === 'hotbar') {
      result = pinnedItems;
    } else if (activeTab === 'all') {
      if (!includeOperator) {
        result = result.filter((i) => i.isObtainable);
      }
    } else {
      result = result.filter((i) => i.category === activeTab);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.shortId.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q) ||
          i.categoryName.toLowerCase().includes(q)
      );
    }

    // Filter by Collection Status
    if (filterStatus === 'collected') {
      result = result.filter((i) => collectedSet.has(i.id));
    } else if (filterStatus === 'uncollected') {
      result = result.filter((i) => !collectedSet.has(i.id));
    }

    return result;
  }, [itemData, activeTab, searchQuery, filterStatus, includeOperator, pinnedItems, collectedSet]);

  // Pagination / Row calculation
  const totalRows = Math.ceil(visibleItems.length / 9);
  const maxRowOffset = Math.max(0, totalRows - 5);
  const totalPages = Math.max(1, Math.ceil(visibleItems.length / 45));
  const currentPage = Math.min(totalPages, Math.floor(rowOffset / 5) + 1);

  const handlePrevPage = () => {
    if (rowOffset > 0) {
      sound.playClick(0.9);
      setRowOffset((r) => Math.max(0, r - 5));
    }
  };

  const handleNextPage = () => {
    if (rowOffset < maxRowOffset) {
      sound.playClick(1.1);
      setRowOffset((r) => Math.min(maxRowOffset, r + 5));
    }
  };

  // Tooltip handlers
  const handleHoverItem = (item: MinecraftItem, e: React.MouseEvent) => {
    setHoveredItem(item);
    setSelectedItem(item);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleLeaveItem = () => {
    setHoveredItem(null);
  };

  // Category title display
  const currentCategoryTitle = useMemo(() => {
    if (activeTab === 'search') return 'Search Items';
    if (activeTab === 'hotbar') return 'Saved Hotbars & Pinned';
    if (activeTab === 'all') return 'All Obtainable Items';
    const found = itemData?.categories.find((c) => c.id === activeTab);
    return found ? found.name : 'Items';
  }, [activeTab, itemData]);

  // Overall statistics calculation
  const stats = useMemo(() => {
    if (!itemData) return { total: 0, collected: 0, percentage: 0 };
    const totalCount = includeOperator ? itemData.totalItems : itemData.obtainableCount;
    const collectedCount = itemData.items.filter(
      (i) => (includeOperator || i.isObtainable) && collectedSet.has(i.id)
    ).length;
    return {
      total: totalCount,
      collected: collectedCount,
      percentage: totalCount > 0 ? (collectedCount / totalCount) * 100 : 0
    };
  }, [itemData, collectedSet, includeOperator]);

  // Quick batch mark for currently filtered items
  const handleBatchMark = (isCollect: boolean) => {
    setCollectedSet((prev) => {
      const next = new Set(prev);
      visibleItems.forEach((item) => {
        if (isCollect) {
          next.add(item.id);
        } else {
          next.delete(item.id);
        }
      });
      saveCollectedItems(next);
      return next;
    });
    if (isCollect) {
      sound.playLevelUp();
    } else {
      sound.playClick(0.8);
    }
  };

  // Full reset
  const handleConfirmReset = () => {
    resetCollection();
    setCollectedSet(new Set());
    setPinnedIds([]);
    sound.playClick(0.6);
  };

  // Import backup success
  const handleImportSuccess = (newCollected: Set<string>, newPinned: string[]) => {
    setCollectedSet(newCollected);
    saveCollectedItems(newCollected);
    if (newPinned && newPinned.length > 0) {
      setPinnedIds(newPinned);
      savePinnedHotbar(newPinned);
    }
    sound.playLevelUp();
  };

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setActiveTab('search');
        const input = document.getElementById('mc-search-input');
        input?.focus();
      } else if (e.key === 'Escape') {
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!itemData) {
    return <LoadingScreen progress={85} message="Loading Minecraft 26.2 Items..." />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 8px 30px',
        minHeight: '100vh',
        boxSizing: 'border-box',
        width: '100%'
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          width: '100%',
          maxWidth: '412px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '8px',
          padding: '8px 10px',
          backgroundColor: 'rgba(20, 16, 12, 0.85)',
          border: '2px solid #373737',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
          boxSizing: 'border-box'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h1
              style={{
                fontSize: '17px',
                color: '#ffffff',
                textShadow: '2px 2px 0px #000000',
                letterSpacing: '0.5px'
              }}
            >
              Minecraft Item Tracker
            </h1>
            <span
              style={{
                fontSize: '10px',
                backgroundColor: '#27ae60',
                color: '#ffffff',
                padding: '2px 5px',
                borderRadius: '3px',
                fontWeight: 'bold',
                textShadow: '1px 1px 0px #000'
              }}
            >
              v26.2
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#aaaaaa', marginTop: '1px' }}>
            Java Edition • 1,537 Items & Textures
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          <button
            className="mc-btn"
            onClick={() => exportBackup(collectedSet, pinnedIds)}
            title="Download JSON backup"
          >
            💾 Export
          </button>
          <button
            className="mc-btn"
            onClick={() => setShowImportModal(true)}
            title="Restore collection from JSON backup"
          >
            📂 Import
          </button>
          <button
            className="mc-btn"
            onClick={() => {
              const next = sound.toggle();
              setSoundEnabled(next);
            }}
            title={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button
            className="mc-btn"
            onClick={() => setShowInfoModal(true)}
            title="Controls & Version Info"
          >
            ℹ
          </button>
          <button
            className="mc-btn mc-btn-red"
            onClick={() => setShowResetModal(true)}
            title="Reset collection"
          >
            🗑
          </button>
        </div>
      </header>

      {/* Main XP Progress Bar */}
      <div style={{ width: '100%', maxWidth: '412px', marginBottom: '8px' }}>
        <XPProgressBar
          collectedCount={stats.collected}
          totalCount={stats.total}
          categoryName={activeTab !== 'search' && activeTab !== 'all' ? currentCategoryTitle : undefined}
        />
      </div>

      {/* Quick Controls Bar: Filter, Style, Batch Actions */}
      <div
        style={{
          width: '100%',
          maxWidth: '412px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '4px',
          marginBottom: '6px',
          boxSizing: 'border-box'
        }}
      >
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '3px' }}>
          <button
            className={`mc-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => {
              sound.playClick();
              setFilterStatus('all');
              setRowOffset(0);
            }}
          >
            All
          </button>
          <button
            className={`mc-btn ${filterStatus === 'collected' ? 'active' : ''}`}
            onClick={() => {
              sound.playClick();
              setFilterStatus('collected');
              setRowOffset(0);
            }}
          >
            ✔ Collected
          </button>
          <button
            className={`mc-btn ${filterStatus === 'uncollected' ? 'active' : ''}`}
            onClick={() => {
              sound.playClick();
              setFilterStatus('uncollected');
              setRowOffset(0);
            }}
          >
            ✖ Needed
          </button>
        </div>

        {/* Visual Style & Batch Mark Button */}
        <div style={{ display: 'flex', gap: '3px' }}>
          <button
            className="mc-btn"
            onClick={() => {
              sound.playClick();
              setVisualStyle((s) => (s === 'dim' ? 'checkmark' : s === 'checkmark' ? 'glow' : 'dim'));
            }}
            title="Toggle collected visual indicator style"
          >
            Style: {visualStyle === 'dim' ? 'Dim' : visualStyle === 'checkmark' ? 'Check' : 'Glow'}
          </button>
          <button
            className="mc-btn mc-btn-green"
            onClick={() => setBatchModalState({ isOpen: true, type: 'collect' })}
            disabled={visibleItems.length === 0}
            title="Mark all items currently visible as collected"
          >
            ✔ All
          </button>
          <button
            className="mc-btn mc-btn-red"
            onClick={() => setBatchModalState({ isOpen: true, type: 'uncollect' })}
            disabled={visibleItems.length === 0}
            title="Mark all items currently visible as uncollected"
          >
            ✖ All
          </button>
        </div>
      </div>

      {/* CREATIVE INVENTORY GUI CONTAINER (Responsively scaled on mobile) */}
      <div className="mc-gui-wrapper">
        {/* Top Creative Tabs */}
        <CreativeTabs
          topTabs={topTabsList}
          bottomTabs={bottomTabsList}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onHoverTab={() => {}}
          onLeaveTab={() => {}}
        />

        {/* Window Main Body (Fixed 412px width, strictly bounded) */}
        <div
          className="mc-window"
          style={{
            width: '412px',
            padding: '10px 14px 12px 14px',
            position: 'relative',
            zIndex: 15,
            boxSizing: 'border-box'
          }}
        >
          {/* Header row inside window: Title & Search / Page Navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
              height: '24px',
              width: '378px',
              boxSizing: 'border-box'
            }}
          >
            {/* Left: Category Title OR Search Input */}
            {activeTab === 'search' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                <input
                  id="mc-search-input"
                  type="text"
                  className="mc-input"
                  placeholder="Search item or ID..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setRowOffset(0);
                  }}
                  autoFocus
                  style={{ width: '180px' }}
                />
                {searchQuery && (
                  <button
                    className="mc-btn"
                    onClick={() => {
                      setSearchQuery('');
                      setRowOffset(0);
                    }}
                    style={{ padding: '2px 5px', fontSize: '10px' }}
                  >
                    Clear
                  </button>
                )}
              </div>
            ) : (
              <span
                style={{
                  fontSize: '14px',
                  color: 'var(--mc-text-dark)',
                  fontWeight: 'bold',
                  letterSpacing: '0.3px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '260px'
                }}
              >
                {currentCategoryTitle}
              </span>
            )}

            {/* Right: Page Navigation Buttons [ ◀ | ▶ ] */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
              <button
                className="mc-btn"
                onClick={handlePrevPage}
                disabled={rowOffset <= 0}
                style={{ padding: '2px 6px', fontSize: '11px' }}
                title="Previous page (or scroll up)"
              >
                ◀
              </button>
              <span style={{ fontSize: '11px', color: '#404040', minWidth: '36px', textAlign: 'center' }}>
                {currentPage}/{totalPages}
              </span>
              <button
                className="mc-btn"
                onClick={handleNextPage}
                disabled={rowOffset >= maxRowOffset}
                style={{ padding: '2px 6px', fontSize: '11px' }}
                title="Next page (or scroll down)"
              >
                ▶
              </button>
            </div>
          </div>

          {/* 9-Column Inventory Grid (Strictly bounded to 378px x 198px with touch swipe support) */}
          <InventoryGrid
            items={visibleItems}
            collectedSet={collectedSet}
            pinnedSet={new Set(pinnedIds)}
            visualStyle={visualStyle}
            rowOffset={rowOffset}
            onScrollRow={setRowOffset}
            searchQuery={searchQuery}
            onToggleCollect={handleToggleCollect}
            onTogglePin={handleTogglePin}
            onHoverItem={handleHoverItem}
            onLeaveItem={handleLeaveItem}
            onClearSearch={() => {
              setSearchQuery('');
              setFilterStatus('all');
              setRowOffset(0);
            }}
          />

          {/* Hotbar Section at bottom (Strictly bounded to 378px) */}
          <Hotbar
            pinnedItems={pinnedItems}
            collectedSet={collectedSet}
            visualStyle={visualStyle}
            onToggleCollect={handleToggleCollect}
            onTogglePin={handleTogglePin}
            onHoverItem={handleHoverItem}
            onLeaveItem={handleLeaveItem}
          />
        </div>

        {/* Bottom Creative Tabs (Directly attached to the bottom of the window) */}
        <CreativeBottomTabs
          bottomTabs={bottomTabsList}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onHoverTab={() => {}}
          onLeaveTab={() => {}}
        />
      </div>

      {/* Mobile-Friendly Active Item Banner (shows details of last inspected/tapped item) */}
      {selectedItem && (
        <div className="mc-item-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src={selectedItem.texture}
              alt={selectedItem.name}
              style={{ width: '28px', height: '28px', imageRendering: 'pixelated' }}
            />
            <div>
              <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: 'bold' }}>
                {selectedItem.name}
              </div>
              <div style={{ fontSize: '10px', color: '#aaaaaa' }}>
                {selectedItem.id} • {selectedItem.categoryName}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className={`mc-btn ${collectedSet.has(selectedItem.id) ? 'mc-btn-green' : ''}`}
              style={{ fontSize: '11px', padding: '3px 8px' }}
              onClick={() => handleToggleCollect(selectedItem)}
            >
              {collectedSet.has(selectedItem.id) ? '✔ Done' : '+ Collect'}
            </button>
            <button
              className="mc-btn"
              style={{ fontSize: '11px', padding: '3px 6px' }}
              onClick={() => handleTogglePin(selectedItem)}
              title="Pin or unpin from Hotbar"
            >
              {pinnedIds.includes(selectedItem.id) ? '★ Pinned' : '☆ Pin'}
            </button>
          </div>
        </div>
      )}

      {/* Floating Hover Tooltip for desktop */}
      <ItemTooltip
        item={hoveredItem}
        position={mousePos}
        isCollected={hoveredItem ? collectedSet.has(hoveredItem.id) : false}
        isPinned={hoveredItem ? pinnedIds.includes(hoveredItem.id) : false}
      />

      {/* Modals */}
      <ResetModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleConfirmReset}
      />

      <BatchActionModal
        isOpen={batchModalState.isOpen}
        actionType={batchModalState.type}
        itemCount={visibleItems.length}
        categoryName={currentCategoryTitle}
        onClose={() => setBatchModalState({ isOpen: false, type: 'collect' })}
        onConfirm={() => handleBatchMark(batchModalState.type === 'collect')}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleImportSuccess}
      />

      <InfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
    </div>
  );
};

export default App;
