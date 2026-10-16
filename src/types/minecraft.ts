export type CategoryId =
  | 'building_blocks'
  | 'colored_blocks'
  | 'natural_blocks'
  | 'functional_blocks'
  | 'redstone_blocks'
  | 'tools_and_utilities'
  | 'combat'
  | 'food_and_drinks'
  | 'ingredients'
  | 'spawn_eggs'
  | 'op_blocks'
  | 'search'
  | 'hotbar';

export type DimensionType = 'overworld' | 'nether' | 'end';
export type DimensionFilter = 'all' | 'overworld' | 'nether' | 'end';

export type SubCollectionType =
  | 'armor_trims_sherds'
  | 'mob_drops_trophies'
  | 'ores_minerals'
  | 'flora_agriculture'
  | 'enchantments_potions';

export type SubCollectionFilter = 'all' | SubCollectionType;

export type StackLimitFilter = 'all' | 64 | 16 | 1;

export interface CraftingRecipe {
  type: 'shaped' | 'shapeless' | 'smelting' | 'special';
  grid?: (string | null)[][];
  ingredients?: string[];
  resultCount: number;
}

export interface MinecraftItem {
  id: string; // e.g. "minecraft:oak_log"
  shortId: string; // e.g. "oak_log"
  name: string; // e.g. "Oak Log"
  category: CategoryId;
  categoryName: string;
  order: number;
  isOperator: boolean;
  isObtainable: boolean;
  stackSize: number;
  texture: string; // base64 data URL
  dimension: DimensionType;
  subCollection: SubCollectionType | null;
  source: string;
  recipe: CraftingRecipe | null;
}

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  icon: string;
  count: number;
  obtainableCount: number;
}

export interface CollectionData {
  version: string;
  edition: string;
  updateName: string;
  totalItems: number;
  obtainableCount: number;
  categories: CategoryInfo[];
  items: MinecraftItem[];
}

export interface WorldProfile {
  id: string;
  name: string;
  createdAt: string;
  collected: string[];
  pinned: string[];
}

export type FilterStatus = 'all' | 'collected' | 'uncollected';
export type ViewLayout = 'paginated' | 'scroll';
export type VisualStyle = 'dim' | 'checkmark' | 'glow';
export type GuiScale = 'auto' | 'compact' | 'normal' | 'large';

export interface TrackerStats {
  total: number;
  collected: number;
  percentage: number;
  categoryStats: Record<string, { total: number; collected: number; percentage: number }>;
}
