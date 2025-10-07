import {
  ProductClusterRow,
  CountryProductData,
  CountryClusterData,
  TreeHierarchy,
  HierarchyNodeData,
  HierarchyLinkData,
  TreeNode,
} from "./types";
import { getValueChainColor } from "./constants";

// Canonical display order for value chains (0-9 for consistent sorting)
const valueChainNameToSortOrder: Record<string, number> = {
  "Electric Vehicles": 0,
  "Heat Pumps": 1,
  "Fuel Cells And Green Hydrogen": 2,
  "Wind Power": 3,
  "Solar Power": 4,
  "Hydroelectric Power": 5,
  "Nuclear Power": 6,
  Batteries: 7,
  "Electric Grid": 8,
  "Critical Metals and Minerals": 9,
};

// Function to build hierarchical data with value chain coloring and RCA opacity
export function buildHierarchicalData(
  rows: ProductClusterRow[],
  countryData?: {
    clusterData: CountryClusterData[];
    productData: CountryProductData[];
  },
): TreeHierarchy {
  // Extract unique value chains and clusters
  const valueChains = Array.from(new Set(rows.map((r) => r.supply_chain)));
  const clusters = Array.from(new Set(rows.map((r) => r.cluster_name)));

  // Sort value chains by their supply chain ID for consistent ordering
  valueChains.sort((a, b) => {
    const idA = valueChainNameToSortOrder[a] ?? 999; // Unknown chains go to end
    const idB = valueChainNameToSortOrder[b] ?? 999;
    return idA - idB;
  });

  // Calculate average RCA for each cluster when country data is available
  const clusterRcaMap = new Map<string, number>();
  if (countryData && countryData.productData.length > 0) {
    // Create a map from product ID to cluster name
    const productToCluster = new Map<number, string>();
    for (const row of rows) {
      productToCluster.set(row.product_id, row.cluster_name);
    }

    // Group products by cluster
    const productsByCluster = new Map<string, CountryProductData[]>();
    for (const product of countryData.productData) {
      const cluster = productToCluster.get(product.productId);
      if (cluster) {
        if (!productsByCluster.has(cluster)) {
          productsByCluster.set(cluster, []);
        }
        productsByCluster.get(cluster)?.push(product);
      }
    }

    // Calculate average RCA per cluster
    for (const [cluster, products] of Array.from(productsByCluster.entries())) {
      if (products.length > 0) {
        const avgRca =
          products.reduce(
            (sum: number, p: CountryProductData) => sum + p.exportRca,
            0,
          ) / products.length;
        clusterRcaMap.set(cluster, avgRca);
      }
    }
  }

  // Calculate average RCA for each value chain
  const valueChainRcaMap = new Map<string, number>();
  if (countryData && countryData.productData.length > 0) {
    // Create a map from product ID to value chain
    const productToValueChain = new Map<number, string>();
    for (const row of rows) {
      productToValueChain.set(row.product_id, row.supply_chain);
    }

    // Group products by value chain
    const productsByValueChain = new Map<string, CountryProductData[]>();
    for (const product of countryData.productData) {
      const valueChain = productToValueChain.get(product.productId);
      if (valueChain) {
        if (!productsByValueChain.has(valueChain)) {
          productsByValueChain.set(valueChain, []);
        }
        productsByValueChain.get(valueChain)?.push(product);
      }
    }

    // Calculate average RCA per value chain
    for (const [valueChain, products] of Array.from(
      productsByValueChain.entries(),
    )) {
      if (products.length > 0) {
        const avgRca =
          products.reduce(
            (sum: number, p: CountryProductData) => sum + p.exportRca,
            0,
          ) / products.length;
        valueChainRcaMap.set(valueChain, avgRca);
      }
    }
  }

  // Create nodes - value chains use consistent colors, everything else is grey
  const nodes: HierarchyNodeData[] = [
    ...valueChains.map((name) => {
      // Value chains use the consistent color mapping to match bubbles layout
      const color = getValueChainColor(name);

      return {
        id: name,
        name,
        type: "value_chain" as const,
        color,
        visible: true,
        // Store RCA for opacity calculation later if needed
        rca: valueChainRcaMap.get(name) || 0,
      };
    }),
    ...clusters.map((name) => {
      // Clusters are always grey in the main view
      const color = "#333333";

      return {
        id: name,
        name,
        type: "manufacturing_cluster" as const,
        color,
        visible: true,
        // Store RCA for opacity calculation later if needed
        rca: clusterRcaMap.get(name) || 0,
      };
    }),
  ];

  // Create links from value chains to Industrial clusters
  const links: HierarchyLinkData[] = [];

  // Process value chain to cluster connections
  for (const vc of valueChains) {
    const clustersForVC = Array.from(
      new Set(
        rows.filter((r) => r.supply_chain === vc).map((r) => r.cluster_name),
      ),
    );
    for (const cl of clustersForVC) {
      const linkValue = 1; // Default value

      // Get node references for source and target
      const vcNode = nodes.find((n) => n.id === vc);

      // First-level links (value chain to cluster) inherit value chain color
      const linkColor = vcNode?.color || getValueChainColor(vc);

      // Get RCA for the link (use target cluster's RCA)
      const linkRca = clusterRcaMap.get(cl) || 0;

      links.push({
        id: `vc-${vc}-cl-${cl}`,
        source: vc,
        target: cl,
        value: linkValue,
        color: linkColor,
        visible: true,
        rca: linkRca,
      });
    }
  }

  // Add products nodes (initially invisible)
  for (const cluster of clusters) {
    const clusterProducts = rows
      .filter((r) => r.cluster_name === cluster)
      .map((r) => ({
        id: r.product_id.toString(),
        name: r.name_short_en,
        productId: r.product_id.toString(),
        supply_chain: r.supply_chain,
      }));

    // Get unique products by id
    const uniqueProducts = Array.from(
      new Map(clusterProducts.map((item) => [item.id, item])).values(),
    );

    // Add products to nodes array
    for (const product of uniqueProducts) {
      if (!nodes.find((n) => n.id === product.id)) {
        // Products are always grey
        const productColor = "#808080";
        let productRca = 0;

        // If country data is available, get RCA for opacity calculation
        if (countryData && countryData.productData.length > 0) {
          const productCountryData = countryData.productData.find(
            (pd) => pd.productId.toString() === product.id,
          );

          if (productCountryData) {
            productRca = productCountryData.exportRca;
          }
        }

        nodes.push({
          id: product.id,
          name: product.name,
          type: "product",
          color: productColor,
          visible: false, // Initially hidden
          rca: productRca,
        });

        // Add link from cluster to product
        let linkValue = 2; // Default value

        if (countryData && countryData.productData.length > 0) {
          const productCountryData = countryData.productData.find(
            (pd) => pd.productId.toString() === product.id,
          );

          if (productCountryData) {
            linkValue = Math.max(productCountryData.exportRca, 0.2) * 2;
          }
        }

        // Second-level links (cluster to product) are grey
        // Include the value chain this product belongs to (for filtering on focus)
        links.push({
          id: `cl-${cluster}-pr-${product.id}`,
          source: cluster,
          target: product.id,
          value: linkValue,
          color: "#808080", // Grey links for cluster to product
          visible: false, // Initially hidden
          rca: productRca,
          supplyChains: [product.supply_chain],
        });
      }
    }
  }

  return { nodes, links };
}

// Function to filter hierarchy based on RCA threshold for products
export function filterHierarchyByProductRCA(
  hierarchy: TreeHierarchy,
  countryData?: {
    clusterData: CountryClusterData[];
    productData: CountryProductData[];
  },
  rcaThreshold: number = 0,
  coloringMode: string = "Global",
): TreeHierarchy {
  // If not in Country Specific mode or no threshold, return original hierarchy
  if (
    coloringMode !== "Country Specific" ||
    rcaThreshold <= 0 ||
    !countryData?.productData
  ) {
    return hierarchy;
  }

  // Get products that meet the RCA threshold
  const validProductIds = new Set(
    countryData.productData
      .filter((p) => p.exportRca >= rcaThreshold)
      .map((p) => p.productId.toString()),
  );

  // Get clusters that contain at least one valid product
  const validClusterIds = new Set<string>();
  const validValueChainIds = new Set<string>();

  // Find clusters that have valid products
  hierarchy.links.forEach((link) => {
    if (link.target && validProductIds.has(link.target)) {
      // This is a cluster->product link, so the source is the cluster
      validClusterIds.add(link.source);
    }
  });

  // Find value chains that connect to valid clusters
  hierarchy.links.forEach((link) => {
    if (validClusterIds.has(link.target)) {
      // This is a value_chain->cluster link, so the source is the value chain
      validValueChainIds.add(link.source);
    }
  });

  // Filter nodes to only include those that are valid or contain valid children
  const filteredNodes = hierarchy.nodes.filter((node) => {
    if (node.type === "product") {
      return validProductIds.has(node.id);
    } else if (node.type === "manufacturing_cluster") {
      return validClusterIds.has(node.id);
    } else if (node.type === "value_chain") {
      return validValueChainIds.has(node.id);
    }
    return false;
  });

  // Filter links to only include those between valid nodes
  const validNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredLinks = hierarchy.links.filter(
    (link) => validNodeIds.has(link.source) && validNodeIds.has(link.target),
  );

  return {
    nodes: filteredNodes,
    links: filteredLinks,
  };
}

// Function to build a tree structure when focusing on a value chain
export function buildTreeDataForValueChain(
  hierarchyData: TreeHierarchy | null,
  valueChainId: string,
): TreeNode | null {
  if (!hierarchyData) return null;

  // Get the value chain node
  const valueChainNode = hierarchyData.nodes.find((n) => n.id === valueChainId);
  if (!valueChainNode) return null;

  // Find all visible clusters connected to this value chain
  const connectedClusterIds = hierarchyData.links
    .filter((l) => l.source === valueChainId && l.visible)
    .map((l) => l.target);

  // Get the cluster nodes
  const clusterNodes = hierarchyData.nodes.filter(
    (n) => connectedClusterIds.includes(n.id) && n.visible,
  );

  // For each cluster, find connected product nodes
  const treeRoot: TreeNode = {
    name: valueChainNode.name,
    id: valueChainNode.id,
    type: valueChainNode.type,
    color: valueChainNode.color,
    children: clusterNodes.map((cluster) => {
      // Find products connected to this cluster
      const connectedProductIds = hierarchyData.links
        .filter((l) => {
          if (l.source !== cluster.id || !l.visible) return false;
          // Only include cluster->product links that belong to the selected value chain
          // supplyChains may be undefined for older data; in that case include by default
          if (!l.supplyChains || l.supplyChains.length === 0) return true;
          return l.supplyChains.includes(valueChainNode.name);
        })
        .map((l) => l.target);

      // Get product nodes
      const productNodes = hierarchyData.nodes.filter(
        (n) => connectedProductIds.includes(n.id) && n.visible,
      );

      // Return cluster with its products as children
      return {
        name: cluster.name,
        id: cluster.id,
        type: cluster.type,
        color: cluster.color,
        children: productNodes.map((product) => {
          return {
            name: product.name,
            id: product.id,
            type: product.type,
            color: product.color,
          };
        }),
      };
    }),
  };

  return treeRoot;
}
