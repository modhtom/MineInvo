import React from 'react';
import { CategoryId } from '../types/minecraft';

export interface TabDefinition {
  id: CategoryId | 'all';
  name: string;
  iconTexture: string;
  count: number;
  collectedCount: number;
}

interface CreativeTabsProps {
  topTabs: TabDefinition[];
  bottomTabs: TabDefinition[];
  activeTab: CategoryId | 'all';
  onSelectTab: (tabId: CategoryId | 'all') => void;
  onHoverTab: (tab: TabDefinition, e: React.MouseEvent) => void;
  onLeaveTab: () => void;
}

export const CreativeTabs: React.FC<CreativeTabsProps> = ({
  topTabs,
  activeTab,
  onSelectTab,
  onHoverTab,
  onLeaveTab
}) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '3px',
        paddingLeft: '12px',
        paddingRight: '12px',
        width: '412px',
        boxSizing: 'border-box',
        alignItems: 'flex-end',
        zIndex: 10
      }}
    >
      {topTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isComplete = tab.count > 0 && tab.collectedCount >= tab.count;

        return (
          <div
            key={tab.id}
            className={`mc-tab mc-tab-top ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(tab.id)}
            onMouseEnter={(e) => onHoverTab(tab, e)}
            onMouseLeave={onLeaveTab}
            title={`${tab.name} (${tab.collectedCount}/${tab.count})`}
          >
            <img
              src={tab.iconTexture}
              alt={tab.name}
              style={{ width: '28px', height: '28px', pointerEvents: 'none' }}
              draggable={false}
            />
            {isComplete && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '3px',
                  color: '#55ff55',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  textShadow: '1px 1px 0px #000'
                }}
              >
                ✔
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const CreativeBottomTabs: React.FC<{
  bottomTabs: TabDefinition[];
  activeTab: CategoryId | 'all';
  onSelectTab: (tabId: CategoryId | 'all') => void;
  onHoverTab: (tab: TabDefinition, e: React.MouseEvent) => void;
  onLeaveTab: () => void;
}> = ({ bottomTabs, activeTab, onSelectTab, onHoverTab, onLeaveTab }) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '3px',
        paddingLeft: '12px',
        paddingRight: '12px',
        width: '412px',
        boxSizing: 'border-box',
        alignItems: 'flex-start',
        zIndex: 10
      }}
    >
      {bottomTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isComplete = tab.count > 0 && tab.collectedCount >= tab.count;

        return (
          <div
            key={tab.id}
            className={`mc-tab mc-tab-bottom ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(tab.id)}
            onMouseEnter={(e) => onHoverTab(tab, e)}
            onMouseLeave={onLeaveTab}
            title={`${tab.name} (${tab.collectedCount}/${tab.count})`}
          >
            <img
              src={tab.iconTexture}
              alt={tab.name}
              style={{ width: '28px', height: '28px', pointerEvents: 'none' }}
              draggable={false}
            />
            {isComplete && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '3px',
                  color: '#55ff55',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  textShadow: '1px 1px 0px #000'
                }}
              >
                ✔
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
