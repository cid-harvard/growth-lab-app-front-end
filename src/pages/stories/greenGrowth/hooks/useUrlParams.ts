import { useSearchParams } from "react-router-dom";
import { useCallback } from "react";

// Default values (matching the original Recoil atoms)
const DEFAULT_YEAR = "2023";
const DEFAULT_COUNTRY = "710";
const DEFAULT_CLUSTER = "";

export const useUrlParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get current values with defaults
  const yearSelection = searchParams.get("year") || DEFAULT_YEAR;
  const countrySelection = parseInt(
    searchParams.get("country") || DEFAULT_COUNTRY,
  );
  const clusterSelection = searchParams.get("cluster") || DEFAULT_CLUSTER;

  // Setters that update URL params
  const setYearSelection = useCallback(
    (year: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (year === DEFAULT_YEAR) {
        newParams.delete("year");
      } else {
        newParams.set("year", year);
      }
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const setCountrySelection = useCallback(
    (country: number) => {
      const newParams = new URLSearchParams(searchParams);
      if (country.toString() === DEFAULT_COUNTRY) {
        newParams.delete("country");
      } else {
        newParams.set("country", country.toString());
      }
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const setClusterSelection = useCallback(
    (cluster: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (cluster === DEFAULT_CLUSTER) {
        newParams.delete("cluster");
      } else {
        newParams.set("cluster", cluster);
      }
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  return {
    yearSelection,
    countrySelection,
    clusterSelection,
    setYearSelection,
    setCountrySelection,
    setClusterSelection,
  };
};

// Convenience hooks for read-only access
export const useYearSelection = () => {
  const { yearSelection } = useUrlParams();
  return yearSelection;
};

export const useCountrySelection = () => {
  const { countrySelection } = useUrlParams();
  return countrySelection;
};

export const useClusterSelection = () => {
  const { clusterSelection, setClusterSelection } = useUrlParams();
  return { clusterSelection, setClusterSelection };
};
