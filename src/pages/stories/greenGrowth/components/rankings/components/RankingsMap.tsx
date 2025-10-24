import { useMemo, useRef } from "react";
import { Box, Typography } from "@mui/material";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import raw from "raw.macro";
import { ParentSize } from "@visx/responsive";
import {
  RANKING_COLORS,
  createContinuousColorScale,
} from "../../../utils/colors";
import { HorizontalColorScaleLegend } from "./HorizontalColorScaleLegend";
import type { CountryYearMetric, RankedRow, TooltipState } from "../types";
import { MapCard } from "../styles";

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
  raw("../../../../../../assets/world-geojson.json"),
);

type RankingsMapProps = {
  allCountriesMetrics: CountryYearMetric[] | null;
  globalMinValue: number;
  globalMaxValue: number;
  year: number;
  selectedIso3: string;
  tooltip: TooltipState;
  setTooltip: React.Dispatch<React.SetStateAction<TooltipState>>;
  scrollToIso: (iso3: string) => void;
  isCapturingImage: boolean;
};

export const RankingsMap = ({
  allCountriesMetrics,
  globalMinValue,
  globalMaxValue,

  selectedIso3,
  tooltip,
  setTooltip,
  scrollToIso,
  isCapturingImage,
}: RankingsMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapVisualizationRef = useRef<HTMLDivElement | null>(null);

  // Prepare metrics and world map data
  const { featureCollection, ranked } = useMemo(() => {
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
      ranked: rankedList,
    };
  }, [allCountriesMetrics]);

  // Use continuous color scale for map (not discrete like overtime viz)
  const colorScale = useMemo(() => {
    return createContinuousColorScale(globalMinValue, globalMaxValue);
  }, [globalMinValue, globalMaxValue]);

  // Build SVG path data per country - now a function that accepts dimensions
  const buildMapPaths = (mapWidth: number, mapHeight: number) => {
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
  };

  return (
    <MapCard>
      <Box
        ref={mapVisualizationRef}
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
        {/* Legend centered below controls */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 1, mt: 0 }}>
          <HorizontalColorScaleLegend
            minLabel="Low Greenplexity"
            maxLabel="High Greenplexity"
            minColor={RANKING_COLORS[0]}
            maxColor={RANKING_COLORS[RANKING_COLORS.length - 1]}
            colors={RANKING_COLORS}
            discrete={false}
            rootStyles={{ maxWidth: 520 }}
          />
        </Box>
        <div
          ref={mapContainerRef}
          style={{ width: "100%", position: "relative" }}
        >
          <ParentSize>
            {({ width }) => {
              const mapWidth = Math.max(300, Math.floor(width));
              const mapHeight = Math.max(240, Math.round(mapWidth * 0.45));
              const mapPaths = buildMapPaths(mapWidth, mapHeight);

              return (
                <>
                  <svg
                    width="100%"
                    height={mapHeight}
                    viewBox={`0 0 ${mapWidth} ${mapHeight}`}
                    role="img"
                    aria-label="World map colored by ECI"
                  >
                    <g>
                      {/* Render non-selected countries first */}
                      {mapPaths
                        .filter((p) => p.iso3 !== selectedIso3)
                        .map((p) => (
                          <path
                            key={p.iso3}
                            d={p.d}
                            fill={
                              p.greenEci !== null && Number.isFinite(p.greenEci)
                                ? colorScale(p.greenEci)
                                : "#eee"
                            }
                            stroke="#fff"
                            strokeWidth={0.7}
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
                            style={{ cursor: "pointer" }}
                          />
                        ))}
                      {/* Render selected country last so it appears on top */}
                      {mapPaths
                        .filter((p) => p.iso3 === selectedIso3)
                        .map((p) => (
                          <path
                            key={p.iso3}
                            d={p.d}
                            fill={
                              p.greenEci !== null && Number.isFinite(p.greenEci)
                                ? colorScale(p.greenEci)
                                : "#eee"
                            }
                            stroke="#000"
                            strokeWidth={2}
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
                        Greenplexity Index Value:{" "}
                        {tooltip.greenEci !== null
                          ? tooltip.greenEci.toFixed(2)
                          : "N/A"}
                      </div>
                    </div>
                  )}
                </>
              );
            }}
          </ParentSize>
        </div>
      </Box>
    </MapCard>
  );
};
