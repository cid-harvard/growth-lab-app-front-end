import React from "react";
import type * as d3 from "d3";
import type { ClusterData } from "../loader";

interface SpaceVisualizationClustersProps {
  clusters: ClusterData;
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  showContinents: boolean;
  showCountries: boolean;
  continentsConfig: {
    strokeWidth: number;
    fillOpacity: number;
    strokeOpacity: number;
    showLabels: boolean;
  };
  countriesConfig: {
    strokeWidth: number;
    fillOpacity: number;
    strokeOpacity: number;
    showLabels?: boolean;
  };
  clusterColorMap: Map<string, string>;
}

export const SpaceVisualizationClusters: React.FC<SpaceVisualizationClustersProps> =
  React.memo(
    ({
      clusters,
      xScale,
      yScale,
      showContinents,
      showCountries,
      continentsConfig,
      countriesConfig,
      clusterColorMap,
    }) => {
      // Helper function to convert polygon coordinates to SVG path
      const polygonToPath = (polygon: Array<[number, number]>): string => {
        if (polygon.length === 0) return "";

        const pathCommands = polygon.map((point, index) => {
          const x = xScale(point[0]);
          const y = yScale(point[1]);
          return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
        });

        return pathCommands.join(" ") + " Z";
      };

      // Helper function to get cluster name from cluster ID
      const getClusterName = (continent: any): string => {
        // Map cluster IDs to the actual industry cluster names
        // These correspond to the actual cluster names in the industry space
        const clusterIdToNameMap: Record<string, string> = {
          "1": "BASIC MATERIALS CLUSTER",
          "2": "MANUFACTURING CLUSTER",
          "3": "FOOD CLUSTER",
          "4": "DURABLES CLUSTER",
          "5": "LOGISTICS CLUSTER",
          "6": "SERVICES CLUSTER",
          "7": "FINANCE CLUSTER",
        };

        return (
          clusterIdToNameMap[continent.clusterId] ||
          `Cluster ${continent.clusterId}`
        );
      };

      return (
        <g className="cluster-boundaries">
          {/* Render continent boundaries */}
          {showContinents &&
            clusters.continents.map((continent) => (
              <path
                key={`continent-${continent.clusterId}`}
                d={polygonToPath(continent.polygon)}
                fill={continent.color}
                fillOpacity={continentsConfig.fillOpacity}
                stroke={continent.color}
                strokeWidth={continentsConfig.strokeWidth}
                strokeOpacity={continentsConfig.strokeOpacity}
                style={{ pointerEvents: "none" }}
              />
            ))}

          {/* Render country boundaries */}
          {showCountries &&
            clusters.countries.map((country) => (
              <path
                key={`country-${country.clusterId}`}
                d={polygonToPath(country.polygon)}
                fill={country.color}
                fillOpacity={countriesConfig.fillOpacity}
                stroke={country.color}
                strokeWidth={countriesConfig.strokeWidth}
                strokeOpacity={countriesConfig.strokeOpacity}
                style={{ pointerEvents: "none" }}
              />
            ))}

          {/* Render continent labels ON TOP of boundaries */}
          {showContinents &&
            continentsConfig.showLabels &&
            clusters.continents.map((continent) => (
              <text
                key={`continent-label-${continent.clusterId}`}
                x={xScale(continent.center[0])}
                y={yScale(continent.center[1])}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
                fontWeight="bold"
                fill="black"
                stroke="white"
                strokeWidth="3"
                paintOrder="stroke fill"
                style={{
                  pointerEvents: "none",
                  filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.7))",
                }}
              >
                {getClusterName(continent)}
              </text>
            ))}

          {/* Render country labels ON TOP of boundaries */}
          {showCountries &&
            countriesConfig.showLabels &&
            clusters.countries.map((country) => (
              <text
                key={`country-label-${country.clusterId}`}
                x={xScale(country.center[0])}
                y={yScale(country.center[1])}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="bold"
                fill="#111"
                stroke="white"
                strokeWidth="2"
                paintOrder="stroke fill"
                style={{ pointerEvents: "none" }}
              >
                {country.name || country.clusterId}
              </text>
            ))}
        </g>
      );
    },
  );
