import { useSearchParams, useLocation } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

/**
 * Hook for managing page-specific visualization control state in URL parameters
 * These params are namespaced by route to avoid conflicts between pages
 */
export const useVisualizationControls = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Create a page-specific prefix from the current route
  const pagePrefix = useMemo(() => {
    // Convert route to param prefix (e.g., "/greenplexity/overview" -> "overview_")
    const route = location.pathname;
    const routeParts = route.split('/');
    const lastPart = routeParts[routeParts.length - 1] || 'default';
    return `${lastPart}_`;
  }, [location.pathname]);

  // Get control value with page-specific key
  const getControlValue = useCallback(
    (controlKey: string, defaultValue: string): string => {
      const paramKey = `${pagePrefix}${controlKey}`;
      return searchParams.get(paramKey) || defaultValue;
    },
    [searchParams, pagePrefix],
  );

  // Set control value with page-specific key
  const setControlValue = useCallback(
    (controlKey: string, value: string, defaultValue?: string) => {
      const paramKey = `${pagePrefix}${controlKey}`;
      const newParams = new URLSearchParams(searchParams);

      // Remove param if it's the default value, otherwise set it
      if (defaultValue && value === defaultValue) {
        newParams.delete(paramKey);
      } else {
        newParams.set(paramKey, value);
      }

      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams, pagePrefix],
  );

  // Clear all page-specific control params
  const clearPageControls = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);

    // Remove all params that start with our page prefix
    const keysToRemove: string[] = [];
    newParams.forEach((_, key) => {
      if (key.startsWith(pagePrefix)) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach((key) => newParams.delete(key));
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams, pagePrefix]);

  return {
    getControlValue,
    setControlValue,
    clearPageControls,
    pagePrefix, // For debugging
  };
};
