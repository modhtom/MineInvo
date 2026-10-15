const STORAGE_KEY = 'minecraft_collected_items_v26_2';
const HOTBAR_KEY = 'minecraft_pinned_hotbar_v26_2';
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

export function loadCollectedItems(): Set<string> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return new Set();
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return new Set(parsed);
    }
  } catch (e) {
    console.error('Failed to load collected items from localStorage:', e);
  }
  return new Set();
}

export function saveCollectedItems(collected: Set<string>): void {
  try {
    const arr = Array.from(collected);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch (e) {
    console.error('Failed to save collected items to localStorage:', e);
  }
}

export function loadPinnedHotbar(): string[] {
  try {
    const data = localStorage.getItem(HOTBAR_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, 9);
      }
    }
  } catch {
    // Ignore
  }
  return [];
}

export function savePinnedHotbar(items: string[]): void {
  try {
    localStorage.setItem(HOTBAR_KEY, JSON.stringify(items.slice(0, 9)));
  } catch {
    // Ignore
  }
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

export function exportBackup(collected: Set<string>, pinned: string[]): void {
  const payload = {
    app: 'Minecraft Creative Inventory Collection Tracker',
    gameVersion: '26.2',
    gameEdition: 'Java Edition',
    updateName: 'Chaos Cubed',
    exportTimestamp: new Date().toISOString(),
    totalCollected: collected.size,
    collectedItems: Array.from(collected),
    pinnedHotbar: pinned
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `minecraft-26.2-collection-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ImportResult {
  success: boolean;
  collected?: Set<string>;
  pinned?: string[];
  message: string;
  count?: number;
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

        // Support both our formal backup structure and simple string arrays
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
        } else {
          resolve({ success: false, message: 'Invalid backup file format. Expected a JSON object or array.' });
          return;
        }

        if (itemsArray.length === 0 && (!parsed || !parsed.app)) {
          resolve({
            success: false,
            message: 'No valid item identifiers found in the file. Ensure you selected a valid collection backup.'
          });
          return;
        }

        const newSet = new Set(itemsArray);
        resolve({
          success: true,
          collected: newSet,
          pinned: pinnedArray,
          count: newSet.size,
          message: `Successfully restored ${newSet.size} items from backup!`
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

export function resetCollection(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(HOTBAR_KEY);
}
