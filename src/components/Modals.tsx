import React, { useState, useRef } from 'react';
import { exportBackup, importBackup, ImportResult } from '../services/storage';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div className="mc-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: '18px', color: '#9c2e2e', marginBottom: '12px' }}>
          Reset Collection Progress?
        </h2>
        <p style={{ fontSize: '13px', lineHeight: 1.5, marginBottom: '16px' }}>
          This will reset all your collected items and pinned goals back to 0. This action cannot be
          undone unless you have an exported backup file.
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button className="mc-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="mc-btn mc-btn-red"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Yes, Reset All
          </button>
        </div>
      </div>
    </div>
  );
};

interface BatchActionModalProps {
  isOpen: boolean;
  actionType: 'collect' | 'uncollect';
  itemCount: number;
  categoryName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const BatchActionModal: React.FC<BatchActionModalProps> = ({
  isOpen,
  actionType,
  itemCount,
  categoryName,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  const isCollect = actionType === 'collect';

  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div className="mc-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: '17px', color: '#333333', marginBottom: '12px' }}>
          {isCollect ? 'Mark Visible as Collected?' : 'Mark Visible as Uncollected?'}
        </h2>
        <p style={{ fontSize: '13px', lineHeight: 1.5, marginBottom: '16px' }}>
          Do you want to mark all <strong>{itemCount}</strong> items in <strong>{categoryName}</strong> as{' '}
          {isCollect ? 'collected' : 'uncollected'}?
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button className="mc-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`mc-btn ${isCollect ? 'mc-btn-green' : 'mc-btn-red'}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {isCollect ? 'Mark Collected' : 'Mark Uncollected'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (collected: Set<string>, pinned: string[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const result: ImportResult = await importBackup(file);
    if (result.success && result.collected) {
      setSuccessMsg(result.message);
      setTimeout(() => {
        onImportSuccess(result.collected!, result.pinned || []);
        onClose();
      }, 1000);
    } else {
      setErrorMsg(result.message);
    }
  };

  const handlePasteImport = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!pasteText.trim()) {
      setErrorMsg('Please paste backup JSON content.');
      return;
    }

    try {
      const parsed = JSON.parse(pasteText);
      let items: string[] = [];
      let pinned: string[] = [];

      if (Array.isArray(parsed)) {
        items = parsed.filter((i) => typeof i === 'string');
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.collectedItems)) {
          items = parsed.collectedItems;
        } else if (Array.isArray(parsed.items)) {
          items = parsed.items;
        }
        if (Array.isArray(parsed.pinnedHotbar)) {
          pinned = parsed.pinnedHotbar;
        }
      }

      if (items.length === 0) {
        setErrorMsg('No valid item identifiers found in pasted JSON.');
        return;
      }

      const set = new Set(items);
      setSuccessMsg(`Successfully restored ${set.size} items!`);
      setTimeout(() => {
        onImportSuccess(set, pinned);
        onClose();
      }, 800);
    } catch (e) {
      setErrorMsg(`JSON Parse error: ${e instanceof Error ? e.message : 'Invalid JSON'}`);
    }
  };

  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div className="mc-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: '18px', color: '#333333', marginBottom: '12px' }}>
          Import Collection Backup
        </h2>
        <p style={{ fontSize: '13px', lineHeight: 1.5, marginBottom: '12px' }}>
          Choose a saved collection JSON backup file from your computer or paste its contents below:
        </p>

        <input
          type="file"
          accept=".json,application/json"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <div style={{ marginBottom: '14px' }}>
          <button
            className="mc-btn"
            style={{ width: '100%' }}
            onClick={() => fileInputRef.current?.click()}
          >
            📁 Select Backup File (.json)
          </button>
        </div>

        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
          Or paste JSON directly:
        </div>
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder='{"collectedItems": ["minecraft:oak_log", ...]}'
          style={{
            width: '100%',
            height: '80px',
            fontFamily: 'monospace',
            fontSize: '11px',
            backgroundColor: '#000000',
            color: '#00ff66',
            border: '2px solid #555555',
            padding: '6px',
            marginBottom: '10px'
          }}
        />

        {errorMsg && (
          <div
            style={{
              padding: '6px 10px',
              backgroundColor: '#ffebee',
              color: '#c62828',
              fontSize: '12px',
              border: '1px solid #ef9a9a',
              marginBottom: '10px'
            }}
          >
            ⚠ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: '6px 10px',
              backgroundColor: '#e8f5e9',
              color: '#2e7d32',
              fontSize: '12px',
              border: '1px solid #a5d6a7',
              marginBottom: '10px'
            }}
          >
            ✔ {successMsg}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button className="mc-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="mc-btn mc-btn-green" onClick={handlePasteImport}>
            Import & Apply
          </button>
        </div>
      </div>
    </div>
  );
};

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div
        className="mc-modal-content"
        style={{ maxWidth: '600px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: '18px', color: '#2c3e50', marginBottom: '10px' }}>
          Minecraft 26.2 "Chaos Cubed" Tracker
        </h2>

        <div style={{ fontSize: '13px', lineHeight: 1.6, maxHeight: '380px', overflowY: 'auto' }}>
          <p style={{ marginBottom: '8px' }}>
            This collection tracker recreates the authentic <strong>Creative Inventory GUI</strong> to
            help survival and completionist players track every collectible item in <strong>Minecraft 26.2</strong>.
          </p>

          <h3 style={{ fontSize: '14px', marginTop: '12px', marginBottom: '4px', color: '#16a085' }}>
            🌟 26.2 "Chaos Cubed" Content Included:
          </h3>
          <ul style={{ paddingLeft: '20px', marginBottom: '8px' }}>
            <li><strong>Cinnabar Block Set:</strong> Cinnabar, Stairs, Slabs, Walls, Bricks, Polished variants</li>
            <li><strong>Sulfur Block Set:</strong> Sulfur, Stairs, Slabs, Walls, Bricks, Polished variants</li>
            <li><strong>Sulfur Cave Hazards:</strong> Sulfur Spikes, Potent Sulfur, Geyser mechanics</li>
            <li><strong>Sulfur Cube:</strong> Bucket of Sulfur Cube, Sulfur Cube Spawn Egg</li>
            <li><strong>New Music:</strong> "Bounce" Disc by fingerspit</li>
          </ul>

          <h3 style={{ fontSize: '14px', marginTop: '12px', marginBottom: '4px', color: '#2980b9' }}>
            🎮 Controls & Shortcuts:
          </h3>
          <ul style={{ paddingLeft: '20px', marginBottom: '8px' }}>
            <li><strong>Left Click:</strong> Toggle item collected/uncollected</li>
            <li><strong>Shift + Click / Right Click:</strong> Pin item to your 9-slot Hotbar goals</li>
            <li><strong>Search Tab (Compass):</strong> Type to find any item instantly</li>
            <li><strong>Backup / Restore:</strong> Export your progress anytime as a JSON file</li>
          </ul>

          <h3 style={{ fontSize: '14px', marginTop: '12px', marginBottom: '4px', color: '#8e44ad' }}>
            🛡 Collectible vs. Operator Blocks:
          </h3>
          <p>
            By default, technical/unobtainable blocks (Command Blocks, Barriers, Debug Stick, etc.) are
            excluded from survival completion calculations. You can view them in the Operator Utilities tab.
          </p>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="mc-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
