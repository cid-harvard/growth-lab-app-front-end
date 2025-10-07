import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Tabs,
  Tab,
  Autocomplete,
  Select,
  MenuItem,
} from "@mui/material";
import GreenplexityHeader from "./GreenplexityHeader";
import styled from "styled-components";
import raw from "raw.macro";
// import { ColorScaleLegend } from "react-fast-charts";
import { useGreenGrowthData } from "../hooks/useGreenGrowthData";
import GreenEciBumpChart from "./GreenEciBumpChart";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { scaleLinear } from "d3-scale";

// Load world countries geojson used elsewhere in the app
type WorldProps = { iso_alpha3: string; name: string } & Record<
  string,
  unknown
>;
type WorldFeature = Feature<Geometry, WorldProps>;
type AugmentedProps = WorldProps & {
  percent: number;
  tooltipContent: string;
  void: boolean;
};

const worldGeoJson: FeatureCollection<Geometry, WorldProps> = JSON.parse(
  raw("../../../../assets/world-geojson.json"),
);

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0 24px;
`;

const MapCard = styled.div`
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
`;

const TableCard = styled.div`
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
`;

const TabsCard = styled.div`
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
`;

const TableEl = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  thead th {
    text-align: left;
    padding: 8px 8px;
    border-bottom: 1px solid #e7e7e7;
    position: sticky;
    top: 0;
    background: #ffffff;
    z-index: 1;
  }
  tbody td {
    padding: 8px 8px;
    border-bottom: 1px solid #f0f0f0;
  }
  tbody tr:hover {
    background: #fafafa;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 6px;
`;

const Controls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`;

const defaultYear = 2023;

type CountryYearMetric = {
  countryId: number;
  year: number;
  nameEn?: string;
  iso3Code?: string;
  rank?: number | null;
  rankingMetric?: string | null; // API returns this as a string
  coiGreen?: number;
};

type RankedRow = {
  rank: number;
  name: string;
  iso3: string;
  rankingMetric: number;
};

type HorizontalColorScaleLegendProps = {
  minLabel: string;
  maxLabel: string;
  minColor: string;
  maxColor: string;
  title?: string;
  rootStyles?: React.CSSProperties;
  midColor?: string;
  midAt?: number; // 0..1 position for the midpoint (e.g., where value 0 lies)
  colors?: string[]; // optional multi-stop colors including center color
};

const HorizontalColorScaleLegend = (props: HorizontalColorScaleLegendProps) => {
  const {
    minLabel,
    maxLabel,
    minColor,
    maxColor,
    title,
    rootStyles,
    midColor = "#ffffff",
    midAt,
    colors,
  } = props;
  const gradient = (() => {
    if (Array.isArray(colors) && colors.length >= 3) {
      const centerIndex = Math.floor(colors.length / 2);
      if (typeof midAt === "number" && midAt >= 0 && midAt <= 1) {
        const leftCount = centerIndex;
        const rightCount = colors.length - centerIndex - 1;
        const stops: string[] = [];
        for (let i = 0; i < leftCount; i++) {
          const pos = midAt * (i / leftCount) * 100;
          stops.push(`${colors[i]} ${pos.toFixed(2)}%`);
        }
        stops.push(`${colors[centerIndex]} ${(midAt * 100).toFixed(2)}%`);
        for (let i = 1; i <= rightCount; i++) {
          const pos = (midAt + (1 - midAt) * (i / rightCount)) * 100;
          stops.push(`${colors[centerIndex + i]} ${pos.toFixed(2)}%`);
        }
        return `linear-gradient(90deg, ${stops.join(", ")})`;
      }
      // Even spacing if no midAt
      const step = 100 / (colors.length - 1);
      const stops = colors.map((c, i) => `${c} ${(i * step).toFixed(2)}%`);
      return `linear-gradient(90deg, ${stops.join(", ")})`;
    }
    if (typeof midAt === "number") {
      return `linear-gradient(90deg, ${minColor} 0%, ${midColor} ${(Math.max(0, Math.min(1, midAt)) * 100).toFixed(2)}%, ${maxColor} 100%)`;
    }
    return `linear-gradient(90deg, ${minColor} 0%, ${maxColor} 100%)`;
  })();
  return (
    <div style={{ width: "100%", ...rootStyles }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          maxWidth: 520,
          margin: "0 auto",
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", minWidth: 40, textAlign: "right" }}
        >
          {minLabel}
        </Typography>
        <div
          style={{
            flex: 1,
            height: 10,
            borderRadius: 4,
            background: gradient,
            border: "1px solid #e0e0e0",
          }}
        />
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", minWidth: 40 }}
        >
          {maxLabel}
        </Typography>
      </Box>
      {title ? (
        <Typography
          variant="caption"
          align="center"
          sx={{ display: "block", mt: 0.75, color: "text.secondary" }}
        >
          {title}
        </Typography>
      ) : null}
    </div>
  );
};

const RankingsPage = () => {
  // Use existing hook which can fetch all countries' year metrics and also gives us country metadata
  const [year, setYear] = useState<number>(defaultYear);
  const { allCountriesMetrics } = useGreenGrowthData(null, year, true);
  const { allCountriesMetrics: prevAllCountriesMetrics } = useGreenGrowthData(
    null,
    year - 5,
    true,
  );

  const [inputValue, setInputValue] = useState("");
  const [tab, setTab] = useState<"map" | "bump">("map");
  const [selectedIso3, setSelectedIso3] = useState<string>("");
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const [mapWidth, setMapWidth] = useState<number>(900);
  const [mapHeight, setMapHeight] = useState<number>(500);
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    name: string;
    rank: number | null;
    greenEci: number | null;
  }>({ show: false, x: 0, y: 0, name: "", rank: null, greenEci: null });

  const scrollToIso = useCallback((iso3: string) => {
    setSelectedIso3(iso3);
    const container = tableContainerRef.current;
    const row = rowRefs.current.get(iso3);
    if (container && row) {
      const top =
        row.offsetTop - container.clientHeight / 2 + row.clientHeight / 2;
      container.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  // Responsive sizing: when the map tab is visible, measure immediately and observe resizes
  useEffect(() => {
    if (tab !== "map") return;
    const container = mapContainerRef.current;
    if (!container) return;

    // Measure immediately in case the observer fires late after tab switch
    const wNow = Math.max(300, Math.floor(container.clientWidth));
    const hNow = Math.max(260, Math.round(wNow * 0.55));
    setMapWidth(wNow);
    setMapHeight(hNow);

    if (!("ResizeObserver" in window)) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(300, Math.floor(entry.contentRect.width));
        const h = Math.max(260, Math.round(w * 0.55));
        setMapWidth(w);
        setMapHeight(h);
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [tab]);

  // Prepare metrics and world map data
  const { featureCollection, minValue, maxValue, ranked } = useMemo(() => {
    const valid: CountryYearMetric[] = (allCountriesMetrics || []).filter(
      (d: unknown): d is CountryYearMetric =>
        typeof (d as CountryYearMetric)?.rank === "number" &&
        (d as CountryYearMetric)?.rank !== null &&
        !!(d as CountryYearMetric)?.rankingMetric &&
        (d as CountryYearMetric)?.rankingMetric !== null &&
        !!(d as CountryYearMetric)?.iso3Code,
    );

    // Join onto world features
    const featureWithValues: Feature<Geometry, AugmentedProps>[] =
      worldGeoJson.features.map((f: WorldFeature) => {
        const iso3 = f.properties.iso_alpha3;
        const m = valid.find((d) => d.iso3Code === iso3);
        const value: number | null = m?.rankingMetric
          ? parseFloat(m.rankingMetric)
          : null;
        const tooltip = m
          ? `<div><strong>${m.nameEn}</strong><br/>Rank: ${m.rank}<br/>Green ECI: ${value !== null ? value.toFixed(2) : "N/A"}</div>`
          : `<div><strong>${f.properties.name}</strong><br/>Rank: N/A</div>`;
        return {
          ...f,
          properties: {
            ...f.properties,
            percent: value ?? 0,
            tooltipContent: tooltip,
            void: value === null,
          },
        } as unknown as Feature<Geometry, AugmentedProps>;
      });

    const values = valid
      .map((d) => (d.rankingMetric ? parseFloat(d.rankingMetric) : null))
      .filter((v): v is number => v !== null);
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 1;

    // Table rankings - use rank from API
    const rankedList: RankedRow[] = [...valid]
      .sort((a, b) => (a.rank || 0) - (b.rank || 0))
      .map((d) => ({
        rank: d.rank || 0,
        name: String(d.nameEn || "Unknown"),
        iso3: String(d.iso3Code || ""),
        rankingMetric: d.rankingMetric ? parseFloat(d.rankingMetric) : 0,
      }));

    const fc: FeatureCollection<Geometry, AugmentedProps> = {
      type: worldGeoJson.type,
      features: featureWithValues,
    };

    return {
      featureCollection: fc,
      minValue: min,
      maxValue: max,
      ranked: rankedList,
    };
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

  // Color scale for the map - sequential grey to green
  const colorScale = useMemo(() => {
    const grey = "#e0e0e0";
    const green = "#1d8968";
    return scaleLinear<string>()
      .domain([minValue, maxValue])
      .range([grey, green])
      .clamp(true);
  }, [minValue, maxValue]);

  // Build SVG path data per country
  const mapPaths = useMemo(() => {
    const rankLookup = new Map(
      (ranked as RankedRow[]).map((r) => [
        r.iso3,
        { rank: r.rank, name: r.name, rankingMetric: r.rankingMetric },
      ]),
    );
    const projection = geoNaturalEarth1().fitSize(
      [mapWidth, mapHeight],
      featureCollection as FeatureCollection,
    );
    const path = geoPath(projection);
    return featureCollection.features.map((f) => {
      const props = f.properties as AugmentedProps;
      const rr = rankLookup.get(props.iso_alpha3);
      return {
        iso3: props.iso_alpha3,
        name: props.name,
        d: path(f as Feature<Geometry, AugmentedProps>) || "",
        value: props.percent,
        rank: rr ? rr.rank : null,
        greenEci: rr ? rr.rankingMetric : null,
      } as {
        iso3: string;
        name: string;
        d: string;
        value: number;
        rank: number | null;
        greenEci: number | null;
      };
    });
  }, [featureCollection, mapWidth, mapHeight, ranked]);

  // Dropdown options for countries
  const countryOptions = useMemo(
    () => (ranked as RankedRow[]).map((r) => ({ label: r.name, iso3: r.iso3 })),
    [ranked],
  );

  const availableYears = useMemo(
    () => Array.from({ length: 13 }, (_, i) => 2023 - i),
    [],
  );

  // Rank color scale for table row swatches (green → grey → red)
  const rankColor = useMemo(() => {
    const total = (ranked as RankedRow[]).length || 1;
    const mid = Math.max(2, Math.round(total / 2));
    return scaleLinear<string>()
      .domain([1, mid, total])
      .range(["#1d8968", "#cccaca", "#dd6852"]) // top ranks green, middle grey, bottom red
      .clamp(true);
  }, [ranked]);

  // Small vertical y-axis-style annotation shown to the left of the table
  const YAxisAnnotation = () => (
    <div
      aria-hidden
      style={{
        width: 70,
        minWidth: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "sticky",
        left: 0,
        top: 0,
        height: 420,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", textAlign: "center" }}
        >
          MORE COMPLEX
        </Typography>
        <div
          style={{
            width: 14,
            height: 300,
            borderRadius: 6,
            background:
              "linear-gradient(180deg, #1d8968 0%, #cccaca 50%, #dd6852 100%)",
            border: "1px solid #e0e0e0",
          }}
        />
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", textAlign: "center" }}
        >
          LESS COMPLEX
        </Typography>
      </div>
    </div>
  );

  // Keep the table search input in sync with external selections (map/top dropdown)
  useEffect(() => {
    const label =
      countryOptions.find((o) => o.iso3 === selectedIso3)?.label || "";
    setInputValue(label);
  }, [selectedIso3, countryOptions]);

  return (
    <>
      <GreenplexityHeader position="fixed" heightPx={60} maxWidth="lg" />
      <Container maxWidth="lg" sx={{ mt: 10 }}>
        <PageWrapper>
          <Header>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Green Complexity Ranking
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Green manufacturing index {year}
            </Typography>
          </Header>

          <TabsCard>
            <Tabs
              value={tab}
              onChange={(_e, v) => setTab(v)}
              aria-label="Ranking visualization tabs"
            >
              <Tab label="Map" value="map" />
              <Tab label="Over Time" value="bump" />
            </Tabs>
          </TabsCard>

          {tab === "map" ? (
            <MapCard>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Controls row above the map */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <Autocomplete
                      sx={{ width: 300 }}
                      options={countryOptions}
                      value={
                        countryOptions.find((o) => o.iso3 === selectedIso3) ||
                        null
                      }
                      onChange={(_e, option) => {
                        const iso = option?.iso3 || "";
                        scrollToIso(iso);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          placeholder="Search for a country"
                        />
                      )}
                      getOptionLabel={(o) => o.label}
                      isOptionEqualToValue={(o, v) => o.iso3 === v.iso3}
                    />

                    <Select
                      size="small"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      sx={{ minWidth: 100 }}
                    >
                      {availableYears.map((y) => (
                        <MenuItem key={y} value={y}>
                          {y}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>

                  <HorizontalColorScaleLegend
                    minLabel={minValue.toFixed(2)}
                    maxLabel={maxValue.toFixed(2)}
                    minColor="#e0e0e0"
                    maxColor="#1d8968"
                    title={"Green Complexity Index"}
                    rootStyles={{ maxWidth: 420 }}
                  />
                </Box>
                <div
                  ref={mapContainerRef}
                  style={{ width: "100%", position: "relative" }}
                >
                  <svg
                    width="100%"
                    height={mapHeight}
                    viewBox={`0 0 ${mapWidth} ${mapHeight}`}
                    role="img"
                    aria-label="World map colored by ECI"
                  >
                    <g>
                      {mapPaths.map((p) => (
                        <path
                          key={p.iso3}
                          d={p.d}
                          fill={
                            Number.isFinite(p.value)
                              ? colorScale(p.value)
                              : "#eee"
                          }
                          stroke={selectedIso3 === p.iso3 ? "#000" : "#fff"}
                          strokeWidth={selectedIso3 === p.iso3 ? 2 : 0.7}
                          onClick={() => scrollToIso(p.iso3)}
                          onMouseMove={(e) => {
                            const container = mapContainerRef.current;
                            const rect = container?.getBoundingClientRect();
                            const x = rect ? e.clientX - rect.left + 10 : 0;
                            const y = rect ? e.clientY - rect.top + 10 : 0;
                            setTooltip({
                              show: true,
                              x,
                              y,
                              name: p.name,
                              rank: p.rank,
                              greenEci: p.greenEci,
                            });
                          }}
                          onMouseLeave={() =>
                            setTooltip((t) => ({ ...t, show: false }))
                          }
                          tabIndex={0}
                          role="button"
                          aria-label={`Select ${p.name}`}
                          style={{ cursor: "pointer" }}
                        />
                      ))}
                    </g>
                  </svg>
                  {tooltip.show && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        transform: `translate(${tooltip.x}px, ${tooltip.y}px)`,
                        pointerEvents: "none",
                        background: "rgba(255,255,255,0.95)",
                        border: "1px solid #ddd",
                        borderRadius: 4,
                        padding: "6px 8px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                        fontSize: 12,
                        color: "#333",
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{tooltip.name}</div>
                      <div>
                        Rank: {tooltip.rank !== null ? tooltip.rank : "N/A"}
                      </div>
                      <div>
                        Ranking metric:{" "}
                        {tooltip.greenEci !== null
                          ? tooltip.greenEci.toFixed(2)
                          : "N/A"}
                      </div>
                    </div>
                  )}
                </div>
                {/* Legend moved above with controls */}
              </Box>
            </MapCard>
          ) : (
            <MapCard>
              <GreenEciBumpChart />
            </MapCard>
          )}

          <TableCard>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
                marginBottom: 1,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Rankings table
              </Typography>
              <Controls>
                <Autocomplete
                  sx={{ width: 300 }}
                  options={countryOptions}
                  value={
                    countryOptions.find((o) => o.iso3 === selectedIso3) || null
                  }
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
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="Search for a country"
                    />
                  )}
                  getOptionLabel={(o) => o.label}
                  isOptionEqualToValue={(o, v) => o.iso3 === v.iso3}
                />
              </Controls>
            </Box>
            <Box sx={{ display: "flex", alignItems: "stretch", gap: 1, pb: 4 }}>
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
                      <th style={{ width: 10 }} />
                      <th>Rank</th>
                      <th>Country</th>
                      <th style={{ textAlign: "right" }}>Ranking metric</th>
                      <th style={{ textAlign: "center" }}>Change (5y)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(ranked as RankedRow[]).map((row: RankedRow) => {
                      const swatchColor = rankColor(row.rank);
                      const prevRank = prevRankByIso3.get(row.iso3);
                      const delta =
                        typeof prevRank === "number"
                          ? prevRank - row.rank
                          : null;
                      const deltaColor =
                        delta === null
                          ? "#9e9e9e"
                          : delta > 0
                            ? "#1d8968"
                            : delta < 0
                              ? "#dd6852"
                              : "#9e9e9e";
                      const deltaSymbol =
                        delta === null
                          ? "?"
                          : delta > 0
                            ? "▲"
                            : delta < 0
                              ? "▼"
                              : "=";
                      const deltaText =
                        delta === null ? "N/A" : Math.abs(delta).toString();
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
                          <td>{row.rank}</td>
                          <td>{row.name}</td>
                          <td style={{ textAlign: "right" }}>
                            {row.rankingMetric.toFixed(2)}
                          </td>
                          <td
                            style={{ textAlign: "center", color: deltaColor }}
                          >
                            {deltaSymbol} {deltaText}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </TableEl>
              </div>
            </Box>
          </TableCard>
        </PageWrapper>
      </Container>
    </>
  );
};

export default RankingsPage;
