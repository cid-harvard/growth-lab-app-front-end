import { useState, useEffect, useMemo } from "react";
import { useQuery, useApolloClient, gql } from "@apollo/client";
import styled from "styled-components";
import { ParentSize } from "@visx/responsive";
import {
  FullWidthContent,
  FullWidthContentContainer,
} from "../../../../styling/Grid";

// GraphQL queries
const GET_COUNTRIES = gql`
  query GetCountries {
    ggLocationCountryList {
      countryId
      nameEn
      nameShortEn
      iso3Code
    }
  }
`;

// Chart dimensions constants
const CHART_HEIGHT = 800;
const TOP_N = 40;

// Years array - defined outside component to prevent re-creation
const ALL_YEARS = [
  2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012,
];

// Styled components
const PageContainer = styled(FullWidthContentContainer)`
  padding: 40px 20px;
  font-family: "Source Sans Pro", sans-serif;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 300;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 40px;
`;

const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 0px;
  min-height: ${CHART_HEIGHT}px; /* ensure parent is tall enough so chart isn't cut off */
  overflow: visible;
`;

const BumpChartSvg = styled.svg`
  width: 100%;
  height: ${CHART_HEIGHT}px; /* ensure explicit height; browser default is 150 */
  display: block;
  font-family: "Source Sans Pro", sans-serif;
`;

const CountryLine = styled.path<{ color: string; isHighlighted: boolean }>`
  fill: none;
  stroke: ${(props) => props.color};
  stroke-width: ${(props) => (props.isHighlighted ? 3 : 2)};
  stroke-opacity: ${(props) => (props.isHighlighted ? 1 : 0.7)};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    stroke-width: 3;
    stroke-opacity: 1;
  }
`;

const CountryLineDashed = styled(CountryLine)`
  stroke-opacity: ${(props) => (props.isHighlighted ? 0.9 : 0.4)};
  stroke-dasharray: 4 4;
`;

const CountryDot = styled.circle<{ color: string; isHighlighted: boolean }>`
  fill: ${(props) => props.color};
  stroke: white;
  stroke-width: 2;
  r: ${(props) => (props.isHighlighted ? 6 : 4)};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    r: 6;
  }
`;

const CountryLabel = styled.text<{ isHighlighted: boolean }>`
  font-size: ${(props) => (props.isHighlighted ? "14px" : "12px")};
  font-weight: ${(props) => (props.isHighlighted ? "bold" : "normal")};
  fill: #2c3e50;
  pointer-events: auto;
  transition: all 0.3s ease;
`;

const YearLabel = styled.text`
  font-size: 14px;
  font-weight: bold;
  fill: #34495e;
  text-anchor: middle;
`;

const RankLabel = styled.text`
  font-size: 12px;
  fill: #7f8c8d;
  text-anchor: end;
`;

// TooltipBox reserved for future in-chart tooltips (not currently used)

// Types
interface CountryData {
  countryId: number;
  nameEn: string;
  nameShortEn: string;
  iso3Code: string;
}

interface YearlyData {
  countryId: number;
  year: number;
  xResid: number;
  rank: number;
}

interface BumpChartData {
  [countryId: number]: {
    country: CountryData;
    years: YearlyData[];
  };
}

// Colors for countries (similar to Observable example)
const colors = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
  "#aec7e8",
  "#ffbb78",
  "#98df8a",
  "#ff9896",
  "#c5b0d5",
  "#c49c94",
  "#f7b6d3",
  "#c7c7c7",
  "#dbdb8d",
  "#9edae5",
];

const GreenEciBumpChart: React.FC = () => {
  const [selectedCountries, setSelectedCountries] = useState<number[]>([]);
  const [highlightedCountry, setHighlightedCountry] = useState<number | null>(
    null,
  );
  const [bumpChartData, setBumpChartData] = useState<BumpChartData>({});
  // Tooltip state reserved for future enhancements (currently unused)

  const client = useApolloClient();

  // Fetch countries
  const { data: countriesData, loading: countriesLoading } =
    useQuery(GET_COUNTRIES);

  // All countries by default
  const allCountryIds = useMemo(() => {
    if (!countriesData?.ggLocationCountryList) return [];
    return countriesData.ggLocationCountryList.map(
      (country: CountryData) => country.countryId,
    );
  }, [countriesData]);

  // Set all countries as selected by default
  useEffect(() => {
    if (allCountryIds.length > 0 && selectedCountries.length === 0) {
      setSelectedCountries(allCountryIds);
    }
  }, [allCountryIds, selectedCountries.length]);

  // (removed) filteredCountries: not used in current chart

  // Progressive data loading: load years from most recent backwards
  useEffect(() => {
    const loadDataForYear = async (
      year: number,
      currentData: BumpChartData,
    ): Promise<BumpChartData> => {
      if (selectedCountries.length === 0) return currentData;

      const countryMap = new Map<number, CountryData>();
      if (countriesData?.ggLocationCountryList) {
        countriesData.ggLocationCountryList.forEach((country: CountryData) => {
          countryMap.set(country.countryId, country);
        });
      }

      const updatedData = { ...currentData };

      try {
        // Create a massive GraphQL query with aliases for all countries
        const queryParts: string[] = [];
        const countryAliases: string[] = [];

        selectedCountries.forEach((countryId) => {
          const alias = `country_${countryId}`;
          countryAliases.push(alias);
          queryParts.push(`
            ${alias}: ggCountryYearList(year: $year, countryId: ${countryId}) {
              countryId
              year
              xResid
            }
          `);
        });

        const batchQuery = gql`
          query GetAllCountriesForYear($year: Int!) {
            ${queryParts.join("")}
          }
        `;

        const result = await client.query({
          query: batchQuery,
          variables: { year },
        });

        // Process results from the batched query
        const yearResults: YearlyData[] = [];

        countryAliases.forEach((alias) => {
          const countryData = result.data[alias];
          if (countryData?.[0]) {
            const data = countryData[0];
            yearResults.push({
              countryId: data.countryId,
              year: data.year,
              xResid: data.xResid,
              rank: 0, // Will be calculated later
            });
          }
        });

        // Sort by xResid to calculate rankings
        yearResults.sort((a, b) => b.xResid - a.xResid);
        yearResults.forEach((data, index) => {
          data.rank = index + 1;
        });

        // Update the data structure
        yearResults.forEach((yearData) => {
          const { countryId } = yearData;
          const country = countryMap.get(countryId);
          if (!country) return;

          if (!updatedData[countryId]) {
            updatedData[countryId] = {
              country,
              years: [],
            };
          }
          updatedData[countryId].years.push(yearData);
          // Sort years within each country
          updatedData[countryId].years.sort((a, b) => a.year - b.year);
        });
      } catch (error) {
        console.error(`Error fetching batch data for year ${year}:`, error);
      }

      return updatedData;
    };

    const loadAllData = async () => {
      if (selectedCountries.length === 0) return;

      let cumulativeData: BumpChartData = {};

      // Load years progressively from most recent to oldest
      for (let i = 0; i < ALL_YEARS.length; i++) {
        const year = ALL_YEARS[i];

        try {
          cumulativeData = await loadDataForYear(year, cumulativeData);
          setBumpChartData({ ...cumulativeData });

          // Allow UI to update between year loads
          await new Promise((resolve) => setTimeout(resolve, 50));
        } catch (error) {
          console.error(`Error loading data for year ${year}:`, error);
        }
      }
    };

    loadAllData();
  }, [selectedCountries, countriesData, client]);

  // Chart dimensions
  const margin = { top: 50, right: 300, bottom: 50, left: 60 };
  // width will be adapted later for responsiveness; keep a default now
  // Width is measured at render time via ParentSize
  const chartHeight = CHART_HEIGHT - margin.top - margin.bottom;
  const clipId = useMemo(
    () => `eci-clip-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );
  const clipPad = 6; // extend by max dot radius to avoid clipping circles on edges

  // Determine countries to draw: union of all countries that are within TOP_N in any year
  const visibleCountryIds = useMemo(() => {
    const ids = new Set<number>();
    Object.entries(bumpChartData).forEach(
      ([id, data]: [string, BumpChartData[number]]) => {
        if (data.years.some((d: YearlyData) => d.rank <= TOP_N))
          ids.add(parseInt(id, 10));
      },
    );
    if (ids.size === 0) return selectedCountries.slice(0, TOP_N);
    return Array.from(ids);
  }, [bumpChartData, selectedCountries]);

  // Build a per-year ranking position among visible countries
  // (Deprecated) previously computed positions among visible countries; no longer needed
  // const visibleRanksByYear = useMemo(() => { ... }, [visibleCountryIds, bumpChartData]);

  // (scales computed inside responsive render where width is known)

  // (moved local yOff and path generators inside responsive render)

  // (removed) toggleCountry: selection UI not present in current chart

  if (countriesLoading) {
    return (
      <FullWidthContent>
        <PageContainer>
          <div style={{ textAlign: "center", padding: "40px" }}>
            Loading countries...
          </div>
        </PageContainer>
      </FullWidthContent>
    );
  }

  return (
    <FullWidthContent>
      <PageContainer>
        <Title>Green Manufacturing Rankings</Title>
        <ChartContainer>
          <ParentSize>
            {({ width }) => {
              const w = Math.max(width, 300);
              const chartWidth = w - margin.left - margin.right;
              const xS = (year: number) =>
                ((year - ALL_YEARS[ALL_YEARS.length - 1]) /
                  (ALL_YEARS[0] - ALL_YEARS[ALL_YEARS.length - 1])) *
                chartWidth;
              const yS = (rank: number) =>
                ((Math.min(rank, TOP_N) - 1) / Math.max(TOP_N - 1, 1)) *
                chartHeight;
              const yOff = (rank: number) => {
                if (rank <= TOP_N) return yS(rank);
                const overflow = Math.max(0, rank - TOP_N);
                const extra =
                  Math.min(overflow, TOP_N) * (chartHeight / TOP_N) * 0.25;
                return yS(TOP_N) + extra;
              };
              return (
                <BumpChartSvg>
                  <g transform={`translate(${margin.left},${margin.top})`}>
                    <defs>
                      <clipPath id={clipId}>
                        <rect
                          x={-clipPad}
                          y={-clipPad}
                          width={chartWidth + 300}
                          height={chartHeight + clipPad + 3}
                        />
                      </clipPath>
                    </defs>
                    {ALL_YEARS.map((year: number) => (
                      <YearLabel key={year} x={xS(year)} y={chartHeight + 30}>
                        {year}
                      </YearLabel>
                    ))}
                    {Array.from({ length: TOP_N }, (_, i) => (
                      <RankLabel
                        key={`rank-${i + 1}`}
                        x={-10}
                        y={yS(i + 1) + 5}
                      >
                        {i + 1}
                      </RankLabel>
                    ))}
                    <g clipPath={`url(#${clipId})`}>
                      {visibleCountryIds.map((cid) => {
                        const data = bumpChartData[cid];
                        if (!data) return null;
                        const color = colors[cid % colors.length];
                        const isHighlighted = highlightedCountry === cid;
                        const pathD = (() => {
                          const sorted = [...data.years].sort(
                            (a, b) => a.year - b.year,
                          );
                          let d = "";
                          let inSeg = false;
                          for (let i = 0; i < sorted.length; i++) {
                            const y = sorted[i];
                            const within = y.rank <= TOP_N;
                            const xPos = xS(y.year);
                            const yPos = yS(y.rank);
                            if (within) {
                              if (!inSeg) {
                                d += `M ${xPos},${yPos}`;
                                inSeg = true;
                              } else {
                                d += ` L ${xPos},${yPos}`;
                              }
                            } else {
                              inSeg = false;
                            }
                          }
                          return d;
                        })();
                        return (
                          <g key={`country-${cid}`}>
                            <CountryLine
                              d={pathD}
                              color={color}
                              isHighlighted={isHighlighted}
                              onMouseEnter={() => setHighlightedCountry(cid)}
                              onMouseLeave={() => setHighlightedCountry(null)}
                            />
                            {(() => {
                              const pts = [...data.years]
                                .sort((a, b) => a.year - b.year)
                                .map((d: YearlyData) => ({
                                  year: d.year,
                                  rank: d.rank,
                                  x: xS(d.year),
                                  y: yS(d.rank),
                                  yOff: yOff(d.rank),
                                  visible: d.rank <= TOP_N,
                                }));
                              const bridges: Array<{
                                x1: number;
                                y1: number;
                                x2: number;
                                y2: number;
                              }> = [];
                              for (let i = 0; i < pts.length - 1; i++) {
                                const a = pts[i];
                                const b = pts[i + 1];
                                if (!(a.visible && b.visible)) {
                                  bridges.push({
                                    x1: a.x,
                                    y1: a.visible ? a.y : a.yOff,
                                    x2: b.x,
                                    y2: b.visible ? b.y : b.yOff,
                                  });
                                }
                              }
                              if (bridges.length === 0) return null;
                              return bridges.map((b) => (
                                <CountryLineDashed
                                  key={`bridge-${cid}-${b.x1}-${b.x2}`}
                                  d={`M ${b.x1},${b.y1} L ${b.x2},${b.y2}`}
                                  color={color}
                                  isHighlighted={isHighlighted}
                                  onMouseEnter={() =>
                                    setHighlightedCountry(cid)
                                  }
                                  onMouseLeave={() =>
                                    setHighlightedCountry(null)
                                  }
                                />
                              ));
                            })()}
                            {data.years.map((yearData: YearlyData) =>
                              yearData.rank <= TOP_N ? (
                                <CountryDot
                                  key={`${cid}-${yearData.year}`}
                                  cx={xS(yearData.year)}
                                  cy={yS(yearData.rank)}
                                  color={color}
                                  isHighlighted={isHighlighted}
                                  onMouseEnter={(e) => {
                                    setHighlightedCountry(cid);
                                    const svg =
                                      (e.currentTarget
                                        .ownerSVGElement as SVGSVGElement) ||
                                      null;
                                    const tip =
                                      document.getElementById(
                                        "eci-bump-tooltip",
                                      );
                                    if (svg && tip) {
                                      const bbox = svg.getBoundingClientRect();
                                      tip.textContent = `${data.country.nameEn} – ${yearData.year}: Rank ${yearData.rank}`;
                                      tip.style.transform = `translate(${e.clientX - bbox.left + 10}px, ${e.clientY - bbox.top + 10}px)`;
                                      tip.style.opacity = "1";
                                    }
                                  }}
                                  onMouseLeave={() => {
                                    setHighlightedCountry(null);
                                    const tip =
                                      document.getElementById(
                                        "eci-bump-tooltip",
                                      );
                                    if (tip) tip.style.opacity = "0";
                                  }}
                                />
                              ) : null,
                            )}
                            {(() => {
                              const last = [...data.years]
                                .sort((a, b) => a.year - b.year)
                                .slice(-1)[0];
                              // Only label countries that are in the final year and within TOP_N
                              if (
                                !last ||
                                last.year !== ALL_YEARS[0] ||
                                last.rank > TOP_N
                              )
                                return null;
                              return (
                                <CountryLabel
                                  x={xS(ALL_YEARS[0]) + 10}
                                  y={yS(last.rank) + 5}
                                  isHighlighted={isHighlighted}
                                  onMouseEnter={() =>
                                    setHighlightedCountry(cid)
                                  }
                                  onMouseLeave={() =>
                                    setHighlightedCountry(null)
                                  }
                                  style={{ cursor: "pointer" }}
                                >
                                  {data.country.nameEn}
                                </CountryLabel>
                              );
                            })()}
                          </g>
                        );
                      })}
                    </g>
                  </g>
                </BumpChartSvg>
              );
            }}
          </ParentSize>
        </ChartContainer>
      </PageContainer>
    </FullWidthContent>
  );
};

export default GreenEciBumpChart;
