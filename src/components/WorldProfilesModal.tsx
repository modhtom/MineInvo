import React, { useState } from 'react';
import { WorldProfile } from '../types/minecraft';

interface WorldProfilesModalProps {
  isOpen: boolean;
  profiles: WorldProfile[];
  activeProfileId: string;
  totalObtainable: number;
  onClose: () => void;
  onSelectProfile: (id: string) => void;
  onCreateProfile: (name: string) => void;
  onRenameProfile: (id: string, name: string) => void;
  onDeleteProfile: (id: string) => void;
}

export const WorldProfilesModal: React.FC<WorldProfilesModalProps> = ({
  isOpen,
  profiles,
  activeProfileId,
  totalObtainable,
  onClose,
  onSelectProfile,
  onCreateProfile,
  onRenameProfile,
  onDeleteProfile
}) => {
  const [newWorldName, setNewWorldName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorldName.trim()) return;
    onCreateProfile(newWorldName.trim());
    setNewWorldName('');
  };

  const handleStartRename = (p: WorldProfile) => {
    setEditingId(p.id);
    setEditingName(p.name);
  };

  const handleSaveRename = (id: string) => {
    if (editingName.trim()) {
      onRenameProfile(id, editingName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div
        className="mc-modal-content"
        style={{ maxWidth: '520px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #a0a0a0',
            paddingBottom: '8px',
            marginBottom: '12px'
          }}
        >
          <h2 style={{ fontSize: '17px', color: '#2a2a2a' }}>🌍 Manage World Profiles</h2>
          <button className="mc-btn" onClick={onClose} style={{ padding: '2px 8px', fontSize: '13px' }}>
            ✕
          </button>
        </div>

        <p style={{ fontSize: '12px', color: '#555', marginBottom: '12px', lineHeight: 1.4 }}>
          Track multiple worlds, SMP servers, or hardcore challenges independently. Progress is
          saved separately for each world.
        </p>

        {/* Profile List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {profiles.map((p) => {
            const isActive = p.id === activeProfileId;
            const collectedCount = p.collected.length;
            const percent = totalObtainable > 0 ? (collectedCount / totalObtainable) * 100 : 0;

            return (
              <div
                key={p.id}
                style={{
                  backgroundColor: isActive ? '#dedede' : '#b0b0b0',
                  border: isActive ? '2px solid #27ae60' : '2px solid #888888',
                  padding: '8px 10px',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div style={{ flex: 1 }}>
                  {editingId === p.id ? (
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                      <input
                        type="text"
                        className="mc-input"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                        style={{ fontSize: '12px', padding: '2px 6px' }}
                      />
                      <button
                        className="mc-btn mc-btn-green"
                        onClick={() => handleSaveRename(p.id)}
                        style={{ padding: '2px 6px', fontSize: '11px' }}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a1a' }}>
                        {p.name}
                      </span>
                      {isActive && (
                        <span
                          style={{
                            fontSize: '9px',
                            backgroundColor: '#27ae60',
                            color: '#ffffff',
                            padding: '1px 5px',
                            borderRadius: '2px',
                            fontWeight: 'bold'
                          }}
                        >
                          ACTIVE
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{ fontSize: '11px', color: '#444', marginTop: '2px' }}>
                    {collectedCount.toLocaleString()} / {totalObtainable.toLocaleString()} (
                    {percent.toFixed(1)}%)
                  </div>

                  {/* Mini XP bar */}
                  <div
                    style={{
                      height: '6px',
                      backgroundColor: '#222',
                      width: '100%',
                      marginTop: '4px',
                      border: '1px solid #555'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, Math.max(0, percent))}%`,
                        backgroundColor: '#7df53b'
                      }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {!isActive && (
                    <button
                      className="mc-btn mc-btn-green"
                      onClick={() => onSelectProfile(p.id)}
                      style={{ fontSize: '11px', padding: '3px 8px' }}
                    >
                      Select
                    </button>
                  )}
                  <button
                    className="mc-btn"
                    onClick={() => handleStartRename(p)}
                    style={{ fontSize: '11px', padding: '3px 6px' }}
                    title="Rename World"
                  >
                    ✏
                  </button>
                  {profiles.length > 1 && (
                    <button
                      className="mc-btn mc-btn-red"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete profile "${p.name}"?`)) {
                          onDeleteProfile(p.id);
                        }
                      }}
                      style={{ fontSize: '11px', padding: '3px 6px' }}
                      title="Delete World"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Create New Profile Form */}
        <form
          onSubmit={handleCreate}
          style={{
            display: 'flex',
            gap: '6px',
            backgroundColor: '#8b8b8b',
            padding: '8px',
            border: '2px solid #555',
            borderRadius: '2px'
          }}
        >
          <input
            type="text"
            className="mc-input"
            placeholder="New world name (e.g. Hardcore SMP)..."
            value={newWorldName}
            onChange={(e) => setNewWorldName(e.target.value)}
            style={{ flex: 1, fontSize: '12px' }}
          />
          <button
            type="submit"
            className="mc-btn mc-btn-green"
            style={{ fontSize: '12px', whiteSpace: 'nowrap' }}
          >
            ➕ Add World
          </button>
        </form>
      </div>
    </div>
  );
};
