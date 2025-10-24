import React, { useState, useEffect, useMemo } from "react";
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
} from "@mui/material";
import { useQuery, gql } from "@apollo/client";
import styled from "styled-components";
import {
  FullWidthContent,
  FullWidthContentContainer,
} from "../../../../styling/Grid";
import TangleTree from "./TangleTree";
// import ProductSpaceClusterBoundaries from "./ProductSpaceClusterBoundaries";

const theme = createTheme({
  typography: {
    fontFamily: '"Source Sans Pro", "Source Sans", sans-serif',
  },
});

const PageContainer = styled(FullWidthContentContainer)`
  padding: 40px 20px;
  font-family: "Source Sans Pro", sans-serif;
`;

const ControlsContainer = styled(Paper)`
  padding: 20px;
  margin-bottom: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

interface TangleNodeInput {
  id: string;
  displaytext?: string;
  parents?: string[];
}

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

// GraphQL queries extracted from the script
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
  }
`;

// Cluster group definitions from the script
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

// Data transformation function for special cluster selections
function generateSpecialClusterData(
  rawData: {
    supplyChains: SupplyChain[];
    clusters: Cluster[];
    products: Product[];
    mappings: Mapping[];
  },
  selectionType: "first-half" | "second-half" | "all-clusters",
): TangleNodeInput[][] {
  const { supplyChains, clusters, products, mappings } = rawData;

  if (!supplyChains || !clusters || !products || !mappings) {
    throw new Error("Missing required data from API");
  }

  // Create lookup maps for efficiency
  const clusterMap = new Map(clusters.map((c: Cluster) => [c.clusterId, c]));
  const productMap = new Map(products.map((p: Product) => [p.productId, p]));
  const supplyChainMap = new Map(
    supplyChains.map((sc: SupplyChain) => [sc.supplyChainId, sc]),
  );

  // Group mappings by cluster
  const clusterToSupplyChainMap = new Map();
  const clusterToProductMap = new Map();

  mappings.forEach((mapping: Mapping) => {
    const { supplyChainId, clusterId, productId } = mapping;

    // Track cluster -> supply chain relationships
    if (!clusterToSupplyChainMap.has(clusterId)) {
      clusterToSupplyChainMap.set(clusterId, new Set());
    }
    clusterToSupplyChainMap.get(clusterId).add(supplyChainId);

    // Track cluster -> product relationships
    if (!clusterToProductMap.has(clusterId)) {
      clusterToProductMap.set(clusterId, new Set());
    }
    clusterToProductMap.get(clusterId).add(productId);
  });

  // Get all available cluster IDs and sort them
  const allClusterIds = Array.from(clusterMap.keys()).sort((a, b) => a - b);

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

  // Collect all supply chains and products for selected clusters
  const allSupplyChainIds = new Set<number>();
  const allProductIds = new Set<number>();
  const selectedClusters: Array<{
    clusterId: number;
    cluster: Cluster;
    supplyChainIds: Set<number>;
    productIds: Set<number>;
  }> = [];

  selectedClusterIds.forEach((clusterId) => {
    const cluster = clusterMap.get(clusterId);
    if (!cluster) return;

    const supplyChainIds = clusterToSupplyChainMap.get(clusterId) || new Set();
    const productIds = clusterToProductMap.get(clusterId) || new Set();

    // Skip clusters with no relationships
    if (supplyChainIds.size === 0 || productIds.size === 0) return;

    // Add to collections
    supplyChainIds.forEach((id: number) => allSupplyChainIds.add(id));
    productIds.forEach((id: number) => allProductIds.add(id));
    selectedClusters.push({ clusterId, cluster, supplyChainIds, productIds });
  });

  if (selectedClusters.length === 0) {
    throw new Error(
      `No valid clusters found for selection type: ${selectionType}`,
    );
  }

  // Build the hierarchical structure
  const hierarchicalData: TangleNodeInput[][] = [];

  // Level 1: Supply Chains relevant to selected clusters
  const level1: TangleNodeInput[] = [];
  allSupplyChainIds.forEach((supplyChainId: number) => {
    const supplyChain = supplyChainMap.get(supplyChainId);
    if (supplyChain) {
      level1.push({
        id: `SC-${supplyChain.supplyChainId}`,
        displaytext: supplyChain.supplyChain,
      });
    }
  });
  hierarchicalData.push(level1);

  // Level 2: Selected clusters with their supply chain parents
  const level2: TangleNodeInput[] = [];
  selectedClusters.forEach(({ clusterId, cluster, supplyChainIds }) => {
    level2.push({
      id: `CLUSTER-${clusterId}`,
      parents: Array.from(supplyChainIds).map((id: number) => `SC-${id}`),
      displaytext: cluster.clusterName,
    });
  });
  hierarchicalData.push(level2);

  // Level 3: Products with their cluster parents
  const level3: TangleNodeInput[] = [];
  allProductIds.forEach((productId: number) => {
    const product = productMap.get(productId);
    if (!product) return;

    // Find which selected clusters contain this product
    const parentClusters: string[] = [];
    selectedClusters.forEach(({ clusterId, productIds }) => {
      if (productIds.has(productId)) {
        parentClusters.push(`CLUSTER-${clusterId}`);
      }
    });

    if (parentClusters.length > 0) {
      level3.push({
        id: `PRODUCT-${productId}`,
        parents: parentClusters,
        displaytext:
          product.nameShortEn || product.nameEn || `Product ${productId}`,
      });
    }
  });
  hierarchicalData.push(level3);

  return hierarchicalData;
}

// Data transformation function from the script
function generateClusterGroupData(
  rawData: {
    supplyChains: SupplyChain[];
    clusters: Cluster[];
    products: Product[];
    mappings: Mapping[];
  },
  groupIndex: number,
): TangleNodeInput[][] {
  const { supplyChains, clusters, products, mappings } = rawData;

  if (!supplyChains || !clusters || !products || !mappings) {
    throw new Error("Missing required data from API");
  }

  // Create lookup maps for efficiency
  const clusterMap = new Map(clusters.map((c: Cluster) => [c.clusterId, c]));
  const productMap = new Map(products.map((p: Product) => [p.productId, p]));
  const supplyChainMap = new Map(
    supplyChains.map((sc: SupplyChain) => [sc.supplyChainId, sc]),
  );

  // Group mappings by cluster
  const clusterToSupplyChainMap = new Map();
  const clusterToProductMap = new Map();

  mappings.forEach((mapping: Mapping) => {
    const { supplyChainId, clusterId, productId } = mapping;

    // Track cluster -> supply chain relationships
    if (!clusterToSupplyChainMap.has(clusterId)) {
      clusterToSupplyChainMap.set(clusterId, new Set());
    }
    clusterToSupplyChainMap.get(clusterId).add(supplyChainId);

    // Track cluster -> product relationships
    if (!clusterToProductMap.has(clusterId)) {
      clusterToProductMap.set(clusterId, new Set());
    }
    clusterToProductMap.get(clusterId).add(productId);
  });

  const group = clusterGroups[groupIndex];
  if (!group) {
    throw new Error(`Invalid group index: ${groupIndex}`);
  }

  // Collect all supply chains for clusters in this group
  const allSupplyChainIds = new Set<number>();
  const allProductIds = new Set<number>();
  const groupClusters: Array<{
    clusterId: number;
    cluster: Cluster;
    supplyChainIds: Set<number>;
    productIds: Set<number>;
  }> = [];

  group.clusterIds.forEach((clusterId) => {
    const cluster = clusterMap.get(clusterId);
    if (!cluster) return;

    const supplyChainIds = clusterToSupplyChainMap.get(clusterId) || new Set();
    const productIds = clusterToProductMap.get(clusterId) || new Set();

    // Skip clusters with no relationships
    if (supplyChainIds.size === 0 || productIds.size === 0) return;

    // Add to group collections
    supplyChainIds.forEach((id: number) => allSupplyChainIds.add(id));
    productIds.forEach((id: number) => allProductIds.add(id));
    groupClusters.push({ clusterId, cluster, supplyChainIds, productIds });
  });

  if (groupClusters.length === 0) {
    throw new Error(`No valid clusters found for group: ${group.name}`);
  }

  // Build the hierarchical structure for this group
  const hierarchicalData: TangleNodeInput[][] = [];

  // Level 1: Supply Chains relevant to this group
  const level1: TangleNodeInput[] = [];
  allSupplyChainIds.forEach((supplyChainId: number) => {
    const supplyChain = supplyChainMap.get(supplyChainId);
    if (supplyChain) {
      level1.push({
        id: `SC-${supplyChain.supplyChainId}`,
        displaytext: supplyChain.supplyChain,
      });
    }
  });
  hierarchicalData.push(level1);

  // Level 2: Clusters in this group with their supply chain parents
  const level2: TangleNodeInput[] = [];
  groupClusters.forEach(({ clusterId, cluster, supplyChainIds }) => {
    level2.push({
      id: `CLUSTER-${clusterId}`,
      parents: Array.from(supplyChainIds).map((id: number) => `SC-${id}`),
      displaytext: cluster.clusterName,
    });
  });
  hierarchicalData.push(level2);

  // Level 3: Products with their cluster parents (can have multiple parents within group)
  const level3: TangleNodeInput[] = [];
  allProductIds.forEach((productId: number) => {
    const product = productMap.get(productId);
    if (!product) return;

    // Find which clusters in this group contain this product
    const parentClusters: string[] = [];
    groupClusters.forEach(({ clusterId, productIds }) => {
      if (productIds.has(productId)) {
        parentClusters.push(`CLUSTER-${clusterId}`);
      }
    });

    if (parentClusters.length > 0) {
      level3.push({
        id: `PRODUCT-${productId}`,
        parents: parentClusters,
        displaytext:
          product.nameShortEn || product.nameEn || `Product ${productId}`,
      });
    }
  });
  hierarchicalData.push(level3);

  return hierarchicalData;
}

const TangleTreeExperiment: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<string>("0");
  const [tangleData, setTangleData] = useState<TangleNodeInput[][]>([]);

  // Fetch all required data using Apollo Client
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

    const processedRawData = {
      supplyChains: supplyChainsData.gpSupplyChainList,
      clusters: clustersData.gpClusterList,
      products: productsData.gpProductList,
      mappings: allMappings,
    };

    console.log("Data processed successfully:", {
      supplyChains: processedRawData.supplyChains.length,
      clusters: processedRawData.clusters.length,
      products: processedRawData.products.length,
      mappings: processedRawData.mappings.length,
    });

    return processedRawData;
  }, [
    loading,
    error,
    supplyChainsData,
    clustersData,
    productsData,
    mappingsData,
  ]);

  // Generate tangle data when group selection changes
  useEffect(() => {
    if (!processedData) return;

    try {
      const selection = selectedGroup;
      let hierarchicalData: TangleNodeInput[][];

      // Check if this is a special selection (starts with "special-")
      if (selection.startsWith("special-")) {
        const selectionType = selection.replace("special-", "") as
          | "first-half"
          | "second-half"
          | "all-clusters";
        hierarchicalData = generateSpecialClusterData(
          processedData,
          selectionType,
        );
        console.log(`Generated data for special selection ${selectionType}:`, {
          levels: hierarchicalData.length,
          totalNodes: hierarchicalData.reduce(
            (sum, level) => sum + level.length,
            0,
          ),
        });
      } else {
        // Regular group selection
        const groupIndex = parseInt(selection);
        hierarchicalData = generateClusterGroupData(processedData, groupIndex);
        console.log(`Generated data for group ${groupIndex}:`, {
          levels: hierarchicalData.length,
          totalNodes: hierarchicalData.reduce(
            (sum, level) => sum + level.length,
            0,
          ),
        });
      }

      setTangleData(hierarchicalData);
    } catch (err) {
      console.error("Error generating data:", err);
      setTangleData([]);
    }
  }, [processedData, selectedGroup]);

  const handleGroupChange = (event: SelectChangeEvent<string>) => {
    setSelectedGroup(event.target.value);
  };

  // Combine regular groups and special selections for the dropdown
  const groupOptions = [
    ...clusterGroups.map((group, index) => ({
      value: index.toString(),
      label: group.name,
      description: group.description,
      type: "group" as const,
    })),
    ...specialSelections.map((selection) => ({
      value: `special-${selection.type}`,
      label: selection.name,
      description: selection.description,
      type: "special" as const,
    })),
  ];

  const selectedGroupData = groupOptions.find(
    (opt) => opt.value === selectedGroup,
  );

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <FullWidthContent>
          <PageContainer>
            <ControlsContainer>
              <Typography variant="h6" gutterBottom>
                Loading data from GraphQL API...
              </Typography>
            </ControlsContainer>
          </PageContainer>
        </FullWidthContent>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <FullWidthContent>
          <PageContainer>
            <ControlsContainer>
              <Typography variant="h6" color="error" gutterBottom>
                Error loading data: {error.message}
              </Typography>
            </ControlsContainer>
          </PageContainer>
        </FullWidthContent>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <FullWidthContent>
        <PageContainer>
          <ControlsContainer>
            <Typography variant="h6" gutterBottom>
              Green Growth Value Chains Explorer
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              Explore hierarchical relationships in green growth value chains
              using the tangle tree layout. Select different cluster groups to
              see complex many-to-many relationships between supply chains,
              clusters, and products.
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="group-select-label">Cluster Selection</InputLabel>
              <Select
                labelId="group-select-label"
                id="group-select"
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
                    key={index.toString()}
                    value={index.toString()}
                    sx={{ pl: 3 }}
                  >
                    {group.name}
                  </MenuItem>
                ))}

                {/* Special selections */}
                <MenuItem
                  disabled
                  sx={{ fontWeight: "bold", color: "primary.main", mt: 1 }}
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

            {processedData && (
              <StatsContainer>
                <StatsText>API Data Overview</StatsText>
                <StatsText>
                  {processedData.supplyChains.length} supply chains •{" "}
                  {processedData.clusters.length} clusters •{" "}
                  {processedData.products.length} products •{" "}
                  {processedData.mappings.length} mappings
                </StatsText>
                {selectedGroupData?.type === "special" && (
                  <StatsText style={{ marginTop: "8px", fontStyle: "italic" }}>
                    {selectedGroup === "special-first-half" &&
                      `Showing first ${Math.ceil(processedData.clusters.length / 2)} clusters`}
                    {selectedGroup === "special-second-half" &&
                      `Showing last ${Math.floor(processedData.clusters.length / 2)} clusters`}
                    {selectedGroup === "special-all-clusters" &&
                      `Showing all ${processedData.clusters.length} clusters`}
                  </StatsText>
                )}
              </StatsContainer>
            )}
          </ControlsContainer>
        </PageContainer>
      </FullWidthContent>

      {tangleData.length > 0 && selectedGroupData && (
        <TangleTree
          data={tangleData}
          title={selectedGroupData.label}
          subtitle={selectedGroupData.description}
          width={1200}
          clusterYOffset={-45}
        />
      )}
    </ThemeProvider>
  );
};

export default TangleTreeExperiment;
