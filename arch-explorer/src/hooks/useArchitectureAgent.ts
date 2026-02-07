import { useState, useCallback } from "react";
import type { Coordinates, ArchitecturalDetail } from "../types";
import { queryArchitecture } from "../services/architectureAgent";

interface QueryResult {
  buildings: ArchitecturalDetail[];
  summary: string;
}

interface UseArchitectureAgentReturn {
  buildings: ArchitecturalDetail[];
  summary: string;
  loading: boolean;
  error: string | null;
  query: (coords: Coordinates) => Promise<QueryResult | null>;
}

export function useArchitectureAgent(): UseArchitectureAgentReturn {
  const [buildings, setBuildings] = useState<ArchitecturalDetail[]>([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useCallback(async (coords: Coordinates): Promise<QueryResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await queryArchitecture(coords);
      setBuildings(result.buildings);
      setSummary(result.summary);
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to query architecture data");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { buildings, summary, loading, error, query };
}
