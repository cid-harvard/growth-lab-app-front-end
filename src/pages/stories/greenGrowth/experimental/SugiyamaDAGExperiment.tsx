import React, { useState, useMemo, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  SelectChangeEvent,
  FormControlLabel,
  Switch,
  Grid,
  Box,
} from "@mui/material";
import styled, { createGlobalStyle } from "styled-components";
import { useQuery, gql } from "@apollo/client";
import { FullWidthContentContainer } from "../../../../styling/Grid";
import SugiyamaDAG from "./SugiyamaDAG";
import * as d3 from "d3";

// SplinePreview component to show visual differences
const SplinePreview: React.FC<{ splineType: string }> = ({ splineType }) => {
  const splineMap = new Map([
    ["Default", d3.curveCatmullRom],
    ["Linear", d3.curveLinear],
    ["Monotone Y", d3.curveMonotoneY],
    ["Catmull-Rom", d3.curveCatmullRom],
    ["Step", d3.curveStep],
    ["Step Before", d3.curveStepBefore],
    ["Step After", d3.curveStepAfter],
    ["Basis", d3.curveBasis],
    ["Cardinal", d3.curveCardinal],
  ]);

  const curve = splineMap.get(splineType) || d3.curveCatmullRom;
  const line = d3.line().curve(curve);

  // Sample points that show curve differences well
  const points: [number, number][] = [
    [10, 40],
    [50, 15],
    [100, 35],
    [150, 20],
    [190, 45],
  ];

  const pathData = line(points);

  return (
    <g>
      {/* Draw sample points */}
      {points.map((point, i) => (
        <circle
          key={i}
          cx={point[0]}
          cy={point[1]}
          r="2"
          fill="#666"
          opacity={0.5}
        />
      ))}

      {/* Draw the curve */}
      <path
        d={pathData || ""}
        fill="none"
        stroke="#3498db"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Label */}
      <text x="10" y="55" fontSize="10" fill="#666" fontFamily="sans-serif">
        {splineType}
      </text>
    </g>
  );
};

// Helper function to debounce resize events
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Global style to handle problematic overlays
const GlobalOverlayFix = createGlobalStyle`
  /* Hide any problematic overlay elements that might interfere */
  canvas[style*="z-index: 1000000000"],
  div[style*="z-index: 1000000000"] {
    display: none !important;
    pointer-events: none !important;
  }
  
  /* Ensure Material-UI components stay above overlays */
  .MuiSelect-root,
  .MuiFormControl-root,
  .MuiPaper-root,
  .MuiPopover-root,
  .MuiMenu-root {
    z-index: 10001 !important;
  }
`;

const theme = createTheme({
  typography: {
    fontFamily: '"Source Sans Pro", "Source Sans", sans-serif',
  },
});

const PageContainer = styled(FullWidthContentContainer)`
  padding: 40px 20px;
  font-family: "Source Sans Pro", sans-serif;
  width: 100vw;
  max-width: none;
  margin: 0;
  position: relative;
  z-index: 9999;
`;

const ControlsWrapper = styled.div`
  position: relative;
  z-index: 10000;
  background: white;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 300;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 20px;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const ControlsContainer = styled(Paper)`
  padding: 20px;
  margin-bottom: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled(Typography)`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
`;

const SectionDescription = styled(Typography)`
  color: #6c757d;
  margin-bottom: 16px;
  font-size: 0.9rem;
`;

const StatsContainer = styled.div`
  margin-top: 16px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #3498db;
`;

const StatsText = styled.p`
  margin: 4px 0;
  color: #2c3e50;
  font-size: 0.9rem;

  &:first-child {
    font-weight: 500;
    color: #3498db;
  }
`;

// GraphQL API response types
interface SupplyChain {
  supplyChainId: number;
  supplyChain: string;
}

interface Cluster {
  clusterId: number;
  clusterName: string;
}

interface Product {
  productId: number;
  code: string;
  nameEn: string;
  nameShortEn?: string;
  productLevel: number;
  parentId?: number;
}

interface Mapping {
  supplyChainId: number;
  productId: number;
  clusterId: number;
}

// GraphQL queries (same as TangleTree)
const GET_SUPPLY_CHAINS = gql`
  query GetSupplyChains {
    gpSupplyChainList {
      supplyChainId
      supplyChain
    }
  }
`;

const GET_CLUSTERS = gql`
  query GetClusters {
    gpClusterList {
      clusterId
      clusterName
    }
  }
`;

const GET_PRODUCTS = gql`
  query GetProducts {
    gpProductList {
      productId
      code
      nameEn
      nameShortEn
      productLevel
      parentId
    }
  }
`;

const GET_ALL_SUPPLY_CHAIN_MAPPINGS = gql`
  query GetAllSupplyChainMappings {
    supplyChain0: gpSupplyChainClusterProductMemberList(supplyChainId: 0) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain1: gpSupplyChainClusterProductMemberList(supplyChainId: 1) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain2: gpSupplyChainClusterProductMemberList(supplyChainId: 2) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain3: gpSupplyChainClusterProductMemberList(supplyChainId: 3) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain4: gpSupplyChainClusterProductMemberList(supplyChainId: 4) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain5: gpSupplyChainClusterProductMemberList(supplyChainId: 5) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain6: gpSupplyChainClusterProductMemberList(supplyChainId: 6) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain7: gpSupplyChainClusterProductMemberList(supplyChainId: 7) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain8: gpSupplyChainClusterProductMemberList(supplyChainId: 8) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain9: gpSupplyChainClusterProductMemberList(supplyChainId: 9) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain10: gpSupplyChainClusterProductMemberList(supplyChainId: 10) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain11: gpSupplyChainClusterProductMemberList(supplyChainId: 11) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain12: gpSupplyChainClusterProductMemberList(supplyChainId: 12) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain13: gpSupplyChainClusterProductMemberList(supplyChainId: 13) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain14: gpSupplyChainClusterProductMemberList(supplyChainId: 14) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain15: gpSupplyChainClusterProductMemberList(supplyChainId: 15) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain16: gpSupplyChainClusterProductMemberList(supplyChainId: 16) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain17: gpSupplyChainClusterProductMemberList(supplyChainId: 17) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain18: gpSupplyChainClusterProductMemberList(supplyChainId: 18) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain19: gpSupplyChainClusterProductMemberList(supplyChainId: 19) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain20: gpSupplyChainClusterProductMemberList(supplyChainId: 20) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain21: gpSupplyChainClusterProductMemberList(supplyChainId: 21) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain22: gpSupplyChainClusterProductMemberList(supplyChainId: 22) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain23: gpSupplyChainClusterProductMemberList(supplyChainId: 23) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain24: gpSupplyChainClusterProductMemberList(supplyChainId: 24) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain25: gpSupplyChainClusterProductMemberList(supplyChainId: 25) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain26: gpSupplyChainClusterProductMemberList(supplyChainId: 26) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain27: gpSupplyChainClusterProductMemberList(supplyChainId: 27) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain28: gpSupplyChainClusterProductMemberList(supplyChainId: 28) {
      supplyChainId
      productId
      clusterId
    }
  }
`;

// Cluster group definitions (same as TangleTree)
const clusterGroups = [
  {
    name: "Metals & Materials",
    description: "Primary metals, metal processing, and metal products",
    clusterIds: [1, 2, 11, 27, 29, 31],
  },
  {
    name: "Chemicals & Compounds",
    description: "Chemical processing, polymers, and chemical compounds",
    clusterIds: [4, 7, 10, 12, 13, 14, 16, 30],
  },
  {
    name: "Electrical & Power Systems",
    description: "Power generation, electrical equipment, and energy systems",
    clusterIds: [20, 24, 25, 28],
  },
  {
    name: "Industrial Components",
    description: "Manufacturing components, fittings, and mechanical systems",
    clusterIds: [3, 6, 9, 17, 19, 33],
  },
  {
    name: "Advanced Materials & Technologies",
    description: "High-tech materials, instruments, and specialized components",
    clusterIds: [5, 8, 15, 18, 21, 22, 23, 26, 32, 34],
  },
];

// Special selection options for cluster halves and all clusters
const specialSelections = [
  {
    name: "First Half of All Clusters",
    description: "The first half of all available clusters sorted by ID",
    type: "first-half" as const,
  },
  {
    name: "Second Half of All Clusters",
    description: "The second half of all available clusters sorted by ID",
    type: "second-half" as const,
  },
  {
    name: "All Clusters",
    description: "Every available cluster in the system",
    type: "all-clusters" as const,
  },
];

// Function to convert special selections to DAG format
function convertSpecialToDAGData(
  rawData: {
    supplyChains: SupplyChain[];
    clusters: Cluster[];
    products: Product[];
    mappings: Mapping[];
  },
  selectionType: "first-half" | "second-half" | "all-clusters",
  showProducts: boolean = true,
): {
  nodes: { id: string; data?: any }[];
  links: { source: string; target: string }[];
} {
  const { supplyChains, clusters, products, mappings } = rawData;

  // Get all available cluster IDs and sort them
  const allClusterIds = clusters.map((c) => c.clusterId).sort((a, b) => a - b);

  // Determine which clusters to include based on selection type
  let selectedClusterIds: number[];
  switch (selectionType) {
    case "first-half":
      selectedClusterIds = allClusterIds.slice(
        0,
        Math.ceil(allClusterIds.length / 2),
      );
      break;
    case "second-half":
      selectedClusterIds = allClusterIds.slice(
        Math.ceil(allClusterIds.length / 2),
      );
      break;
    case "all-clusters":
      selectedClusterIds = allClusterIds;
      break;
    default:
      throw new Error(`Invalid selection type: ${selectionType}`);
  }

  const relevantClusterIds = new Set(selectedClusterIds);

  // Filter mappings to only include those for the selected clusters
  const relevantMappings = mappings.filter((mapping) =>
    relevantClusterIds.has(mapping.clusterId),
  );

  // Get relevant supply chains and products
  const relevantSupplyChainIds = new Set(
    relevantMappings.map((m) => m.supplyChainId),
  );
  const relevantProductIds = new Set(relevantMappings.map((m) => m.productId));

  const relevantSupplyChains = supplyChains.filter((sc) =>
    relevantSupplyChainIds.has(sc.supplyChainId),
  );
  const relevantClusters = clusters.filter((c) =>
    relevantClusterIds.has(c.clusterId),
  );
  const relevantProducts = products.filter((p) =>
    relevantProductIds.has(p.productId),
  );

  // Create nodes with additional data for better display names
  const nodes = [
    ...relevantSupplyChains.map((sc) => ({
      id: `SC-${sc.supplyChainId}`,
      data: {
        type: "supply_chain",
        name: sc.supplyChain,
        originalId: sc.supplyChainId,
      },
    })),
    ...relevantClusters.map((c) => ({
      id: `CL-${c.clusterId}`,
      data: { type: "cluster", name: c.clusterName, originalId: c.clusterId },
    })),
    ...(showProducts
      ? relevantProducts.map((p) => ({
          id: `PR-${p.productId}`,
          data: {
            type: "product",
            name: p.nameShortEn || p.nameEn || p.code,
            originalId: p.productId,
            code: p.code,
            level: p.productLevel,
          },
        }))
      : []),
  ];

  // Create links based on mappings
  const links: { source: string; target: string }[] = [];

  relevantMappings.forEach((mapping) => {
    const supplyChainId = `SC-${mapping.supplyChainId}`;
    const clusterId = `CL-${mapping.clusterId}`;
    const productId = `PR-${mapping.productId}`;

    // Add supply chain -> cluster links
    if (
      !links.find((l) => l.source === supplyChainId && l.target === clusterId)
    ) {
      links.push({ source: supplyChainId, target: clusterId });
    }

    // Add cluster -> product links only if showing products
    if (
      showProducts &&
      !links.find((l) => l.source === clusterId && l.target === productId)
    ) {
      links.push({ source: clusterId, target: productId });
    }
  });

  return { nodes, links };
}

// Function to convert API data to DAG format with proper names
function convertToDAGData(
  rawData: {
    supplyChains: SupplyChain[];
    clusters: Cluster[];
    products: Product[];
    mappings: Mapping[];
  },
  selectedGroup: number,
  showProducts: boolean = true,
): {
  nodes: { id: string; data?: any }[];
  links: { source: string; target: string }[];
} {
  const group = clusterGroups[selectedGroup];
  const relevantClusterIds = new Set(group.clusterIds);

  // Filter mappings to only include those for the selected cluster group
  const relevantMappings = rawData.mappings.filter((mapping) =>
    relevantClusterIds.has(mapping.clusterId),
  );

  // Get relevant supply chains and products
  const relevantSupplyChainIds = new Set(
    relevantMappings.map((m) => m.supplyChainId),
  );
  const relevantProductIds = new Set(relevantMappings.map((m) => m.productId));

  const relevantSupplyChains = rawData.supplyChains.filter((sc) =>
    relevantSupplyChainIds.has(sc.supplyChainId),
  );
  const relevantClusters = rawData.clusters.filter((c) =>
    relevantClusterIds.has(c.clusterId),
  );
  const relevantProducts = rawData.products.filter((p) =>
    relevantProductIds.has(p.productId),
  );

  // Create nodes with additional data for better display names
  const nodes = [
    ...relevantSupplyChains.map((sc) => ({
      id: `SC-${sc.supplyChainId}`,
      data: {
        type: "supply_chain",
        name: sc.supplyChain,
        originalId: sc.supplyChainId,
      },
    })),
    ...relevantClusters.map((c) => ({
      id: `CL-${c.clusterId}`,
      data: { type: "cluster", name: c.clusterName, originalId: c.clusterId },
    })),
    ...(showProducts
      ? relevantProducts.map((p) => ({
          id: `PR-${p.productId}`,
          data: {
            type: "product",
            name: p.nameShortEn || p.nameEn || p.code,
            originalId: p.productId,
            code: p.code,
            level: p.productLevel,
          },
        }))
      : []),
  ];

  // Create links based on mappings
  const links: { source: string; target: string }[] = [];

  relevantMappings.forEach((mapping) => {
    const supplyChainId = `SC-${mapping.supplyChainId}`;
    const clusterId = `CL-${mapping.clusterId}`;
    const productId = `PR-${mapping.productId}`;

    // Add supply chain -> cluster links
    if (
      !links.find((l) => l.source === supplyChainId && l.target === clusterId)
    ) {
      links.push({ source: supplyChainId, target: clusterId });
    }

    // Add cluster -> product links only if showing products
    if (
      showProducts &&
      !links.find((l) => l.source === clusterId && l.target === productId)
    ) {
      links.push({ source: clusterId, target: productId });
    }
  });

  return { nodes, links };
}

// Sample datasets for fallback
const sampleDatasets = {
  "Simple DAG": {
    nodes: [
      { id: "A" },
      { id: "B" },
      { id: "C" },
      { id: "D" },
      { id: "E" },
      { id: "F" },
    ],
    links: [
      { source: "A", target: "B" },
      { source: "A", target: "C" },
      { source: "B", target: "D" },
      { source: "C", target: "D" },
      { source: "D", target: "E" },
      { source: "B", target: "F" },
      { source: "C", target: "F" },
    ],
  },
  "Complex DAG": {
    nodes: [
      { id: "Start" },
      { id: "Task1" },
      { id: "Task2" },
      { id: "Task3" },
      { id: "Task4" },
      { id: "Task5" },
      { id: "Task6" },
      { id: "Merge1" },
      { id: "Merge2" },
      { id: "Final" },
    ],
    links: [
      { source: "Start", target: "Task1" },
      { source: "Start", target: "Task2" },
      { source: "Start", target: "Task3" },
      { source: "Task1", target: "Task4" },
      { source: "Task2", target: "Task5" },
      { source: "Task3", target: "Task6" },
      { source: "Task4", target: "Merge1" },
      { source: "Task5", target: "Merge1" },
      { source: "Task6", target: "Merge2" },
      { source: "Merge1", target: "Final" },
      { source: "Merge2", target: "Final" },
      { source: "Task1", target: "Task6" },
      { source: "Task2", target: "Task4" },
    ],
  },
  "Diamond Pattern": {
    nodes: [
      { id: "Root" },
      { id: "Left" },
      { id: "Right" },
      { id: "LeftSub1" },
      { id: "LeftSub2" },
      { id: "RightSub1" },
      { id: "RightSub2" },
      { id: "Convergence" },
      { id: "End" },
    ],
    links: [
      { source: "Root", target: "Left" },
      { source: "Root", target: "Right" },
      { source: "Left", target: "LeftSub1" },
      { source: "Left", target: "LeftSub2" },
      { source: "Right", target: "RightSub1" },
      { source: "Right", target: "RightSub2" },
      { source: "LeftSub1", target: "Convergence" },
      { source: "LeftSub2", target: "Convergence" },
      { source: "RightSub1", target: "Convergence" },
      { source: "RightSub2", target: "Convergence" },
      { source: "Convergence", target: "End" },
    ],
  },
  "Wide Network": {
    nodes: [
      { id: "Input1" },
      { id: "Input2" },
      { id: "Input3" },
      { id: "Input4" },
      { id: "Process1" },
      { id: "Process2" },
      { id: "Process3" },
      { id: "Process4" },
      { id: "Process5" },
      { id: "Combine1" },
      { id: "Combine2" },
      { id: "Output" },
    ],
    links: [
      { source: "Input1", target: "Process1" },
      { source: "Input1", target: "Process2" },
      { source: "Input2", target: "Process2" },
      { source: "Input2", target: "Process3" },
      { source: "Input3", target: "Process3" },
      { source: "Input3", target: "Process4" },
      { source: "Input4", target: "Process4" },
      { source: "Input4", target: "Process5" },
      { source: "Process1", target: "Combine1" },
      { source: "Process2", target: "Combine1" },
      { source: "Process3", target: "Combine1" },
      { source: "Process4", target: "Combine2" },
      { source: "Process5", target: "Combine2" },
      { source: "Combine1", target: "Output" },
      { source: "Combine2", target: "Output" },
    ],
  },
};

const SugiyamaDAGExperiment: React.FC = () => {
  const [layering, setLayering] = useState<string>("Simplex (shortest edges)");
  const [decross, setDecross] = useState<string>("Two Layer Greedy (fast)");
  const [coord, setCoord] = useState<string>("Simplex (medium)");
  const [spline, setSpline] = useState<string>("Default");
  const [arrows, setArrows] = useState<boolean>(true);
  const [selectedGroup, setSelectedGroup] = useState<string>("0"); // Changed to string to handle both numbers and special selections
  const [nodeRadius, setNodeRadius] = useState<number>(20);
  const [useAPIData, setUseAPIData] = useState<boolean>(true);
  const [showProducts, setShowProducts] = useState<boolean>(true);
  const [containerWidth, setContainerWidth] = useState<number>(1200);

  // Handle window resize
  useEffect(() => {
    const updateWidth = () => {
      setContainerWidth(Math.max(800, window.innerWidth - 80));
    };

    updateWidth();
    const debouncedUpdate = debounce(updateWidth, 300);
    window.addEventListener("resize", debouncedUpdate);

    return () => {
      window.removeEventListener("resize", debouncedUpdate);
    };
  }, []);

  // Clean up any problematic overlay elements
  useEffect(() => {
    const cleanupOverlays = () => {
      // Find and hide any canvas elements with extremely high z-index
      const problematicElements = document.querySelectorAll(
        'canvas[style*="z-index: 1000000000"], div[style*="z-index: 1000000000"]',
      );

      problematicElements.forEach((element) => {
        (element as HTMLElement).style.display = "none";
        (element as HTMLElement).style.pointerEvents = "none";
      });
    };

    // Clean up on mount
    cleanupOverlays();

    // Set up a periodic cleanup in case new overlays appear
    const intervalId = setInterval(cleanupOverlays, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Fetch all required data using Apollo Client (same as TangleTree)
  const {
    loading: loadingSupplyChains,
    error: errorSupplyChains,
    data: supplyChainsData,
  } = useQuery(GET_SUPPLY_CHAINS);

  const {
    loading: loadingClusters,
    error: errorClusters,
    data: clustersData,
  } = useQuery(GET_CLUSTERS);

  const {
    loading: loadingProducts,
    error: errorProducts,
    data: productsData,
  } = useQuery(GET_PRODUCTS);

  const {
    loading: loadingMappings,
    error: errorMappings,
    data: mappingsData,
  } = useQuery(GET_ALL_SUPPLY_CHAIN_MAPPINGS);

  const loading =
    loadingSupplyChains ||
    loadingClusters ||
    loadingProducts ||
    loadingMappings;
  const error =
    errorSupplyChains || errorClusters || errorProducts || errorMappings;

  // Process raw data using useMemo for derived values
  const processedData = useMemo(() => {
    if (
      loading ||
      error ||
      !supplyChainsData ||
      !clustersData ||
      !productsData ||
      !mappingsData
    ) {
      return null;
    }

    // Flatten all supply chain mappings
    const allMappings: Mapping[] = [];
    Object.keys(mappingsData).forEach((key) => {
      if (mappingsData[key]) {
        allMappings.push(...mappingsData[key]);
      }
    });

    return {
      supplyChains: supplyChainsData.gpSupplyChainList,
      clusters: clustersData.gpClusterList,
      products: productsData.gpProductList,
      mappings: allMappings,
    };
  }, [
    loading,
    error,
    supplyChainsData,
    clustersData,
    productsData,
    mappingsData,
  ]);

  const currentData = useMemo(() => {
    if (useAPIData && processedData) {
      // Check if this is a special selection (starts with "special-")
      if (selectedGroup.startsWith("special-")) {
        const selectionType = selectedGroup.replace("special-", "") as
          | "first-half"
          | "second-half"
          | "all-clusters";
        return convertSpecialToDAGData(
          processedData,
          selectionType,
          showProducts,
        );
      } else {
        // Regular group selection
        const groupIndex = parseInt(selectedGroup);
        return convertToDAGData(processedData, groupIndex, showProducts);
      }
    } else {
      // Fallback to sample data
      const sampleKey = Object.keys(sampleDatasets)[0];
      return sampleDatasets[sampleKey as keyof typeof sampleDatasets];
    }
  }, [useAPIData, processedData, selectedGroup, showProducts]);

  const handleLayeringChange = (event: SelectChangeEvent<string>) => {
    setLayering(event.target.value);
  };

  const handleDecrossChange = (event: SelectChangeEvent<string>) => {
    setDecross(event.target.value);
  };

  const handleCoordChange = (event: SelectChangeEvent<string>) => {
    setCoord(event.target.value);
  };

  const handleSplineChange = (event: SelectChangeEvent<string>) => {
    setSpline(event.target.value);
  };

  const handleArrowsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setArrows(event.target.checked);
  };

  const handleGroupChange = (event: SelectChangeEvent<string>) => {
    setSelectedGroup(event.target.value);
  };

  const handleUseAPIDataChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setUseAPIData(event.target.checked);
  };

  const handleShowProductsChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setShowProducts(event.target.checked);
  };

  const handleNodeRadiusChange = (event: SelectChangeEvent<string>) => {
    setNodeRadius(parseInt(event.target.value));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalOverlayFix />
      <PageContainer>
        <div style={{ width: "100%", maxWidth: "none" }}>
          <Title>D3-DAG: Sugiyama Layout</Title>
          <Subtitle>
            The Sugiyama method is a way to render DAGs by assigning each node a
            layer, shuffling the layers to minimize edge crossings, and then
            aligning nodes within a layer to produce a pleasing DAG layout. This
            algorithm is the primary method to lay out DAGs in d3-dag.
          </Subtitle>

          {loading ? (
            <div
              style={{ padding: "40px", textAlign: "center", color: "#6c757d" }}
            >
              Loading green growth data from API...
            </div>
          ) : error ? (
            <div
              style={{ padding: "40px", textAlign: "center", color: "#dc3545" }}
            >
              Error loading data: {error.message}
            </div>
          ) : (
            <SugiyamaDAG
              data={currentData}
              layering={layering}
              decross={decross}
              coord={coord}
              spline={spline}
              arrows={arrows}
              nodeRadius={nodeRadius}
              width={containerWidth}
              height={600}
              verticalGap={400}
            />
          )}

          {useAPIData && processedData && (
            <StatsContainer>
              <StatsText>Green Growth Data Overview</StatsText>
              <StatsText>
                {processedData.supplyChains.length} supply chains •{" "}
                {processedData.clusters.length} clusters •{" "}
                {processedData.products.length} products •{" "}
                {processedData.mappings.length} mappings
              </StatsText>
              <StatsText style={{ marginTop: "8px", fontStyle: "italic" }}>
                {selectedGroup.startsWith("special-") ? (
                  <>
                    {selectedGroup === "special-first-half" &&
                      `Showing first ${Math.ceil(processedData.clusters.length / 2)} clusters`}
                    {selectedGroup === "special-second-half" &&
                      `Showing last ${Math.floor(processedData.clusters.length / 2)} clusters`}
                    {selectedGroup === "special-all-clusters" &&
                      `Showing all ${processedData.clusters.length} clusters`}
                  </>
                ) : (
                  <>
                    Showing cluster group:{" "}
                    {clusterGroups[parseInt(selectedGroup)].name}
                  </>
                )}
                {!showProducts && " (Products layer hidden)"}
              </StatsText>
              {(decross.includes("very slow") ||
                decross.includes("Optimal")) && (
                <StatsText
                  style={{
                    marginTop: "8px",
                    color: "#e74c3c",
                    fontWeight: "bold",
                  }}
                >
                  ⚠️ Warning: "{decross}" algorithm may take a long time with
                  large datasets!
                </StatsText>
              )}
            </StatsContainer>
          )}

          <ControlsWrapper>
            <ControlsContainer>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <SectionTitle variant="h6">Data Source</SectionTitle>
                  <SectionDescription>
                    Choose to use real green growth data from the API or sample
                    datasets. Special selections allow you to explore all
                    clusters or portions of them beyond the predefined groups.
                  </SectionDescription>
                  <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={useAPIData}
                          onChange={handleUseAPIDataChange}
                          name="useAPIData"
                          color="primary"
                        />
                      }
                      label="Use API Data (Green Growth Value Chains)"
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showProducts}
                          onChange={handleShowProductsChange}
                          name="showProducts"
                          color="primary"
                          disabled={!useAPIData}
                        />
                      }
                      label="Show Products Layer (Third Layer)"
                    />
                  </Box>
                  {useAPIData && processedData && (
                    <FormControl fullWidth size="small">
                      <InputLabel>Cluster Selection</InputLabel>
                      <Select
                        value={selectedGroup}
                        label="Cluster Selection"
                        onChange={handleGroupChange}
                      >
                        {/* Regular cluster groups */}
                        <MenuItem
                          disabled
                          sx={{ fontWeight: "bold", color: "primary.main" }}
                        >
                          Predefined Cluster Groups
                        </MenuItem>
                        {clusterGroups.map((group, index) => (
                          <MenuItem
                            key={index}
                            value={index.toString()}
                            sx={{ pl: 3 }}
                          >
                            {group.name}
                          </MenuItem>
                        ))}

                        {/* Special selections */}
                        <MenuItem
                          disabled
                          sx={{
                            fontWeight: "bold",
                            color: "primary.main",
                            mt: 1,
                          }}
                        >
                          All Clusters Options
                        </MenuItem>
                        {specialSelections.map((selection) => (
                          <MenuItem
                            key={`special-${selection.type}`}
                            value={`special-${selection.type}`}
                            sx={{ pl: 3 }}
                          >
                            {selection.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <SectionTitle variant="h6">Node Size</SectionTitle>
                  <SectionDescription>
                    Adjust the size of the nodes in the visualization
                  </SectionDescription>
                  <FormControl fullWidth size="small">
                    <InputLabel>Node Radius</InputLabel>
                    <Select
                      value={nodeRadius.toString()}
                      label="Node Radius"
                      onChange={handleNodeRadiusChange}
                    >
                      <MenuItem value="15">Small (15px)</MenuItem>
                      <MenuItem value="20">Medium (20px)</MenuItem>
                      <MenuItem value="25">Large (25px)</MenuItem>
                      <MenuItem value="30">Extra Large (30px)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <SectionTitle variant="h6">Layering</SectionTitle>
                  <SectionDescription>
                    This algorithm assigns each node to a layer
                  </SectionDescription>
                  <FormControl fullWidth size="small">
                    <InputLabel>Layering Method</InputLabel>
                    <Select
                      value={layering}
                      label="Layering Method"
                      onChange={handleLayeringChange}
                    >
                      <MenuItem value="Simplex (shortest edges)">
                        Simplex (shortest edges)
                      </MenuItem>
                      <MenuItem value="Longest Path (minimum height)">
                        Longest Path (minimum height)
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <SectionTitle variant="h6">
                    Crossing Minimization
                  </SectionTitle>
                  <SectionDescription>
                    This sets how to arrange each node in a layer to minimize
                    edge crossings, and is often the most expensive part
                  </SectionDescription>
                  <FormControl fullWidth size="small">
                    <InputLabel>Decross Method</InputLabel>
                    <Select
                      value={decross}
                      label="Decross Method"
                      onChange={handleDecrossChange}
                    >
                      <MenuItem value="Two Layer Greedy (fast)">
                        Two Layer Greedy (fast)
                      </MenuItem>
                      <MenuItem value="Two Layer Agg (fast)">
                        Two Layer Agg (fast)
                      </MenuItem>
                      <MenuItem value="Optimal (can be very slow)">
                        Optimal (can be very slow)
                      </MenuItem>
                      <MenuItem value="Two Layer Opt (can be very slow)">
                        Two Layer Opt (can be very slow)
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <SectionTitle variant="h6">
                    Coordinate Assignment
                  </SectionTitle>
                  <SectionDescription>
                    This gives ordered nodes in a layer an actual x coordinate,
                    spacing some out more than others
                  </SectionDescription>
                  <FormControl fullWidth size="small">
                    <InputLabel>Coordinate Method</InputLabel>
                    <Select
                      value={coord}
                      label="Coordinate Method"
                      onChange={handleCoordChange}
                    >
                      <MenuItem value="Simplex (medium)">
                        Simplex (medium)
                      </MenuItem>
                      <MenuItem value="Quadratic (can be slow)">
                        Quadratic (can be slow)
                      </MenuItem>
                      <MenuItem value="Greedy (fast)">Greedy (fast)</MenuItem>
                      <MenuItem value="Center (fast)">Center (fast)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <SectionTitle variant="h6">Spline Interpolation</SectionTitle>
                  <SectionDescription>
                    d3-dag uses d3 splines for rendering edges, changing the
                    spline interpolation changes the appearance of edges
                  </SectionDescription>
                  <FormControl fullWidth size="small">
                    <InputLabel>Spline Type</InputLabel>
                    <Select
                      value={spline}
                      label="Spline Type"
                      onChange={handleSplineChange}
                    >
                      <MenuItem value="Default">Default</MenuItem>
                      <MenuItem value="Linear">Linear (sharp angles)</MenuItem>
                      <MenuItem value="Monotone Y">
                        Monotone Y (smooth)
                      </MenuItem>
                      <MenuItem value="Catmull-Rom">
                        Catmull-Rom (rounded)
                      </MenuItem>
                      <MenuItem value="Step">Step (staircase)</MenuItem>
                      <MenuItem value="Step Before">
                        Step Before (left steps)
                      </MenuItem>
                      <MenuItem value="Step After">
                        Step After (right steps)
                      </MenuItem>
                      <MenuItem value="Basis">Basis (B-spline)</MenuItem>
                      <MenuItem value="Cardinal">Cardinal (curved)</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Visual preview of selected spline */}
                  <Box
                    sx={{ mt: 2, p: 2, bgcolor: "#f8f9fa", borderRadius: 1 }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ display: "block", mb: 1, color: "#6c757d" }}
                    >
                      Preview of "{spline}" curve:
                    </Typography>
                    <svg
                      width="200"
                      height="60"
                      style={{
                        border: "1px solid #e0e0e0",
                        borderRadius: "4px",
                        background: "white",
                      }}
                    >
                      <SplinePreview splineType={spline} />
                    </svg>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <SectionTitle variant="h6">Visual Options</SectionTitle>
                  <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={arrows}
                          onChange={handleArrowsChange}
                          name="arrows"
                          color="primary"
                        />
                      }
                      label="Show arrows on edges"
                    />
                  </Box>
                </Grid>
              </Grid>
            </ControlsContainer>
          </ControlsWrapper>
        </div>
      </PageContainer>
    </ThemeProvider>
  );
};

export default SugiyamaDAGExperiment;
