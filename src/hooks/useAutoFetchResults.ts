import { useState, useEffect, useRef } from 'react';
import { DynamoDBResults } from '@/types/api';
import { API_BASE_URL } from '@/services/api';

interface UseAutoFetchResultsOptions {
  completedRunIds: Set<string>;
  enabled?: boolean;
}

// Error types
interface FetchError {
  runId: string;
  error: Error;
  timestamp: number;
}

export function useAutoFetchResults(options: UseAutoFetchResultsOptions) {
  const { completedRunIds, enabled = true } = options;
  
  // State for results and loading
  const [results, setResults] = useState<Map<string, DynamoDBResults>>(new Map());
  const [loadingRunIds, setLoadingRunIds] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Map<string, FetchError>>(new Map());
  
  // Ref to track which runIds have been fetched
  const fetchedRunIdsRef = useRef<Set<string>>(new Set());
  // Ref to prevent state updates on unmounted component
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Error handling function
  const handleFetchError = (runId: string, error: Error) => {
    if (!isMounted.current) return;
    
    const errorRecord: FetchError = {
      runId,
      error,
      timestamp: Date.now()
    };
    
    setErrors(prev => {
      const newMap = new Map(prev);
      newMap.set(runId, errorRecord);
      return newMap;
    });
    
    // Remove from fetched set to allow retry
    fetchedRunIdsRef.current.delete(runId);
  };

  // Clear error for a specific runId
  const clearError = (runId: string) => {
    setErrors(prev => {
      const newMap = new Map(prev);
      newMap.delete(runId);
      return newMap;
    });
  };

  // Retry fetching results for a specific runId
  const retryFetch = async (runId: string) => {
    if (!enabled) return;
    
    // Reset error state
    clearError(runId);
    
    // Remove from loading set if it's there
    setLoadingRunIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(runId);
      return newSet;
    });
    
    // Reset fetched status
    fetchedRunIdsRef.current.delete(runId);
    
    // Re-attempt fetch
    await fetchResults(runId);
  };

  // Main fetch function
  const fetchResults = async (runId: string) => {
    // Avoid duplicate fetches
    if (fetchedRunIdsRef.current.has(runId) || !isMounted.current) {
      return;
    }

    // Mark as fetching
    fetchedRunIdsRef.current.add(runId);
    setLoadingRunIds((prev) => new Set(prev).add(runId));

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_BASE_URL}/api/results/${runId}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle specific HTTP error codes
        if (response.status === 404) {
          // Results not ready yet - this is expected
          console.log(`Results not ready for run ${runId}, will retry`);
          fetchedRunIdsRef.current.delete(runId);
          return;
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: DynamoDBResults = await response.json();
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        setResults((prev) => {
          const newMap = new Map(prev);
          newMap.set(runId, data);
          return newMap;
        });
      }
      
    } catch (error) {
      // Handle different types of fetch errors
      if (error instanceof Error) {
        // AbortError means timeout or manual abort
        if (error.name === 'AbortError') {
          console.warn(`Fetch timeout for run ${runId}`);
        } else {
          handleFetchError(runId, error);
        }
      } else {
        handleFetchError(runId, new Error('Unknown error'));
      }
      
    } finally {
      // Only update state if component is still mounted
      if (isMounted.current) {
        setLoadingRunIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(runId);
          return newSet;
        });
      }
    }
  };

  // Effect to fetch results for newly completed runs
  useEffect(() => {
    if (!enabled) return;

    // Fetch results for newly completed runs
    completedRunIds.forEach((runId) => {
      if (!fetchedRunIdsRef.current.has(runId)) {
        fetchResults(runId);
      }
    });
    
  }, [completedRunIds, enabled]);

  // Clear all results and state
  const clearAll = () => {
    if (isMounted.current) {
      setResults(new Map());
      setLoadingRunIds(new Set());
      setErrors(new Map());
      fetchedRunIdsRef.current = new Set();
    }
  };

  // Get results for a specific runId
  const getResult = (runId: string): DynamoDBResults | undefined => {
    return results.get(runId);
  };

  // Check if a specific runId is loading
  const isLoading = (runId: string): boolean => {
    return loadingRunIds.has(runId);
  };

  return {
    results,
    loadingRunIds,
    isLoading: loadingRunIds.size > 0,
    errors,
    fetchStatus: {
      isFetching: loadingRunIds.size > 0,
      completed: results.size,
      failed: errors.size,
      total: completedRunIds.size
    },
    actions: {
      retryFetch,
      clearError,
      clearAll
    },
    helpers: {
      getResult,
      isLoading
    }
  };
}
