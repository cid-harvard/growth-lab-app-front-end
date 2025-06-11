import { useSearchParams } from "react-router-dom";
import { useCallback } from "react";

// Default values (matching the original Recoil atoms)
const DEFAULT_YEAR = "2022";
const DEFAULT_COUNTRY = "710";

export const useUrlParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get current values with defaults
  const yearSelection = searchParams.get("year") || DEFAULT_YEAR;
  const countrySelection = parseInt(
    searchParams.get("country") || DEFAULT_COUNTRY,
  );

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

  return {
    yearSelection,
    countrySelection,
    setYearSelection,
    setCountrySelection,
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
