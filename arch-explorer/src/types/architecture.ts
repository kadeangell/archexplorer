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
}

export interface ArchitectureQueryResult {
  buildings: ArchitecturalDetail[];
  summary: string;
  loading: boolean;
  error: string | null;
}
