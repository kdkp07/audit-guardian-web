import { useState, useEffect, useRef } from 'react';
import { DynamoDBResults } from '@/types/api';
import { API_BASE_URL } from '@/services/api';

interface UseAutoFetchResultsOptions {
  completedRunIds: Set<string>;
  enabled?: boolean;
}

export function useAutoFetchResults(options: UseAutoFetchResultsOptions) {
  const { completedRunIds, enabled = true } = options;
  const [results, setResults] = useState<Map<string, DynamoDBResults>>(new Map());
  const [loadingRunIds, setLoadingRunIds] = useState<Set<string>>(new Set());
  const fetchedRunIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    const fetchResults = async (runId: string) => {
      // Avoid duplicate fetches
      if (fetchedRunIdsRef.current.has(runId)) {
        return;
      }

      fetchedRunIdsRef.current.add(runId);
      setLoadingRunIds((prev) => new Set(prev).add(runId));

      try {
        const response = await fetch(`${API_BASE_URL}/api/results/${runId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch results: ${response.statusText}`);
        }

        const data: DynamoDBResults = await response.json();
        
        setResults((prev) => {
          const newMap = new Map(prev);
          newMap.set(runId, data);
          return newMap;
        });
      } catch (error) {
        console.error(`Error fetching results for run ${runId}:`, error);
        // Remove from fetched set to allow retry
        fetchedRunIdsRef.current.delete(runId);
      } finally {
        setLoadingRunIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(runId);
          return newSet;
        });
      }
    };

    // Fetch results for newly completed runs
    completedRunIds.forEach((runId) => {
      if (!fetchedRunIdsRef.current.has(runId)) {
        fetchResults(runId);
      }
    });
  }, [completedRunIds, enabled]);

  return {
    results,
    loadingRunIds,
    isLoading: loadingRunIds.size > 0
  };
}
