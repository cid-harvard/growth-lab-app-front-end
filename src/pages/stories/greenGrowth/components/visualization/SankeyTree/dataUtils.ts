import {
  ProductClusterRow,
  CountryProductData,
  CountryClusterData,
  TreeHierarchy,
  HierarchyNodeData,
  HierarchyLinkData,
  TreeNode,
} from "./types";
import { valueChainColors, getColorFromRca } from "./constants";

// Function to build hierarchical data with RCA coloring
export function buildHierarchicalData(
  rows: ProductClusterRow[],
  countryData?: {
    clusterData: CountryClusterData[];
    productData: CountryProductData[];
  },
): TreeHierarchy {
  // Extract unique value chains, clusters, and products
  const valueChains = Array.from(new Set(rows.map((r) => r.supply_chain)));
  const clusters = Array.from(new Set(rows.map((r) => r.cluster_name)));

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

  // Create nodes for value chains and clusters
  const nodes: HierarchyNodeData[] = [
    ...valueChains.map((name) => {
      let color = valueChainColors[name] || "#ccc";

      // If country data is available, adjust color based on RCA
      if (countryData && countryData.productData.length > 0) {
        const rca = valueChainRcaMap.get(name) || 0;
        color = getColorFromRca(rca);
      }

      return {
        id: name,
        name,
        type: "value_chain" as const,
        color,
        visible: true,
      };
    }),
    ...clusters.map((name) => {
      let color = "#808080"; // Default color

      // If country data is available, color by RCA
      if (countryData && countryData.productData.length > 0) {
        const rca = clusterRcaMap.get(name) || 0;
        color = getColorFromRca(rca);
      }

      return {
        id: name,
        name,
        type: "manufacturing_cluster" as const,
        color,
        visible: true,
      };
    }),
  ];

  // Create links from value chains to manufacturing clusters
  const links: HierarchyLinkData[] = [];

  // Process value chain to cluster connections
  for (const vc of valueChains) {
    const clustersForVC = Array.from(
      new Set(
        rows.filter((r) => r.supply_chain === vc).map((r) => r.cluster_name),
      ),
    );
    for (const cl of clustersForVC) {
      let linkValue = 1; // Default value

      // Get node references for source and target
      const vcNode = nodes.find((n) => n.id === vc);
      const clNode = nodes.find((n) => n.id === cl);

      // When country is selected, links inherit color from target node
      const linkColor =
        countryData && countryData.productData.length > 0
          ? clNode?.color || vcNode?.color || "#ccc"
          : vcNode?.color || valueChainColors[vc] || "#ccc";

      links.push({
        id: `vc-${vc}-cl-${cl}`,
        source: vc,
        target: cl,
        value: linkValue,
        color: linkColor,
        visible: true,
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
      }));

    // Get unique products by id
    const uniqueProducts = Array.from(
      new Map(clusterProducts.map((item) => [item.id, item])).values(),
    );

    // Find the cluster node to get its color
    const clusterNode = nodes.find((n) => n.id === cluster);

    // Add products to nodes array
    for (const product of uniqueProducts) {
      if (!nodes.find((n) => n.id === product.id)) {
        let productColor = clusterNode?.color || "#808080";

        // If country data is available, color by normalized export RCA
        if (countryData && countryData.productData.length > 0) {
          const productCountryData = countryData.productData.find(
            (pd) => pd.productId.toString() === product.id,
          );

          if (productCountryData) {
            productColor = getColorFromRca(productCountryData.exportRca);
          }
        }

        nodes.push({
          id: product.id,
          name: product.name,
          type: "product",
          color: productColor,
          visible: false, // Initially hidden
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

        links.push({
          id: `cl-${cluster}-pd-${product.id}`,
          source: cluster,
          target: product.id,
          value: linkValue,
          color: clusterNode?.color || "#808080",
          visible: false, // Initially hidden
        });
      }
    }
  }

  return { nodes, links };
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
        .filter((l) => l.source === cluster.id && l.visible)
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
