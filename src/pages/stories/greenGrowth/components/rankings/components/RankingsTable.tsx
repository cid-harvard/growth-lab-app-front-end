import { useMemo, useRef, useCallback, useEffect } from "react";
import { Box, TextField, Autocomplete, Select, MenuItem } from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { createContinuousColorScale } from "../../../utils/colors";
import { getFlagSrc } from "../utils/flagLoader";
import { YAxisAnnotation } from "./YAxisAnnotation";
import { TableCard, TableEl, Controls } from "../styles";
import type {
  CountryYearMetric,
  RankedRow,
  SortColumn,
  SortDirection,
} from "../types";

type RankingsTableProps = {
  allCountriesMetrics: CountryYearMetric[] | null;
  prevAllCountriesMetrics: CountryYearMetric[] | null;
  globalMinValue: number;
  globalMaxValue: number;
  year: number;
  availableYears: number[];
  selectedIso3: string;
  setSelectedIso3: (iso3: string) => void;
  setYear: (year: number) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  sortColumn: SortColumn;
  setSortColumn: (column: SortColumn) => void;
  sortDirection: SortDirection;
  setSortDirection: (direction: SortDirection) => void;
};

// Helper component for sort indicator
const SortIndicator = ({
  column,
  currentColumn,
  currentDirection,
}: {
  column: SortColumn;
  currentColumn: SortColumn;
  currentDirection: SortDirection;
}) => {
  const isActive = column === currentColumn;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        ml: 0.5,
      }}
    >
      <ArrowDropUpIcon
        sx={{
          fontSize: 32,
          color: isActive && currentDirection === "asc" ? "#000" : "#ccc",
          marginBottom: "-12px",
        }}
      />
      <ArrowDropDownIcon
        sx={{
          fontSize: 32,
          color: isActive && currentDirection === "desc" ? "#000" : "#ccc",
        }}
      />
    </Box>
  );
};

export const RankingsTable = ({
  allCountriesMetrics,
  prevAllCountriesMetrics,
  globalMinValue,
  globalMaxValue,
  year,
  availableYears,
  selectedIso3,
  setSelectedIso3,
  setYear,
  inputValue,
  setInputValue,
  sortColumn,
  setSortColumn,
  sortDirection,
  setSortDirection,
}: RankingsTableProps) => {
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());

  // Prepare ranked data
  const ranked = useMemo(() => {
    const valid: CountryYearMetric[] = (allCountriesMetrics || []).filter(
      (d: unknown): d is CountryYearMetric =>
        typeof (d as CountryYearMetric)?.rank === "number" &&
        (d as CountryYearMetric)?.rank !== null &&
        !!(d as CountryYearMetric)?.rankingMetric &&
        (d as CountryYearMetric)?.rankingMetric !== null &&
        !!(d as CountryYearMetric)?.iso3Code,
    );

    const rankedList: RankedRow[] = [...valid]
      .sort((a, b) => (a.rank || 0) - (b.rank || 0))
      .map((d) => ({
        rank: d.rank || 0,
        name: String(d.nameEn || "Unknown"),
        iso3: String(d.iso3Code || ""),
        rankingMetric: d.rankingMetric ? parseFloat(d.rankingMetric) : 0,
      }));

    return rankedList;
  }, [allCountriesMetrics]);

  // Build lookup of previous period ranks (5 years earlier)
  const prevRankByIso3 = useMemo(() => {
    const validPrev: CountryYearMetric[] = (
      prevAllCountriesMetrics || []
    ).filter(
      (d: unknown): d is CountryYearMetric =>
        typeof (d as CountryYearMetric)?.rank === "number" &&
        (d as CountryYearMetric)?.rank !== null &&
        !!(d as CountryYearMetric)?.iso3Code,
    );
    return new Map<string, number>(
      validPrev.map((d) => [String(d.iso3Code || ""), d.rank || 0]),
    );
  }, [prevAllCountriesMetrics]);

  // Apply sorting to the ranked list
  const sortedRanked = useMemo(() => {
    const sorted = [...ranked];
    sorted.sort((a, b) => {
      let compareValue = 0;
      switch (sortColumn) {
        case "rank":
          compareValue = a.rank - b.rank;
          break;
        case "country":
          compareValue = a.name.localeCompare(b.name);
          break;
        case "greenplexity":
          compareValue = a.rankingMetric - b.rankingMetric;
          break;
        case "change": {
          const prevA = prevRankByIso3.get(a.iso3);
          const prevB = prevRankByIso3.get(b.iso3);
          const deltaA = typeof prevA === "number" ? prevA - a.rank : -Infinity;
          const deltaB = typeof prevB === "number" ? prevB - b.rank : -Infinity;
          compareValue = deltaA - deltaB;
          break;
        }
      }
      return sortDirection === "asc" ? compareValue : -compareValue;
    });
    return sorted;
  }, [ranked, sortColumn, sortDirection, prevRankByIso3]);

  // Use continuous color scale for table swatches
  const colorScale = useMemo(() => {
    return createContinuousColorScale(globalMinValue, globalMaxValue);
  }, [globalMinValue, globalMaxValue]);

  const rankColor = useMemo(() => {
    return (rankingMetric: number) => colorScale(rankingMetric);
  }, [colorScale]);

  // Dropdown options for countries
  const countryOptions = useMemo(
    () => ranked.map((r) => ({ label: r.name, iso3: r.iso3 })),
    [ranked],
  );

  const handleSort = useCallback(
    (column: SortColumn) => {
      if (sortColumn === column) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortColumn(column);
        // Set default sort direction based on column type
        switch (column) {
          case "country":
            setSortDirection("asc"); // A-Z
            break;
          case "greenplexity":
            setSortDirection("desc"); // High to low
            break;
          case "rank":
            setSortDirection("asc"); // Low rank (1) to high rank
            break;
          case "change":
            setSortDirection("desc"); // Biggest positive change first
            break;
        }
      }
    },
    [sortColumn, sortDirection, setSortColumn, setSortDirection],
  );

  // Keep the table search input in sync with external selections
  useEffect(() => {
    const label =
      countryOptions.find((o) => o.iso3 === selectedIso3)?.label || "";
    setInputValue(label);
  }, [selectedIso3, countryOptions, setInputValue]);

  return (
    <TableCard>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
          marginBottom: 0,
          marginTop: 10,
        }}
      >
        <Controls>
          <Autocomplete
            blurOnSelect
            sx={{
              width: 300,
              "& .MuiAutocomplete-popupIndicator": {
                transform: "rotate(0deg)",
                transition: "transform 150ms ease",
              },
              "& .MuiAutocomplete-popupIndicatorOpen": {
                transform: "rotate(180deg)",
              },
              "& .MuiAutocomplete-clearIndicator": {
                visibility: "visible",
              },
            }}
            popupIcon={<KeyboardArrowDownIcon />}
            options={countryOptions}
            value={countryOptions.find((o) => o.iso3 === selectedIso3) || null}
            inputValue={inputValue}
            onInputChange={(_e, v) => setInputValue(v)}
            onChange={(_e, option) => {
              const iso = option?.iso3 || "";
              setSelectedIso3(iso);
              if (iso) {
                const container = tableContainerRef.current;
                const row = rowRefs.current.get(iso);
                if (container && row) {
                  const top =
                    row.offsetTop -
                    container.clientHeight / 2 +
                    row.clientHeight / 2;
                  container.scrollTo({ top, behavior: "smooth" });
                }
              }
            }}
            getOptionLabel={(o) => o.label}
            isOptionEqualToValue={(o, v) => o.iso3 === v.iso3}
            renderOption={(props, option) => {
              const src = getFlagSrc(option.iso3);
              return (
                <li {...props}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {src && (
                      <img
                        src={src}
                        alt=""
                        width={20}
                        height={14}
                        style={{ borderRadius: 2 }}
                      />
                    )}
                    {option.label}
                  </Box>
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                placeholder="Search for a country"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "1rem",
                    "& fieldset": { borderColor: "#000" },
                    "&:hover fieldset": { borderColor: "#000" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#000",
                      borderWidth: "2px",
                    },
                  },
                }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (() => {
                    const selected = countryOptions.find(
                      (o) => o.iso3 === selectedIso3,
                    );
                    const src = selected ? getFlagSrc(selected.iso3) : null;
                    return (
                      <>
                        {src && (
                          <img
                            src={src}
                            alt=""
                            width={20}
                            height={14}
                            style={{ marginRight: 8, borderRadius: 2 }}
                          />
                        )}
                        {params.InputProps.startAdornment}
                      </>
                    );
                  })(),
                }}
              />
            )}
          />

          <Select
            size="small"
            IconComponent={KeyboardArrowDownIcon}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            sx={{
              minWidth: 100,
              fontSize: "1rem",
              height: "40px",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#000",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#000",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#000",
                borderWidth: "2px",
              },
              "& .MuiSelect-select": {
                display: "flex",
                alignItems: "center",
                height: "40px",
                padding: "0 14px",
              },
              "& .MuiSelect-icon": {
                top: "50%",
                transform: "translateY(-50%) rotate(0deg)",
                transition: "transform 150ms ease",
              },
              "& .MuiSelect-icon.MuiSelect-iconOpen": {
                transform: "translateY(-50%) rotate(180deg)",
              },
            }}
          >
            {availableYears.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </Controls>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 4 }}>
        <YAxisAnnotation />
        <div
          ref={tableContainerRef}
          style={{
            maxHeight: 420,
            overflow: "auto",
            flex: 1,
          }}
        >
          <TableEl>
            <thead>
              <tr>
                <th style={{ width: 10, cursor: "default" }} />
                <th
                  style={{
                    textTransform: "uppercase",
                    fontWeight: 600,
                    fontSize: 20,
                  }}
                  onClick={() => handleSort("rank")}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    RANK
                    <SortIndicator
                      column="rank"
                      currentColumn={sortColumn}
                      currentDirection={sortDirection}
                    />
                  </Box>
                </th>
                <th
                  style={{
                    textTransform: "uppercase",
                    fontWeight: 600,
                    fontSize: 20,
                  }}
                  onClick={() => handleSort("country")}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    COUNTRY
                    <SortIndicator
                      column="country"
                      currentColumn={sortColumn}
                      currentDirection={sortDirection}
                    />
                  </Box>
                </th>
                <th
                  style={{
                    textAlign: "center",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    fontSize: 20,
                  }}
                  onClick={() => handleSort("greenplexity")}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.5,
                    }}
                  >
                    GREENPLEXITY INDEX
                    <SortIndicator
                      column="greenplexity"
                      currentColumn={sortColumn}
                      currentDirection={sortDirection}
                    />
                  </Box>
                </th>
                <th
                  style={{
                    textAlign: "center",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    fontSize: 20,
                  }}
                  onClick={() => handleSort("change")}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.5,
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      CHANGE IN 5YRS
                      <SortIndicator
                        column="change"
                        currentColumn={sortColumn}
                        currentDirection={sortDirection}
                      />
                    </Box>
                    <Box>
                      ({year - 5} - {year})
                    </Box>
                  </Box>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRanked.map((row: RankedRow) => {
                const swatchColor = rankColor(row.rankingMetric);
                const prevRank = prevRankByIso3.get(row.iso3);
                const delta =
                  typeof prevRank === "number" ? prevRank - row.rank : null;
                const deltaColor =
                  delta === null
                    ? "#9e9e9e"
                    : delta > 0
                      ? "#1d8968"
                      : delta < 0
                        ? "#dd6852"
                        : "#9e9e9e";

                // SVG arrow or equals sign
                const deltaDisplay =
                  delta === null ? (
                    <span>? N/A</span>
                  ) : delta === 0 ? (
                    <span style={{ fontSize: "1.5rem", fontWeight: 600 }}>
                      =
                    </span>
                  ) : (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <svg
                        width="12"
                        height="16"
                        viewBox="0 0 12 16"
                        style={{ display: "inline-block" }}
                        aria-label={
                          delta > 0 ? "Rank increased" : "Rank decreased"
                        }
                      >
                        <title>
                          {delta > 0 ? "Rank increased" : "Rank decreased"}
                        </title>
                        {delta > 0 ? (
                          <path
                            d="M6 2 L6 14 M2 6 Q3 4, 6 2 Q9 4, 10 6"
                            fill="none"
                            stroke={deltaColor}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        ) : (
                          <path
                            d="M6 14 L6 2 M2 10 Q3 12, 6 14 Q9 12, 10 10"
                            fill="none"
                            stroke={deltaColor}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}
                      </svg>
                      <span>{Math.abs(delta)}</span>
                    </span>
                  );

                return (
                  <tr
                    key={row.iso3}
                    ref={(el) => {
                      if (el) rowRefs.current.set(row.iso3, el);
                    }}
                    onClick={() => setSelectedIso3(row.iso3)}
                    style={{
                      background:
                        selectedIso3 === row.iso3 ? "#f0f6ff" : undefined,
                      fontWeight: selectedIso3 === row.iso3 ? 600 : 400,
                      cursor: "pointer",
                      fontSize: 16,
                    }}
                  >
                    <td style={{ paddingRight: 0 }}>
                      <div
                        aria-hidden
                        style={{
                          width: 8,
                          height: 14,
                          borderRadius: 2,
                          background: swatchColor,
                        }}
                      />
                    </td>
                    <td style={{ fontWeight: 800 }}>{row.rank}</td>
                    <td>{row.name}</td>
                    <td style={{ textAlign: "center" }}>
                      {row.rankingMetric.toFixed(2)}
                    </td>
                    <td style={{ textAlign: "center", color: deltaColor }}>
                      {deltaDisplay}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </TableEl>
        </div>
      </Box>
    </TableCard>
  );
};
