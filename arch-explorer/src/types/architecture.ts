export interface ArchitecturalDetail {
  id: string;
  name: string;
  address: string;
  style: string;
  yearBuilt: string;
  architect: string;
  description: string;
  notableFeatures: string[];
  historicalSignificance: string;
  distance: number | null; // meters from user
  imageUrl?: string;
  wikidataId?: string;
}

export interface ArchitectureQueryResult {
  buildings: ArchitecturalDetail[];
  summary: string;
  loading: boolean;
  error: string | null;
}

export interface ImageConversationResult {
  analysis: string;
  architecturalStyle: string | null;
  estimatedEra: string | null;
  notableFeatures: string[];
  loading: boolean;
  error: string | null;
}
