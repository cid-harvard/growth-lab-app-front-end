import { useState, useCallback, useRef, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Autocomplete,
  Select,
  MenuItem,
  Button,
  ButtonGroup,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DownloadIcon from "@mui/icons-material/Download";
import { useNavigate, useLocation } from "react-router-dom";
import html2canvas from "html2canvas";

import GreenplexityHeader from "../GreenplexityHeader";
import DownloadModal from "../DownloadModal";
import GreenEciBumpChart from "../GreenEciBumpChart";
import { useGreenGrowthData } from "../../hooks/useGreenGrowthData";
import { RankingsMap } from "./components/RankingsMap";
import { RankingsTable } from "./components/RankingsTable";
import { getFlagSrc } from "./utils/flagLoader";
import { downloadTableAsCSV } from "./utils/csvExport";
import { PageWrapper, MapCard, Header } from "./styles";
import type {
  TooltipState,
  SortColumn,
  SortDirection,
  TabType,
  CountryYearMetric,
} from "./types";

const defaultYear = 2023;

const RankingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive tab state directly from URL
  const tab: TabType = location.pathname.endsWith("/map") ? "map" : "bump";

  // Use existing hook which can fetch all countries' year metrics and also gives us country metadata
  const [year, setYear] = useState<number>(defaultYear);
  const { allCountriesMetrics } = useGreenGrowthData(null, year, true);
  const { allCountriesMetrics: prevAllCountriesMetrics } = useGreenGrowthData(
    null,
    year - 5,
    true,
  );

  const [inputValue, setInputValue] = useState("");
  const [selectedIso3, setSelectedIso3] = useState<string>("");
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const mapVisualizationRef = useRef<HTMLDivElement | null>(null);
  const bumpChartContainerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    x: 0,
    y: 0,
    name: "",
    rank: null,
    greenEci: null,
  });
  const [sortColumn, setSortColumn] = useState<SortColumn>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isCapturingImage, setIsCapturingImage] = useState(false);

  // Fetch data for all years to compute global min/max (2012-2023, like overtime viz)
  const { allCountriesMetrics: allYears2023 } = useGreenGrowthData(
    null,
    2023,
    true,
  );
  const { allCountriesMetrics: allYears2022 } = useGreenGrowthData(
    null,
    2022,
    true,
  );
  const { allCountriesMetrics: allYears2021 } = useGreenGrowthData(
    null,
    2021,
    true,
  );
  const { allCountriesMetrics: allYears2020 } = useGreenGrowthData(
    null,
    2020,
    true,
  );
  const { allCountriesMetrics: allYears2019 } = useGreenGrowthData(
    null,
    2019,
    true,
  );
  const { allCountriesMetrics: allYears2018 } = useGreenGrowthData(
    null,
    2018,
    true,
  );
  const { allCountriesMetrics: allYears2017 } = useGreenGrowthData(
    null,
    2017,
    true,
  );
  const { allCountriesMetrics: allYears2016 } = useGreenGrowthData(
    null,
    2016,
    true,
  );
  const { allCountriesMetrics: allYears2015 } = useGreenGrowthData(
    null,
    2015,
    true,
  );
  const { allCountriesMetrics: allYears2014 } = useGreenGrowthData(
    null,
    2014,
    true,
  );
  const { allCountriesMetrics: allYears2013 } = useGreenGrowthData(
    null,
    2013,
    true,
  );
  const { allCountriesMetrics: allYears2012 } = useGreenGrowthData(
    null,
    2012,
    true,
  );

  // Compute global min/max across all years for consistent color scale with overtime viz
  const { globalMinValue, globalMaxValue } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    const allYearsData = [
      allYears2023,
      allYears2022,
      allYears2021,
      allYears2020,
      allYears2019,
      allYears2018,
      allYears2017,
      allYears2016,
      allYears2015,
      allYears2014,
      allYears2013,
      allYears2012,
    ];

    allYearsData.forEach((yearData) => {
      if (!yearData) return;

      yearData.forEach((d: CountryYearMetric) => {
        if (d?.rankingMetric) {
          const val = parseFloat(d.rankingMetric);
          if (!Number.isNaN(val)) {
            if (val < min) min = val;
            if (val > max) max = val;
          }
        }
      });
    });

    // Fallback if no data
    if (min === Infinity || max === -Infinity) {
      return { globalMinValue: 0, globalMaxValue: 1 };
    }

    return { globalMinValue: min, globalMaxValue: max };
  }, [
    allYears2023,
    allYears2022,
    allYears2021,
    allYears2020,
    allYears2019,
    allYears2018,
    allYears2017,
    allYears2016,
    allYears2015,
    allYears2014,
    allYears2013,
    allYears2012,
  ]);

  const scrollToIso = useCallback((iso3: string) => {
    setSelectedIso3(iso3);
    // Note: scrolling is now handled within the RankingsTable component itself
  }, []);

  // Country options for autocomplete
  const countryOptions = useMemo(() => {
    const valid = (allCountriesMetrics || []).filter(
      (d: CountryYearMetric): d is CountryYearMetric =>
        typeof d?.rank === "number" &&
        d?.rank !== null &&
        !!d?.rankingMetric &&
        d?.rankingMetric !== null &&
        !!d?.iso3Code,
    );
    return valid.map((d: CountryYearMetric) => ({
      label: String(d.nameEn || "Unknown"),
      iso3: String(d.iso3Code || ""),
    }));
  }, [allCountriesMetrics]);

  const availableYears = useMemo(
    () => Array.from({ length: 13 }, (_, i) => 2023 - i),
    [],
  );

  // Image download function
  const downloadVisualizationImage = useCallback(async () => {
    const targetRef =
      tab === "map" ? mapVisualizationRef : bumpChartContainerRef;

    if (!targetRef.current) {
      console.error("Visualization container not found");
      return;
    }

    try {
      // Show title and hide tooltip during capture
      const tooltipState = { ...tooltip };
      setIsCapturingImage(true);
      setTooltip((t) => ({ ...t, show: false }));

      // Wait for state update and render
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: "#ffffff",
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
      });

      // Restore state
      setIsCapturingImage(false);
      setTooltip(tooltipState);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          const filename = `greenplexity_${tab === "map" ? `map_${year}` : "overtime"}.png`;
          link.download = filename;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error("Error capturing image:", error);
      // Restore state on error
      setIsCapturingImage(false);
      setTooltip(tooltip);
    }
  }, [tab, year, tooltip]);

  // Build lookup of previous period ranks for CSV export
  const prevRankByIso3 = useMemo(() => {
    const validPrev = (prevAllCountriesMetrics || []).filter(
      (d: CountryYearMetric): d is CountryYearMetric =>
        typeof d?.rank === "number" && d?.rank !== null && !!d?.iso3Code,
    );
    return new Map<string, number>(
      validPrev.map((d: CountryYearMetric) => [
        String(d.iso3Code || ""),
        d.rank || 0,
      ]),
    );
  }, [prevAllCountriesMetrics]);

  // Sorted ranked for CSV export
  const sortedRanked = useMemo(() => {
    const valid = (allCountriesMetrics || []).filter(
      (d: CountryYearMetric): d is CountryYearMetric =>
        typeof d?.rank === "number" &&
        d?.rank !== null &&
        !!d?.rankingMetric &&
        d?.rankingMetric !== null &&
        !!d?.iso3Code,
    );
    return [...valid]
      .sort(
        (a: CountryYearMetric, b: CountryYearMetric) =>
          (a.rank || 0) - (b.rank || 0),
      )
      .map((d: CountryYearMetric) => ({
        rank: d.rank || 0,
        name: String(d.nameEn || "Unknown"),
        iso3: String(d.iso3Code || ""),
        rankingMetric: d.rankingMetric ? parseFloat(d.rankingMetric) : 0,
      }));
  }, [allCountriesMetrics]);

  return (
    <>
      <GreenplexityHeader position="fixed" heightPx={60} maxWidth="lg" />
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <PageWrapper>
          <Header>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                mb: 2,
                fontSize: "2.5rem",
                mt: 0,
              }}
            >
              Greenplexity Index
            </Typography>
            <br />
            <Typography
              variant="body1"
              sx={{ mb: 2, lineHeight: 1.6, fontSize: "1.25rem" }}
            >
              Harvard Growth Lab's Greenplexity ranking captures countries'
              presence in green value chains, based on the breadth and
              complexity of its industries in green value chains. This metric
              shows how many capabilities a country has in the industries
              driving the energy transition.
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 2, lineHeight: 1.6, fontSize: "1.25rem" }}
            >
              Countries improve their Greenplexity ranking by making more—and
              more complex—products within green value chains. Use the
              visualizations below to 1) see a country's Greenplexity ranking,
              2) track how the ranking changed over five years, and 3) compare
              the ranking to other peer countries.
            </Typography>
          </Header>

          {/* Shared Controls Row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
              mb: 3,
            }}
          >
            <ButtonGroup
              sx={{
                height: "40px",
                border: "1px solid #000",
                borderRadius: "4px",
                overflow: "hidden",
                "& .MuiButton-root": {
                  border: "none !important",
                  borderRadius: 0,
                },
              }}
            >
              <Button
                onClick={() => {
                  const basePath = location.pathname.replace(/\/map$/, "");
                  navigate(basePath);
                }}
                sx={{
                  textTransform: "uppercase",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  px: 2,
                  backgroundColor: tab === "bump" ? "#3AA0C1" : "#fff",
                  color: tab === "bump" ? "#fff" : "#000",
                  borderRight: "1px solid #000 !important",
                  "&:hover": {
                    backgroundColor: tab === "bump" ? "#3AA0C1" : "#f5f5f5",
                  },
                  "&:focus": {
                    boxShadow: "none",
                  },
                }}
              >
                Over Time
              </Button>
              <Button
                onClick={() => {
                  const basePath = location.pathname.replace(/\/map$/, "");
                  navigate(`${basePath}/map`);
                }}
                sx={{
                  textTransform: "uppercase",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  px: 2,
                  backgroundColor: tab === "map" ? "#3AA0C1" : "#fff",
                  color: tab === "map" ? "#fff" : "#000",
                  "&:hover": {
                    backgroundColor: tab === "map" ? "#3AA0C1" : "#f5f5f5",
                  },
                  "&:focus": {
                    boxShadow: "none",
                  },
                }}
              >
                Geo Map
              </Button>
            </ButtonGroup>

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
              value={
                countryOptions.find((o) => o.iso3 === selectedIso3) || null
              }
              onChange={(_e, option) => {
                const iso = option?.iso3 || "";
                scrollToIso(iso);
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

            {tab === "map" && (
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
            )}

            <Button
              onClick={() => setDownloadModalOpen(true)}
              variant="text"
              startIcon={<DownloadIcon />}
              sx={{
                height: "40px",
                textTransform: "uppercase",
                fontWeight: 600,
                fontSize: "0.875rem",
                color: "#000",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              Download
            </Button>
          </Box>

          {tab === "map" ? (
            <RankingsMap
              allCountriesMetrics={allCountriesMetrics}
              globalMinValue={globalMinValue}
              globalMaxValue={globalMaxValue}
              year={year}
              selectedIso3={selectedIso3}
              tooltip={tooltip}
              setTooltip={setTooltip}
              scrollToIso={scrollToIso}
              isCapturingImage={isCapturingImage}
            />
          ) : (
            <MapCard>
              <Box
                ref={bumpChartContainerRef}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: isCapturingImage ? 2 : 0,
                  backgroundColor: "#ffffff",
                  p: isCapturingImage ? 2 : 0,
                }}
              >
                {/* Title for image export - only visible during capture */}
                {isCapturingImage && (
                  <Typography
                    variant="h4"
                    component="h2"
                    sx={{
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontSize: "2rem",
                      textAlign: "center",
                    }}
                  >
                    Greenplexity Index
                  </Typography>
                )}
                {/* Hover instruction */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Box
                    component="svg"
                    viewBox="0 0 28.87 51.84"
                    sx={{
                      width: 24,
                      height: 24,
                      "& .cls-1": {
                        fill: "rgb(232, 237, 237)",
                        stroke: "rgb(51, 51, 51)",
                        strokeMiterlimit: 10,
                        strokeWidth: "0.75px",
                      },
                    }}
                  >
                    <path
                      className="cls-1"
                      d="M61.49,62a2.55,2.55,0,0,0-2.55,2.55V62h0a2.56,2.56,0,1,0-5.11,0h0V59.45a2.56,2.56,0,0,0-2.56-2.55,2.59,2.59,0,0,0-2.55,2.23V46.69a2.54,2.54,0,0,0-2.51-2.59,2.59,2.59,0,0,0-2.6,2.59V68.08L42.1,61.54A3.17,3.17,0,0,0,36,63.41L38.5,77.32C44,82.83,45.56,85.68,46,86.87a1,1,0,0,0,.94.67H60.6a1,1,0,0,0,1-.81L64,75a2.94,2.94,0,0,0,0-.51v-10A2.57,2.57,0,0,0,61.49,62Z"
                      transform="translate(-35.57 -36.08)"
                    />
                    <path
                      className="cls-1"
                      d="M41.05,55.48V46.69a5.14,5.14,0,0,1,5.14-5.14,5.07,5.07,0,0,1,5.08,5.14v8.79a10.22,10.22,0,1,0-10.22,0Z"
                      transform="translate(-35.57 -36.08)"
                    />
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "1rem",
                      color: "#333",
                    }}
                  >
                    Hover on a country to see its ranking
                  </Typography>
                </Box>
                <GreenEciBumpChart
                  selectedIso3={selectedIso3}
                  setSelectedIso3={setSelectedIso3}
                  countryOptions={countryOptions}
                />
              </Box>
            </MapCard>
          )}

          <RankingsTable
            allCountriesMetrics={allCountriesMetrics}
            prevAllCountriesMetrics={prevAllCountriesMetrics}
            globalMinValue={globalMinValue}
            globalMaxValue={globalMaxValue}
            year={year}
            availableYears={availableYears}
            selectedIso3={selectedIso3}
            setSelectedIso3={setSelectedIso3}
            setYear={setYear}
            inputValue={inputValue}
            setInputValue={setInputValue}
            sortColumn={sortColumn}
            setSortColumn={setSortColumn}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
          />
        </PageWrapper>
      </Container>

      {/* Download Modal */}
      <DownloadModal
        open={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        customImageHandler={downloadVisualizationImage}
        customDataHandler={() =>
          downloadTableAsCSV(sortedRanked, year, prevRankByIso3)
        }
        imageAvailable={true}
        descriptionText={`Download a high-resolution image of the current visualization or ${tab === "map" ? "Greenplexity map" : "Greenplexity overtime"} ranking data as a CSV file.`}
      />
    </>
  );
};

export default RankingsPage;
