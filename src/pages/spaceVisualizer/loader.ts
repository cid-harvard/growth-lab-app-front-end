import * as d3 from "d3";

// Updated interfaces for default dataset
export interface Node {
  product_hs92_code: string;
  product_space_x: number;
  product_space_y: number;
  product_space_cluster_name: string;
  color?: string;
  [key: string]: string | number | undefined;
}

export interface Link {
  product_hs92_code_source: string;
  product_hs92_code_target: string;
  [key: string]: string | number | undefined;
}

export interface MetaData {
  [key: string]: string | number | undefined;
  product_id?: string;
  product_hs92_code?: string;
  year?: string;
  export_value?: number;
  import_value?: number;
  pci?: number;
  name?: string;
  color?: string;
}

// Predefined metadata for default dataset
const defaultMetadata = [
  {
    cluster_name: "Agriculture",
    cluster_name_short: "Agricultural Goods",
    cluster_col: "#EAC218",
  },
  {
    cluster_name: "Construction, Building, and Home Supplies",
    cluster_name_short: "Construction Goods",
    cluster_col: "#D1852A",
  },
  {
    cluster_name: "Electronic and Electrical Goods",
    cluster_name_short: "Electronics",
    cluster_col: "#52E2DE",
  },
  {
    cluster_name: "Industrial Chemicals and Metals",
    cluster_name_short: "Chemicals and Basic Metals",
    cluster_col: "#A42DE2",
  },
  {
    cluster_name: "Metalworking and Electrical Machinery and Parts",
    cluster_name_short: "Metalworking and Machinery",
    cluster_col: "#C64646",
  },
  {
    cluster_name: "Minerals",
    cluster_name_short: "Minerals",
    cluster_col: "#7C6760",
  },
  {
    cluster_name: "Textile and Home Goods",
    cluster_name_short: "Textile and Home Goods",
    cluster_col: "#757777",
  },
  {
    cluster_name: "Textile Apparel and Accessories",
    cluster_name_short: "Apparel",
    cluster_col: "#36B250",
  },
];

export interface LoaderData {
  nodes: Node[];
  links: Link[];
  metadata: MetaData[];
  defaultMetadata?: typeof defaultMetadata;
  categoryMetaMap?: Record<string, { color: string }>;
}

const datasetSources = {
  product: {
    nodes: "https://dataverse.harvard.edu/api/access/datafile/11037601",
    links: "https://dataverse.harvard.edu/api/access/datafile/11037602",
    metadata: "https://dataverse.harvard.edu/api/access/datafile/11064008",
  },
  industry: {
    nodes: "https://dataverse.harvard.edu/api/access/datafile/11037601",
    links: "https://dataverse.harvard.edu/api/access/datafile/11037602",
    metadata: "https://dataverse.harvard.edu/api/access/datafile/11064008",
  },
  technology: {
    nodes: "https://dataverse.harvard.edu/api/access/datafile/11037601",
    links: "https://dataverse.harvard.edu/api/access/datafile/11037602",
    metadata: "https://dataverse.harvard.edu/api/access/datafile/11064008",
  },
};

export type DatasetKey = keyof typeof datasetSources;

export async function loader({
  request,
}: {
  request: Request;
}): Promise<LoaderData> {
  try {
    const url = new URL(request.url);
    const datasetKey = url.searchParams.get("dataset") as DatasetKey;
    const isCustom = url.searchParams.get("custom") === "true";
    const isRemote = url.searchParams.get("remote") === "true";

    if (!datasetKey && !isCustom && !isRemote) {
      throw new Error("No dataset specified");
    }

    if (isRemote) {
      const nodesUrl = url.searchParams.get("nodesUrl");
      const linksUrl = url.searchParams.get("linksUrl");
      const metaUrl =
        url.searchParams.get("metaUrl") || url.searchParams.get("metadataUrl");

      if (!nodesUrl || !linksUrl) {
        throw new Error("Nodes and links URLs are required");
      }

      const [nodesResponse, linksResponse, metadataResponse] =
        await Promise.all([
          fetch(decodeURIComponent(nodesUrl)),
          fetch(decodeURIComponent(linksUrl)),
          metaUrl ? fetch(decodeURIComponent(metaUrl)) : Promise.resolve(null),
        ]);

      if (
        !nodesResponse.ok ||
        !linksResponse.ok ||
        (metaUrl && !metadataResponse?.ok)
      ) {
        throw new Error("Failed to fetch remote dataset files");
      }

      const [nodesText, linksText, metadataText] = await Promise.all([
        nodesResponse.text(),
        linksResponse.text(),
        metaUrl ? metadataResponse?.text() : Promise.resolve(null),
      ]);

      const nodes = d3.csvParse(nodesText) as any[];

      const links = d3.csvParse(linksText).map((d) => ({
        ...d,
      })) as any[];

      // Handle optional metadata for remote URLs
      let metadata: MetaData[] = [];
      if (metadataText) {
        try {
          metadata = d3.csvParse(metadataText) as MetaData[];
          console.log("Loaded remote metadata:", metadata);
        } catch (error) {
          console.error("Failed to parse remote metadata:", error);
          // Continue with empty metadata rather than failing
        }
      }

      return { nodes, links, metadata };
    }

    if (isCustom) {
      // Get the uploaded files from localStorage
      const nodesText = localStorage.getItem("custom_nodes");
      const linksText = localStorage.getItem("custom_links");
      const metadataText = localStorage.getItem("custom_meta");

      if (!nodesText || !linksText) {
        throw new Error("Nodes and links files are required");
      }

      const nodes = d3.csvParse(nodesText) as any[];

      const links = d3.csvParse(linksText).map((d) => ({
        ...d,
      })) as any[];

      // Handle optional metadata
      let metadata: MetaData[] = [];
      if (metadataText) {
        try {
          metadata = d3.csvParse(metadataText) as MetaData[];
          console.log("Loaded custom metadata:", metadata);
        } catch (error) {
          console.error("Failed to parse metadata:", error);
          // Continue with empty metadata rather than failing
        }
      }

      return { nodes, links, metadata };
    }

    // For default dataset, use the predefined metadata
    const source = datasetSources[datasetKey];
    if (!source) {
      throw new Error(`Invalid dataset key: ${datasetKey}`);
    }

    const [nodesResponse, linksResponse, metadataResponse] = await Promise.all([
      fetch(source.nodes),
      fetch(source.links),
      fetch(source.metadata),
    ]);

    if (!nodesResponse.ok || !linksResponse.ok || !metadataResponse.ok) {
      throw new Error("Failed to fetch dataset files");
    }

    const [nodesText, linksText, metadataText] = await Promise.all([
      nodesResponse.text(),
      linksResponse.text(),
      metadataResponse.text(),
    ]);

    // Parse metadata and build a lookup by product_hs92_code
    const rawMetadata = d3.csvParse(metadataText);
    const metadata: MetaData[] = rawMetadata.map((d) => ({
      product_id: d.product_id,
      product_hs92_code: d.product_hs92_code,
      year: d.year,
      export_value: Number.parseFloat(d.export_value),
      import_value: Number.parseFloat(d.import_value),
      pci: Number.parseFloat(d.pci),
    }));
    const exportValueByHs92: Record<string, number> = {};
    for (const m of metadata) {
      if (m.product_hs92_code) {
        exportValueByHs92[m.product_hs92_code] = m.export_value ?? 0;
      }
    }

    // Parse nodes and attach export_value from metadata
    const rawNodes = d3.csvParse(nodesText);
    const nodes: Node[] = rawNodes.map((d) => ({
      product_hs92_code: d.product_hs92_code,
      product_space_x: Number.parseFloat(d.product_space_x),
      product_space_y: Number.parseFloat(d.product_space_y),
      product_space_cluster_name: d.product_space_cluster_name,
      export_value: exportValueByHs92[d.product_hs92_code] ?? 0,
    }));

    // Parse links and map to required fields
    const rawLinks = d3.csvParse(linksText);
    const links: Link[] = rawLinks.map((d) => ({
      product_hs92_code_source: d.product_hs92_code_source || d.source,
      product_hs92_code_target: d.product_hs92_code_target || d.target,
    }));

    // Assign colors to clusters using d3.schemeCategory10
    const clusters = Array.from(
      new Set(nodes.map((n) => n.product_space_cluster_name)),
    );
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(clusters);
    const categoryMetaMap: Record<string, { color: string }> = {};
    for (const cluster of clusters) {
      categoryMetaMap[cluster] = { color: colorScale(cluster) };
    }

    // Attach color to each node
    for (const node of nodes) {
      node.color = categoryMetaMap[node.product_space_cluster_name]?.color;
    }

    return {
      nodes,
      links,
      metadata,
      defaultMetadata,
      categoryMetaMap,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error loading data:", error);
    throw new Response("Failed to load visualization data", { status: 500 });
  }
}
