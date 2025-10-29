/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo } from "react";
import { useQuery, useApolloClient, gql } from "@apollo/client";
import styled from "styled-components";
import orderBy from "lodash/orderBy";
import { ParentSize } from "@visx/responsive";
import { RANKING_COLORS, createDiscreteColorScale } from "../utils/colors";
import { Box } from "@mui/material";

// GraphQL queries
const GET_COUNTRIES = gql`
  query GetCountries {
    gpLocationCountryList {
      countryId
      nameEn
      nameShortEn
      iso3Code
    }
  }
`;

// Constants
const CHART_HEIGHT = 670;
const MIN_YEAR = 2012;
const LATEST_YEAR = 2023;

const AXIS_MARGIN = {
  top: 30,
  right: 130,
  bottom: 30,
  left: 120,
};

// Use shared color scale from utils/colors.ts
const COLORS = RANKING_COLORS;

const STROKE_COLOR = "rgb(76, 76, 76)";
const GRID_COLOR = "rgba(76, 76, 76, 0.3)";
const FONT_FAMILY = '"Source Sans Pro", "Arial", sans-serif';

// Styled components
const ChartSvg = styled.svg`
  font-family: ${FONT_FAMILY};
`;

const CountriesGroup = styled.g`
  &:hover {
    g:not(.hovered):not(.spotlighted) {
      g {
        opacity: 0.3;

        rect {
          stroke-width: 0;
        }
      }
    }

    .svg-grid-line,
    .highlighted:not(.spotlighted),
    .chart-overlay-text {
      display: none;
    }
  }

  &.spotlight-on:not(:hover) {
    g:not(.hovered):not(.spotlighted) {
      g {
        opacity: 0.45;

        rect {
          stroke-width: 0;
        }
      }
    }

    .svg-grid-line,
    .chart-overlay-text {
      display: none;
    }
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
  year: number;
  rankingMetric: number | null;
  rank: number | null;
}

interface CountryYearData {
  country: CountryData;
  years: YearlyData[];
}

// Using shared color scale function from utils/colors.ts

// Simple map of background colors to text colors for contrast
const BACKGROUND_TO_TEXT_COLOR: Record<string, string> = {
  "#1d8968": "#FFFFFF", // dark green -> white
  "#7db89a": STROKE_COLOR, // light green -> dark
  "#F9E9C4": STROKE_COLOR, // cream -> dark
  "#F0A486": STROKE_COLOR, // light orange -> dark
};

// Country name formatting
const getCountryName = (country: CountryData) => {
  return country.nameShortEn || country.nameEn;
};

// Datapoint component
interface DatapointProps {
  country: CountryData;
  years: YearlyData[];
  xMultiplier: number;
  yMultiplier: number;
  topBuffer: number;
  leftBuffer: number;
  minYear: number;
  minRankingMetric: number;
  getColor: (value: number) => string;
  highlighted: boolean;
  spotlighted: boolean;
  spotlightOn: boolean;
}

const Datapoint = (props: DatapointProps) => {
  const {
    country,
    years,
    xMultiplier,
    yMultiplier,
    minYear,
    minRankingMetric,
    getColor,
    topBuffer,
    leftBuffer,
    highlighted,
    spotlighted,
    spotlightOn,
  } = props;

  const [hovered, setHovered] = useState<boolean>(false);
  const name = getCountryName(country);

  const yearPoints = years.map((yearData, i) => {
    const { year, rank, rankingMetric } = yearData;
    if (!rank || !year || year < minYear) {
      return null;
    }

    const y = yMultiplier * (rank - 1) + topBuffer;
    const x = xMultiplier * (year - minYear) + leftBuffer;
    const textY = yMultiplier * rank + yMultiplier + topBuffer;
    const metricValue =
      rankingMetric !== null ? rankingMetric : minRankingMetric;
    const fill = getColor(metricValue);
    const stroke = hovered || highlighted || spotlighted ? STROKE_COLOR : fill;
    let strokeWidth: string;
    if (spotlightOn && !spotlighted && !hovered) {
      strokeWidth = "0";
    } else {
      strokeWidth = hovered || highlighted || spotlighted ? "1" : "1.25";
    }
    const textX = x + xMultiplier / 2;
    const metricYPos = xMultiplier > 42 ? textY + 6 : textY + 5;
    const metricText =
      xMultiplier > 42 ? (
        <>{metricValue.toFixed(2)}</>
      ) : (
        <>
          <tspan x={textX} dx={0} dy={10}>
            {metricValue.toFixed(2)}
          </tspan>
        </>
      );

    // Get text color - use background-specific color for proper contrast
    // Only use black when hovered or spotlighted (explicitly selected),
    // because then the background becomes semi-transparent
    const textColor =
      hovered || spotlighted
        ? STROKE_COLOR
        : BACKGROUND_TO_TEXT_COLOR[fill] || STROKE_COLOR;

    const metricElm =
      highlighted && !spotlighted ? null : (
        <text
          x={textX}
          y={metricYPos}
          textAnchor="middle"
          style={{
            fill: textColor,
            fontSize: 10,
            pointerEvents: "none",
            fontFamily: FONT_FAMILY,
          }}
        >
          {metricText}
        </text>
      );

    const text =
      hovered || highlighted || spotlighted ? (
        <>
          <text
            x={textX}
            y={y - 4}
            textAnchor="middle"
            style={{
              fill: textColor,
              fontSize: 12,
              pointerEvents: "none",
              fontFamily: FONT_FAMILY,
            }}
          >
            {rank}
          </text>
          {metricElm}
        </>
      ) : null;

    let connectionLine: React.ReactElement | null = null;
    if ((hovered || highlighted || spotlighted) && i !== years.length - 1) {
      const nextYear = years[i + 1];
      const nextRank = nextYear.rank;
      if (!nextRank || !nextYear.year || nextYear.year < minYear) {
        connectionLine = null;
      } else {
        const x1 = x;
        const y1 = y;
        const y2 = yMultiplier * (nextRank - 1) + topBuffer;
        const x2 =
          xMultiplier * (nextYear.year - minYear) + xMultiplier + leftBuffer;
        connectionLine = (
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={STROKE_COLOR}
            strokeWidth="1"
          />
        );
      }
    }

    const highlightSizeAdjust = yMultiplier * 0.1;
    const yPos = hovered || highlighted ? y - highlightSizeAdjust : y;
    const height =
      hovered || highlighted
        ? yMultiplier + highlightSizeAdjust * 2
        : yMultiplier;

    const handleMouseEnter = () => setHovered(true);
    const handleMouseLeave = () => setHovered(false);

    return (
      <g
        key={`${country.countryId}-${year}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {connectionLine}
        <rect
          x={x}
          y={yPos}
          width={xMultiplier}
          height={height}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          style={{ cursor: "pointer" }}
        />
        {text}
      </g>
    );
  });

  let label: React.ReactElement | null = null;
  if (hovered || highlighted || spotlighted) {
    // years are sorted descending, so years[0] is the most recent year
    const latestData = years[0];
    const { rank } = latestData;
    if (rank) {
      const y = yMultiplier * (rank - 1) + topBuffer + 8;
      // Position label at the far right of the chart (after LATEST_YEAR)
      const x =
        xMultiplier * (LATEST_YEAR - minYear) + xMultiplier + leftBuffer + 4;
      let fontSize = hovered ? 16 : 13;
      const nameParts = name.split(" ");
      const tspans = nameParts.map((part, i) => {
        const text = i === 0 ? rank + ". " + part : part;
        if (!hovered) {
          if (part.length > 13) {
            fontSize = 10;
          } else if (part.length > 11) {
            fontSize = 11;
          } else if (part.length > 9 && rank > 100) {
            fontSize = 12;
          }
        } else {
          // Hovered state - larger font with adjustments for very long names
          if (part.length > 13) {
            fontSize = 14;
          } else if (part.length > 11) {
            fontSize = 15;
          }
        }
        let dx: number;
        if (i !== 0) {
          if (rank < 10) {
            dx = hovered ? 16 : 12;
          } else if (rank < 100) {
            dx = hovered ? 22 : 18;
          } else {
            dx = hovered ? 30 : 26;
          }
        } else {
          dx = 0;
        }
        return (
          <tspan
            x={x}
            dx={dx}
            dy={i !== 0 ? (hovered ? 18 : 15) : 0}
            key={text}
          >
            {text}
          </tspan>
        );
      });
      label = (
        <text
          x={x}
          y={y}
          style={{
            fill: STROKE_COLOR,
            fontSize,
            fontWeight: hovered ? "bold" : "normal",
            pointerEvents: "none",
            fontFamily: FONT_FAMILY,
          }}
        >
          {tspans}
        </text>
      );
    }
  }

  const hoveredClassName = hovered ? "hovered" : "";
  const highlightedClassName = highlighted ? " highlighted" : "";
  const spotlightedClassName = spotlightOn && spotlighted ? " spotlighted" : "";

  return (
    <g
      className={hoveredClassName + highlightedClassName + spotlightedClassName}
      style={{
        opacity: spotlightOn && !spotlighted && !hovered ? 0.3 : 1,
      }}
    >
      {yearPoints}
      {label}
    </g>
  );
};

// Axis component
interface AxisProps {
  numberOfCountries: number;
  numberOfYears: number;
  countrySpacing: number;
  yearSpacing: number;
  minYear: number;
  width: number;
  height: number;
  margins: typeof AXIS_MARGIN;
}

const Axis = (props: AxisProps) => {
  const {
    numberOfCountries,
    countrySpacing,
    margins,
    numberOfYears,
    yearSpacing,
    minYear,
    height,
    width,
  } = props;

  const yAxisLines: Array<React.ReactElement> = [];
  const yAxisInterval = 10;
  const yAxisX1 = margins.left * 0.75;
  const yAxisX2 = margins.left;
  let yAxisLineCount = 0;
  while (yAxisLineCount < numberOfCountries) {
    const y =
      yAxisLineCount === 0
        ? margins.top
        : margins.top + (yAxisLineCount - 1) * countrySpacing;
    const value = yAxisLineCount === 0 ? 1 : yAxisLineCount;
    const endPoint = yAxisLineCount === 0 ? width - margins.right : yAxisX2;
    yAxisLines.push(
      <g key={`y-axis-${value}`}>
        <text
          x={yAxisX1 - 7}
          y={y + 3}
          textAnchor="end"
          style={{
            fill: STROKE_COLOR,
            fontSize: 13,
            fontFamily: FONT_FAMILY,
          }}
        >
          {value}
        </text>
        <line
          x1={yAxisX1}
          y1={y}
          x2={endPoint}
          y2={y}
          stroke={GRID_COLOR}
          strokeWidth="1"
          strokeDasharray="5 3"
        />
      </g>,
    );
    yAxisLineCount += yAxisInterval;
  }

  const xAxisLines: Array<React.ReactElement> = [];
  const xAxisInterval = 1;
  const xAxisY1 = 0;
  const xAxisY2 = margins.top;
  const xAxisY3 = height - margins.bottom;
  const xAxisY4 = height;
  let xAxisLineCount = 0;
  while (xAxisLineCount < numberOfYears) {
    let value: number | string = minYear + xAxisLineCount;
    const buttomBuffer = value < 2006 ? countrySpacing : 0;
    let fontSize: number = 13;
    if (yearSpacing < 25) {
      fontSize = 10;
      value = value.toString().replace("20", "'");
    } else if (yearSpacing < 30) {
      fontSize = 11;
    } else if (yearSpacing < 35) {
      fontSize = 12;
    }
    const x = margins.left + xAxisLineCount * yearSpacing;
    const finalLine =
      xAxisLineCount === numberOfYears - 1 ? (
        <>
          <line
            x1={x + yearSpacing}
            y1={xAxisY1}
            x2={x + yearSpacing}
            y2={xAxisY3}
            stroke={GRID_COLOR}
            strokeWidth="1"
            strokeDasharray="5 3"
          />
          <line
            x1={x + yearSpacing}
            y1={xAxisY3}
            x2={x + yearSpacing}
            y2={xAxisY4}
            stroke={GRID_COLOR}
            strokeWidth="1"
            strokeDasharray="5 3"
          />
        </>
      ) : null;
    xAxisLines.push(
      <g key={`x-axis-${value}`}>
        <text
          x={x + yearSpacing / 2}
          y={xAxisY2 * 0.3}
          textAnchor="middle"
          style={{
            fill: STROKE_COLOR,
            fontSize,
            fontFamily: FONT_FAMILY,
          }}
        >
          {value}
        </text>
        <line
          x1={x}
          y1={xAxisY1}
          x2={x}
          y2={xAxisY2}
          stroke={GRID_COLOR}
          strokeWidth="1"
          strokeDasharray="5 3"
        />
        <line
          x1={x}
          y1={xAxisY2}
          x2={x}
          y2={xAxisY3 - buttomBuffer}
          stroke={GRID_COLOR}
          strokeWidth="1"
          strokeDasharray="5 3"
          className="svg-grid-line"
        />
        <line
          x1={x}
          y1={xAxisY3 - buttomBuffer}
          x2={x}
          y2={xAxisY4}
          stroke={GRID_COLOR}
          strokeWidth="1"
          strokeDasharray="5 3"
        />
        <text
          x={x + yearSpacing / 2}
          y={xAxisY4}
          textAnchor="middle"
          style={{
            fill: STROKE_COLOR,
            fontSize,
            fontFamily: FONT_FAMILY,
          }}
        >
          {value}
        </text>
        {finalLine}
      </g>,
    );
    xAxisLineCount += xAxisInterval;
  }

  return (
    <g style={{ pointerEvents: "none" }}>
      {yAxisLines}
      {xAxisLines}
      <ColorLegend height={height} margins={margins} />
    </g>
  );
};

// Color Legend component
interface ColorLegendProps {
  height: number;
  margins: typeof AXIS_MARGIN;
}

const ColorLegend = (props: ColorLegendProps) => {
  const { height, margins } = props;

  const yAxisX1 = margins.left * 0.75;
  const colorMargin = 40;
  const colorTotalSize =
    height - margins.top - margins.bottom - colorMargin * 2;
  const colorInitialTop = colorMargin + margins.top;
  const colorElmHeight = colorTotalSize / COLORS.length;
  const colorWidth = 10;
  const colorToAxisMargin = 30;
  const colorLeft = yAxisX1 - colorWidth - colorToAxisMargin;

  const reversedColors = [...COLORS].reverse();
  const colors = reversedColors.map((color) => (
    <rect
      x={colorLeft}
      y={colorInitialTop + colorElmHeight * reversedColors.indexOf(color)}
      width={colorWidth}
      height={colorElmHeight}
      fill={color}
      key={`color-legend-${color}`}
    />
  ));

  const arrowToColorMargin = 12;
  const arrowLeft = colorLeft - arrowToColorMargin;
  const arrowInitialTop = colorInitialTop;
  const arrowSpacing = colorTotalSize / 8;

  const arrowUpTop = arrowInitialTop + arrowSpacing;
  const arrowUpBottom = arrowInitialTop + arrowSpacing * 3;

  const arrowDownTop = arrowUpBottom + arrowSpacing * 4;
  const arrowDownBottom = arrowInitialTop + arrowSpacing * 5;

  const textLeft = arrowLeft;
  const textUpTranslate = "translate(-306, -254)";
  const textDownTranslate = "translate(-440, -521)";

  return (
    <>
      {colors}
      <line
        x1={arrowLeft}
        y1={arrowUpBottom}
        x2={arrowLeft}
        y2={arrowUpTop}
        stroke={STROKE_COLOR}
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
      />
      <text
        x={textLeft}
        y={arrowUpBottom}
        textAnchor="start"
        transform={`rotate(-90 0 0) ${textUpTranslate}`}
        style={{
          fill: STROKE_COLOR,
          fontSize: 16,
          textTransform: "uppercase",
          fontFamily: FONT_FAMILY,
        }}
      >
        <tspan x={textLeft} dx={0} dy={0}>
          High Greenplexity
        </tspan>
        <tspan x={textLeft} dx={0} dy={17}>
          Higher Ranking
        </tspan>
      </text>
      <line
        x1={arrowLeft}
        y1={arrowDownBottom}
        x2={arrowLeft}
        y2={arrowDownTop}
        stroke={STROKE_COLOR}
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
      />
      <text
        x={textLeft}
        y={arrowDownTop}
        textAnchor="end"
        transform={`rotate(-90 0 0) ${textDownTranslate}`}
        style={{
          fill: STROKE_COLOR,
          fontSize: 16,
          textTransform: "uppercase",
          fontFamily: FONT_FAMILY,
        }}
      >
        <tspan x={textLeft} dx={0} dy={0}>
          Low Greenplexity
        </tspan>
        <tspan x={textLeft} dx={0} dy={17}>
          Lower Ranking
        </tspan>
      </text>
    </>
  );
};

// Preselected countries that show when no country is selected
const PRESELECTED_COUNTRIES = ["CHN", "IND", "IDN", "MAR", "BOL"]; // China, India, Indonesia, Morocco, Bolivia

// Main component props
interface GreenEciBumpChartProps {
  selectedIso3?: string;
  setSelectedIso3?: (iso3: string) => void;
  countryOptions?: Array<{ label: string; iso3: string }>;
}

const GreenEciBumpChart: React.FC<GreenEciBumpChartProps> = ({
  selectedIso3 = "",
}) => {
  // const [selectedCountries] = useState<number[]>([]); // Reserved for future filtering
  const [countriesData, setCountriesData] = useState<CountryYearData[]>([]);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  const client = useApolloClient();

  // Fetch countries
  const { data: countriesListData, loading: countriesLoading } =
    useQuery(GET_COUNTRIES);

  const allCountryIds = useMemo(() => {
    if (!countriesListData?.gpLocationCountryList) return [];
    return (countriesListData.gpLocationCountryList as CountryData[]).map(
      (country) => country.countryId,
    );
  }, [countriesListData]);

  // Load data for all countries
  useEffect(() => {
    const loadData = async () => {
      if (allCountryIds.length === 0) return;

      const countryMap = new Map<number, CountryData>();
      if (countriesListData?.gpLocationCountryList) {
        (countriesListData.gpLocationCountryList as CountryData[]).forEach(
          (country) => {
            countryMap.set(country.countryId, country);
          },
        );
      }

      // Build data structure: Map<countryId, YearlyData[]>
      const dataByCountry = new Map<number, YearlyData[]>();

      try {
        // OPTIMIZED: Fetch all years at once (year is now optional)
        const allYearsQuery = gql`
          query GetAllYearsData {
            gpCountryYearList {
              countryId
              year
              rankingMetric
              rank
            }
          }
        `;

        const result = await client.query({
          query: allYearsQuery,
        });

        interface CountryYearResult {
          countryId: number;
          year: number;
          rankingMetric: string | null;
          rank: number | null;
        }

        const yearDataResults = result.data.gpCountryYearList as CountryYearResult[];

        // Filter to only include years in our range and group by country
        yearDataResults.forEach((d) => {
          if (d.year < MIN_YEAR || d.year > LATEST_YEAR) return;

          if (!dataByCountry.has(d.countryId)) {
            dataByCountry.set(d.countryId, []);
          }
          const countryArray = dataByCountry.get(d.countryId);
          if (countryArray) {
            countryArray.push({
              year: d.year,
              rankingMetric: d.rankingMetric
                ? parseFloat(d.rankingMetric)
                : null,
              rank: d.rank,
            });
          }
        });

        // Convert to final data structure
        const allCountriesData: CountryYearData[] = [];
        dataByCountry.forEach((years, countryId) => {
          const country = countryMap.get(countryId);
          if (!country) return;

          // Sort by year descending (most recent first, like in overtimeViz)
          const sortedYears = orderBy(years, ["year"], ["desc"]);

          allCountriesData.push({
            country,
            years: sortedYears,
          });
        });

        setCountriesData(allCountriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    loadData();
  }, [allCountryIds, countriesListData, client]);

  // Compute min/max rankingMetric from data
  const { minRankingMetric, maxRankingMetric } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    countriesData.forEach(({ years }) => {
      years.forEach(({ rankingMetric }) => {
        if (rankingMetric !== null) {
          if (rankingMetric < min) min = rankingMetric;
          if (rankingMetric > max) max = rankingMetric;
        }
      });
    });

    // Fallback if no data
    if (min === Infinity || max === -Infinity) {
      return { minRankingMetric: 0, maxRankingMetric: 1 };
    }

    return { minRankingMetric: min, maxRankingMetric: max };
  }, [countriesData]);

  const getColor = useMemo(
    () => createDiscreteColorScale(minRankingMetric, maxRankingMetric),
    [minRankingMetric, maxRankingMetric],
  );

  const totalYearsInclusive = LATEST_YEAR - MIN_YEAR + 1;

  // Filter and sort countries by their most recent rank (rank 1 at top)
  const filteredCountries = useMemo(() => {
    return countriesData
      .filter(({ years }) => {
        // Only include countries that have data and a valid rank in the most recent year
        if (years.length === 0) return false;
        const mostRecentYear = years[0]; // years are sorted descending
        return mostRecentYear && mostRecentYear.rank !== null;
      })
      .sort((a, b) => {
        // Get the most recent year's rank for each country (guaranteed to exist after filter)
        const aRank = a.years[0]?.rank || Infinity;
        const bRank = b.years[0]?.rank || Infinity;
        return aRank - bRank; // Sort ascending (rank 1 first)
      });
  }, [countriesData]);

  // Country options for autocomplete - build internal mapping
  const internalCountryOptions = useMemo(() => {
    return filteredCountries.map((cd) => ({
      label: getCountryName(cd.country),
      countryId: cd.country.countryId,
      iso3: cd.country.iso3Code,
    }));
  }, [filteredCountries]);

  // Derive highlightedCountries from selectedIso3 and preselected countries
  // Show preselected countries only when NOT hovering and NO country is selected
  const highlightedCountries = useMemo(() => {
    let iso3List: string[] = [];

    if (selectedIso3) {
      // If a country is selected, show only that country
      iso3List = [selectedIso3];
    } else if (!isHovering) {
      // If not hovering and no selection, show preselected countries
      iso3List = PRESELECTED_COUNTRIES;
    }
    // If hovering and no selection, show nothing (empty array)

    if (iso3List.length === 0) return [];

    return internalCountryOptions
      .filter((c) => iso3List.includes(c.iso3))
      .map((c) => c.countryId);
  }, [selectedIso3, isHovering, internalCountryOptions]);

  // Only apply spotlight opacity effect when hovering or when a country is explicitly selected
  // (not for preselected countries in default state)
  const spotlightOn =
    (isHovering && highlightedCountries.length > 0) || !!selectedIso3;

  // Render function that receives dimensions from ParentSize
  const renderChart = (width: number, height: number) => {
    if (!width || !height || filteredCountries.length === 0) {
      return null;
    }

    const yMultiplier =
      (height - AXIS_MARGIN.top - AXIS_MARGIN.bottom) /
      filteredCountries.length;
    const xMultiplier =
      (width - AXIS_MARGIN.left - AXIS_MARGIN.right) / totalYearsInclusive;

    // Sort countries so highlighted ones are rendered last (on top)
    const sortedCountries = [...filteredCountries].sort((a, b) => {
      const aIsHighlighted = highlightedCountries.includes(a.country.countryId);
      const bIsHighlighted = highlightedCountries.includes(b.country.countryId);

      if (aIsHighlighted && !bIsHighlighted) return 1; // a comes after b (rendered on top)
      if (!aIsHighlighted && bIsHighlighted) return -1; // b comes after a (rendered on top)
      return 0; // maintain original order
    });

    const countries = sortedCountries.map((countryData) => (
      <Datapoint
        key={countryData.country.countryId}
        country={countryData.country}
        years={countryData.years}
        xMultiplier={xMultiplier}
        yMultiplier={yMultiplier}
        getColor={getColor}
        minRankingMetric={minRankingMetric}
        minYear={MIN_YEAR}
        topBuffer={AXIS_MARGIN.top}
        leftBuffer={AXIS_MARGIN.left}
        highlighted={highlightedCountries.includes(
          countryData.country.countryId,
        )}
        spotlighted={
          spotlightOn &&
          highlightedCountries.includes(countryData.country.countryId)
        }
        spotlightOn={spotlightOn}
      />
    ));

    return (
      <ChartSvg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ backgroundColor: "#fff" }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="4"
            markerHeight="4"
            orient="auto"
            refY="2"
          >
            <path d="M0,0 L4,2 0,4" fill={STROKE_COLOR} stroke="none" />
          </marker>
        </defs>
        <CountriesGroup
          className={spotlightOn ? "spotlight-on" : undefined}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {countries}
          <Axis
            numberOfCountries={filteredCountries.length}
            numberOfYears={totalYearsInclusive}
            width={width}
            height={height}
            margins={AXIS_MARGIN}
            countrySpacing={yMultiplier}
            yearSpacing={xMultiplier}
            minYear={MIN_YEAR}
          />
        </CountriesGroup>
      </ChartSvg>
    );
  };

  if (countriesLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        Loading countries...
      </div>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ width: "100%", height: CHART_HEIGHT }}>
        <ParentSize>
          {({ width, height }) => renderChart(width, height)}
        </ParentSize>
      </div>
    </Box>
  );
};

export default GreenEciBumpChart;
