import React, { useRef, useState } from "react";
import * as d3 from "d3";
import { useLoaderData } from "react-router-dom";
import { Box } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import SpaceVisualization from "./SpaceVisualization";
import Configurator from "./Configurator";
import "./visualizer.css";
import type { Node, Link, MetaData } from "./loader";
import { inferFieldNames } from "./Configurator";

export const theme = createTheme({
  typography: {
    fontFamily: '"Source Sans Pro", "Source Sans", sans-serif',
  },
});

interface LoaderData {
  nodes: Node[];
  links: Link[];
  metadata: MetaData[];
  clusters?: import("./loader").ClusterData;
  defaultMetadata?: Array<{
    cluster_name: string;
    cluster_name_short: string;
    cluster_col: string;
  }>;
  categoryMetaMap?: Record<string, { name: string; color: string }>;
}

interface FieldNames {
  id: string;
  x: string;
  y: string;
  source: string;
  target: string;
  radius?: string;
  tooltip?: string[];
  category?: string;
  metaId?: string;
  metaName?: string;
  metaColor?: string;
}

export default function Visualization() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { nodes, links, metadata, clusters, defaultMetadata } =
    useLoaderData() as LoaderData;
  const [showAllLinks, setShowAllLinks] = useState(false);

  // Cluster boundary configuration
  const [clusterConfig, setClusterConfig] = useState({
    showContinents: true,
    showCountries: false,
    continents: {
      strokeWidth: 2,
      fillOpacity: 0.1,
      strokeOpacity: 0.8,
      showLabels: false,
    },
    countries: {
      strokeWidth: 1.5,
      fillOpacity: 0.05,
      strokeOpacity: 0.6,
      showLabels: false,
    },
  });

  const nodeKeys =
    nodes.length > 0
      ? Object.keys(nodes[0]).filter((key) =>
          nodes.some((node) => node[key] !== undefined && node[key] !== ""),
        )
      : [];
  const linkKeys =
    links.length > 0
      ? Object.keys(links[0]).filter((key) =>
          links.some((link) => link[key] !== undefined && link[key] !== ""),
        )
      : [];
  const metaKeys =
    metadata && metadata.length > 0
      ? Object.keys(metadata[0]).filter((key) =>
          metadata.some((meta) => meta[key] !== undefined && meta[key] !== ""),
        )
      : [];

  // Use simple inference for initial state
  const inferred = inferFieldNames(nodeKeys, linkKeys, metaKeys);
  const [fieldNames, setFieldNames] = useState<FieldNames>(() => ({
    id: inferred.id ?? "",
    x: inferred.x ?? "",
    y: inferred.y ?? "",
    source: inferred.source ?? "",
    target: inferred.target ?? "",
    radius: inferred.radius,
    tooltip: inferred.tooltip ?? [],
    category: inferred.category,
    metaId: inferred.metaId,
    metaName: inferred.metaName,
    metaColor: inferred.metaColor,
  }));

  const [radiusConfig, setRadiusConfig] = useState({
    min: 2,
    max: 40,
    scale: "sqrt",
    fixedSize: 6,
  });

  // Use metadata for color mapping if available
  const clusterColorMap = React.useMemo(() => {
    // First try to use default metadata if available
    if (defaultMetadata) {
      return new Map(
        defaultMetadata.map((meta) => [meta.cluster_name, meta.cluster_col]),
      );
    }

    // Then try to use uploaded metadata if available
    if (
      metadata &&
      metadata.length > 0 &&
      fieldNames.category &&
      fieldNames.metaId &&
      fieldNames.metaColor
    ) {
      // Create a map from metadata ID to color
      const metaMap = new Map<string, string>();
      for (const meta of metadata) {
        const id = meta[fieldNames.metaId] as string | undefined;
        const color = meta[fieldNames.metaColor] as string | undefined;
        if (id && color) {
          metaMap.set(String(id), String(color));
        }
      }

      // Map from node category to color
      const result = new Map<string, string>();
      for (const node of nodes) {
        const category = node[fieldNames.category] as string | undefined;
        if (category) {
          const color = metaMap.get(String(category));
          result.set(String(category), color || "#999"); // Fallback color if not found
        }
      }
      return result;
    }
    return new Map<string, string>();
  }, [
    metadata,
    nodes,
    fieldNames.category,
    fieldNames.metaId,
    fieldNames.metaColor,
    defaultMetadata,
  ]);

  const nodeLookup = React.useMemo(() => {
    const uniqueNodes = Array.from(
      new Map(
        nodes.map((node) => [String(node[fieldNames.id]), node]),
      ).values(),
    );
    return d3.index(uniqueNodes, (d) => String(d[fieldNames.id]));
  }, [nodes, fieldNames.id]);

  const linkLookup = React.useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const link of links) {
      const source = String(link[fieldNames.source]);
      const target = String(link[fieldNames.target]);

      if (!map.has(source)) {
        map.set(source, new Set());
      }
      map.get(source)?.add(target);

      if (!map.has(target)) {
        map.set(target, new Set());
      }
      map.get(target)?.add(source);
    }
    return map;
  }, [links, fieldNames.source, fieldNames.target]);

  const allLinks = React.useMemo(() => {
    const result: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (const [sourceId, targetIds] of linkLookup.entries()) {
      const source = nodeLookup.get(String(sourceId));
      if (!source) continue;

      for (const targetId of Array.from(targetIds)) {
        const target = nodeLookup.get(String(targetId));
        if (!target) continue;

        const x1 = Number.parseFloat(String(source[fieldNames.x]));
        const y1 = Number.parseFloat(String(source[fieldNames.y]));
        const x2 = Number.parseFloat(String(target[fieldNames.x]));
        const y2 = Number.parseFloat(String(target[fieldNames.y]));

        if (
          !Number.isNaN(x1) &&
          !Number.isNaN(y1) &&
          !Number.isNaN(x2) &&
          !Number.isNaN(y2)
        ) {
          result.push({ x1, y1, x2, y2 });
        }
      }
    }
    return result;
  }, [linkLookup, nodeLookup, fieldNames.x, fieldNames.y]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          m: 0,
          p: 0,
          boxSizing: "border-box",
          zIndex: 0,
        }}
      >
        {/* Main Visualization Area */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            minWidth: 0,
            m: 0,
            p: 0,
            zIndex: 1,
          }}
        >
          <Configurator
            nodeKeys={nodeKeys}
            linkKeys={linkKeys}
            metaKeys={metaKeys}
            fieldNames={fieldNames}
            setFieldNames={setFieldNames}
            radiusConfig={radiusConfig}
            setRadiusConfig={setRadiusConfig}
            showAllLinks={showAllLinks}
            setShowAllLinks={setShowAllLinks}
            clusters={clusters}
            clusterConfig={clusterConfig}
            setClusterConfig={setClusterConfig}
          />
          <Box
            sx={{
              width: "100%",
              height: "100%",
              flex: 1,
              position: "relative",
            }}
          >
            <SpaceVisualization
              nodes={nodes}
              fieldNames={fieldNames}
              showAllLinks={showAllLinks}
              clusterColorMap={clusterColorMap}
              allLinks={allLinks}
              svgRef={svgRef}
              radiusConfig={radiusConfig}
              clusters={clusters}
              clusterConfig={clusterConfig}
              defaultMetadata={defaultMetadata}
              metadata={metadata}
            />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
