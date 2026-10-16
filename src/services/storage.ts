import { WorldProfile } from '../types/minecraft';

const PROFILES_KEY = 'minecraft_world_profiles_v26_2';
const ACTIVE_PROFILE_KEY = 'minecraft_active_profile_v26_2';
const LEGACY_STORAGE_KEY = 'minecraft_collected_items_v26_2';
const LEGACY_HOTBAR_KEY = 'minecraft_pinned_hotbar_v26_2';
const SETTINGS_KEY = 'minecraft_tracker_settings_v26_2';

export interface TrackerSettings {
  filterStatus: 'all' | 'collected' | 'uncollected';
  includeOperator: boolean;
  visualStyle: 'dim' | 'checkmark' | 'glow';
  viewLayout: 'paginated' | 'scroll';
  guiScale: 'auto' | 'compact' | 'normal' | 'large';
  soundEnabled: boolean;
}

export const DEFAULT_SETTINGS: TrackerSettings = {
  filterStatus: 'all',
  includeOperator: false,
  visualStyle: 'dim',
  viewLayout: 'paginated',
  guiScale: 'normal',
  soundEnabled: true
};

export function loadProfiles(): WorldProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Auto-migrate legacy single-world collection data if available
    let legacyCollected: string[] = [];
    let legacyPinned: string[] = [];
    try {
      const legC = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legC) legacyCollected = JSON.parse(legC);
      const legP = localStorage.getItem(LEGACY_HOTBAR_KEY);
      if (legP) legacyPinned = JSON.parse(legP);
    } catch {
      // Ignore
    }

    const defaultProfile: WorldProfile = {
      id: 'profile-default',
      name: 'World 1 (Default)',
      createdAt: new Date().toISOString(),
      collected: Array.isArray(legacyCollected) ? legacyCollected : [],
      pinned: Array.isArray(legacyPinned) ? legacyPinned : []
    };

    saveProfiles([defaultProfile]);
    setActiveProfileId(defaultProfile.id);
    return [defaultProfile];
  } catch (e) {
    console.error('Failed to load world profiles:', e);
  }

  const fallback: WorldProfile = {
    id: 'profile-default',
    name: 'World 1 (Default)',
    createdAt: new Date().toISOString(),
    collected: [],
    pinned: []
  };
  return [fallback];
}

export function saveProfiles(profiles: WorldProfile[]): void {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save profiles to localStorage:', e);
  }
}

export function getActiveProfileId(): string {
  try {
    const active = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (active) return active;
  } catch {
    // Ignore
  }
  return 'profile-default';
}

export function setActiveProfileId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  } catch {
    // Ignore
  }
}

export function createProfile(name: string): WorldProfile {
  const profiles = loadProfiles();
  const newProfile: WorldProfile = {
    id: `profile-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: name.trim() || `World ${profiles.length + 1}`,
    createdAt: new Date().toISOString(),
    collected: [],
    pinned: []
  };

  const updated = [...profiles, newProfile];
  saveProfiles(updated);
  setActiveProfileId(newProfile.id);
  return newProfile;
}

export function renameProfile(id: string, newName: string): void {
  const profiles = loadProfiles();
  const updated = profiles.map((p) => (p.id === id ? { ...p, name: newName.trim() || p.name } : p));
  saveProfiles(updated);
}

export function deleteProfile(id: string): WorldProfile[] {
  const profiles = loadProfiles();
  if (profiles.length <= 1) return profiles; // Cannot delete last remaining world

  const updated = profiles.filter((p) => p.id !== id);
  saveProfiles(updated);

  const activeId = getActiveProfileId();
  if (activeId === id) {
    setActiveProfileId(updated[0].id);
  }
  return updated;
}

export function updateProfileData(id: string, collected: string[], pinned: string[]): void {
  const profiles = loadProfiles();
  const updated = profiles.map((p) => (p.id === id ? { ...p, collected, pinned } : p));
  saveProfiles(updated);
}

export function loadSettings(): TrackerSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch {
    // Ignore
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: TrackerSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore
  }
}

export function exportBackup(collected: Set<string>, pinned: string[], profileName: string): void {
  const payload = {
    app: 'Minecraft Creative Inventory Collection Tracker',
    gameVersion: '26.2',
    gameEdition: 'Java Edition',
    updateName: 'Chaos Cubed',
    profileName,
    exportTimestamp: new Date().toISOString(),
    totalCollected: collected.size,
    collectedItems: Array.from(collected),
    pinnedHotbar: pinned
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  const safeProfile = profileName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `minecraft-26.2-${safeProfile}-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ImportResult {
  success: boolean;
  collected?: Set<string>;
  pinned?: string[];
  profileName?: string;
  message: string;
}

export async function importBackup(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          resolve({ success: false, message: 'The uploaded file is empty.' });
          return;
        }

        const parsed = JSON.parse(text);

        let itemsArray: string[] = [];
        let pinnedArray: string[] = [];
        let profileName = 'Imported World';

        if (Array.isArray(parsed)) {
          itemsArray = parsed.filter((item) => typeof item === 'string');
        } else if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.collectedItems)) {
            itemsArray = parsed.collectedItems.filter((item: unknown) => typeof item === 'string');
          } else if (Array.isArray(parsed.items)) {
            itemsArray = parsed.items.filter((item: unknown) => typeof item === 'string');
          }

          if (Array.isArray(parsed.pinnedHotbar)) {
            pinnedArray = parsed.pinnedHotbar.filter((item: unknown) => typeof item === 'string');
          }

          if (parsed.profileName) {
            profileName = parsed.profileName;
          }
        } else {
          resolve({ success: false, message: 'Invalid backup file format. Expected a JSON object or array.' });
          return;
        }

        if (itemsArray.length === 0 && (!parsed || !parsed.app)) {
          resolve({
            success: false,
            message: 'No valid item identifiers found in the file.'
          });
          return;
        }

        const newSet = new Set(itemsArray);
        resolve({
          success: true,
          collected: newSet,
          pinned: pinnedArray,
          profileName,
          message: `Successfully restored ${newSet.size} items for ${profileName}!`
        });
      } catch (err) {
        resolve({
          success: false,
          message: `Could not parse JSON: ${err instanceof Error ? err.message : 'Unknown error'}`
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, message: 'Failed to read the file.' });
    };

    reader.readAsText(file);
  });
}
