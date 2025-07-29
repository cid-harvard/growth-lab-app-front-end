import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useApolloClient, gql } from "@apollo/client";
import styled from "styled-components";
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
const CHART_HEIGHT = 1500;

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
  min-height: ${CHART_HEIGHT}px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const BumpChartSvg = styled.svg`
  width: 100%;
  height: ${CHART_HEIGHT}px;
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
  pointer-events: none;
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

const ControlsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
`;

const CountryFilter = styled.input`
  padding: 8px 12px;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 14px;
  width: 200px;
`;

const CountrySelectionContainer = styled.div`
  margin-bottom: 20px;
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 10px;
`;

const CountryCheckbox = styled.label`
  display: block;
  margin: 4px 0;
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
`;

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
  const [filter, setFilter] = useState("");
  const [highlightedCountry, setHighlightedCountry] = useState<number | null>(
    null,
  );
  const [bumpChartData, setBumpChartData] = useState<BumpChartData>({});

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

  // Filtered countries for selection
  const filteredCountries = useMemo(() => {
    if (!countriesData?.ggLocationCountryList) return [];

    return countriesData.ggLocationCountryList.filter(
      (country: CountryData) =>
        country.nameEn.toLowerCase().includes(filter.toLowerCase()) ||
        country.iso3Code.toLowerCase().includes(filter.toLowerCase()),
    );
  }, [countriesData, filter]);

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
          if (countryData && countryData[0]) {
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
  const margin = { top: 50, right: 150, bottom: 50, left: 60 };
  const width = 800;
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = CHART_HEIGHT - margin.top - margin.bottom;

  // Scales
  const xScale = (year: number) =>
    ((year - ALL_YEARS[ALL_YEARS.length - 1]) /
      (ALL_YEARS[0] - ALL_YEARS[ALL_YEARS.length - 1])) *
    chartWidth;

  const yScale = (rank: number) =>
    ((rank - 1) / Math.max(selectedCountries.length - 1, 1)) * chartHeight;

  // Generate SVG path for each country
  const generatePath = (yearlyData: YearlyData[]) => {
    const points = yearlyData
      .sort((a, b) => a.year - b.year)
      .map((d) => `${xScale(d.year)},${yScale(d.rank)}`)
      .join(" L ");

    return `M ${points}`;
  };

  const toggleCountry = (countryId: number) => {
    setSelectedCountries((prev) => {
      if (prev.includes(countryId)) {
        return prev.filter((id) => id !== countryId);
      } else {
        return [...prev, countryId];
      }
    });
  };

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
        <Title>
          Economic Complexity Index - controlled for GDP per capita and natural
          resource exports
        </Title>

        <ControlsContainer>
          <CountryFilter
            placeholder="Filter countries..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </ControlsContainer>

        {/* Country selection */}
        <CountrySelectionContainer>
          {filteredCountries.slice(0, 20).map((country: CountryData) => (
            <CountryCheckbox key={country.countryId}>
              <input
                type="checkbox"
                checked={selectedCountries.includes(country.countryId)}
                onChange={() => toggleCountry(country.countryId)}
                style={{ marginRight: "8px" }}
              />
              {country.nameEn} ({country.iso3Code})
            </CountryCheckbox>
          ))}
        </CountrySelectionContainer>

        <ChartContainer>
          <BumpChartSvg>
            <g transform={`translate(${margin.left},${margin.top})`}>
              {/* Year labels */}
              {ALL_YEARS.map((year: number) => (
                <YearLabel key={year} x={xScale(year)} y={chartHeight + 30}>
                  {year}
                </YearLabel>
              ))}

              {/* Rank labels */}
              {Array.from({ length: selectedCountries.length }, (_, i) => (
                <RankLabel key={i} x={-10} y={yScale(i + 1) + 5}>
                  {i + 1}
                </RankLabel>
              ))}

              {/* Country lines and dots */}
              {Object.entries(bumpChartData).map(([countryId, data], index) => {
                const color = colors[index % colors.length];
                const isHighlighted =
                  highlightedCountry === parseInt(countryId);

                return (
                  <g key={countryId}>
                    {/* Line */}
                    <CountryLine
                      d={generatePath(data.years)}
                      color={color}
                      isHighlighted={isHighlighted}
                      onMouseEnter={() =>
                        setHighlightedCountry(parseInt(countryId))
                      }
                      onMouseLeave={() => setHighlightedCountry(null)}
                    />

                    {/* Dots */}
                    {data.years.map((yearData: YearlyData) => (
                      <CountryDot
                        key={`${countryId}-${yearData.year}`}
                        cx={xScale(yearData.year)}
                        cy={yScale(yearData.rank)}
                        color={color}
                        isHighlighted={isHighlighted}
                        onMouseEnter={() =>
                          setHighlightedCountry(parseInt(countryId))
                        }
                        onMouseLeave={() => setHighlightedCountry(null)}
                      />
                    ))}

                    {/* Country label at the end */}
                    {data.years.length > 0 && (
                      <CountryLabel
                        x={xScale(ALL_YEARS[0]) + 10}
                        y={
                          yScale(data.years[data.years.length - 1]?.rank || 1) +
                          5
                        }
                        isHighlighted={isHighlighted}
                      >
                        {data.country.iso3Code}
                      </CountryLabel>
                    )}
                  </g>
                );
              })}
            </g>
          </BumpChartSvg>
        </ChartContainer>
      </PageContainer>
    </FullWidthContent>
  );
};

export default GreenEciBumpChart;
