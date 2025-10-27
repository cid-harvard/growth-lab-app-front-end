// Strategic position descriptions now come from CSV-preferred text

export type GGTermKey =
  | "feasibility"
  | "attractiveness"
  | "worldAverageExport"
  | "economicCompetitiveness"
  | "rca"
  | "clusterMarketShare"
  | "clusterRca"
  | "productComplexity"
  | "opportunityGain"
  | "expectedExportValue"
  | "greenValueChain"
  | "globalMarketGrowth"
  | "globalMarketSize"
  | "greenIndustrialClusters"
  | "strategicPositionTopRight"
  | "strategicPositionTopLeft"
  | "strategicPositionBottomRight"
  | "strategicPositionBottomLeft";

export interface GGTermDefinition {
  key: GGTermKey;
  title: string;
  description: string;
  addToGlossary?: boolean;
}

export const GG_TERMS: Record<GGTermKey, GGTermDefinition> = {
  feasibility: {
    key: "feasibility",
    title: "Feasibility",
    description:
      "Measures the share of capabilities, skills, and know-how present in a location that is necessary to jumpstart a specific activity",
    addToGlossary: true,
  },
  attractiveness: {
    key: "attractiveness",
    title: "Attractiveness",
    description:
      "Measures how valuable a product is based on the capabilities it will help a location develop",
    addToGlossary: true,
  },
  worldAverageExport: {
    key: "worldAverageExport",
    title: "World Average (RCA = 1)",
    description:
      "The world average of exports here indicates the level of exports a country would have if it exported goods in the same proportion as its overall share of global trade. This is calculated using an RCA (Revealed Comparative Advantage) index value of 1, also known as the Balassa index.",
    addToGlossary: false,
  },
  economicCompetitiveness: {
    key: "economicCompetitiveness",
    title: "Economic Competitiveness",
    description:
      'A measure of how effectively a country exports a product. If a country exports more than its "fair share", meaning its share of world exports for that product is greater than the product\'s overall share in global trade (RCA > 1), it is considered economically competitive in that product.',
    addToGlossary: true,
  },
  rca: {
    key: "rca",
    title: "RCA (Revealed Comparative Advantage)",
    description:
      'A measure of whether a country is an effective exporter of a product, based on the relative advantage or disadvantage it has in the export of a certain good. A country is an effective exporter of a product if it exports more than its "fair share" or a share that is at least equal to the share of total world trade that the product represents (RCA > 1).',
    addToGlossary: true,
  },
  clusterMarketShare: {
    key: "clusterMarketShare",
    title: "Cluster Market Share",
    description:
      "For a country, the country's share of the global export market for the products that make up that cluster.",
    addToGlossary: true,
  },
  clusterRca: {
    key: "clusterRca",
    title: "Cluster RCA (Revealed Comparative Advantage)",
    description:
      'A measure of whether a country is an effective exporter of a cluster of products, based on the relative advantage or disadvantage it has in the export of that set of products. A country is an effective exporter of a cluster of product if it exports more than its "fair share" or a share that is at least equal to the share of total world trade that the cluster of products represents (RCA > 1).',
    addToGlossary: true,
  },
  productComplexity: {
    key: "productComplexity",
    title: "Product Complexity",
    description:
      "Measures the amount of diversity of knowhow required to make a product.",
    addToGlossary: true,
  },
  opportunityGain: {
    key: "opportunityGain",
    title: "Opportunity Gain",
    description:
      "Measures opportunities for future diversification in entering a product, by opening new links to complex products",
    addToGlossary: true,
  },
  expectedExportValue: {
    key: "expectedExportValue",
    title: "Expected Value",
    description:
      "The expected value of a country's exports in an industry, based on the its share of global trade, productive capabilities and its market access.",
    addToGlossary: true,
  },
  greenValueChain: {
    key: "greenValueChain",
    title: "Green Value Chain",
    description:
      "The set of products, components and inputs for a clean energy technology or technological domain.",
    addToGlossary: true,
  },
  globalMarketGrowth: {
    key: "globalMarketGrowth",
    title: "Global Market Growth",
    description:
      "Measures the rate at which the total global market for this product is expanding or contracting over time, indicating trends in overall demand and market",
    addToGlossary: true,
  },
  globalMarketSize: {
    key: "globalMarketSize",
    title: "Global Market Size",
    description:
      "Measures the total global value of trade for this specific product, indicating the overall scale and economic importance of the market worldwide.",
    addToGlossary: true,
  },
  greenIndustrialClusters: {
    key: "greenIndustrialClusters",
    title: "Clusters",
    description:
      "A set of products in green value chains that draw on similar capabilities and are often produced together in a location.",
    addToGlossary: true,
  },
  strategicPositionTopRight: {
    key: "strategicPositionTopRight",
    title: "Strategic Position – Light Touch Approach",
    description:
      "Ample space to diversify calls for leveraging existing successes to enter more complex production.",
    addToGlossary: false,
  },
  strategicPositionTopLeft: {
    key: "strategicPositionTopLeft",
    title: "Strategic Position – Parsimonious Industrial Policy Approach",
    description:
      "Limited opportunities requires addressing bottlenecks, to help jump short distances, into related products.",
    addToGlossary: false,
  },
  strategicPositionBottomRight: {
    key: "strategicPositionBottomRight",
    title: "Strategic Position – Technological Frontier Approach",
    description:
      "Having exploited virtually all, major existing products, gains come from developing new products.",
    addToGlossary: false,
  },
  strategicPositionBottomLeft: {
    key: "strategicPositionBottomLeft",
    title: "Strategic Position – Strategic Bets Approach",
    description:
      "Few nearby opportunities call for coordinated long jumps into strategic areas with future diversification potential.",
    addToGlossary: false,
  },
};

// Default order for the glossary view
export const GG_GLOSSARY_ORDER: GGTermKey[] = [
  "feasibility",
  "attractiveness",
  "economicCompetitiveness",
  "rca",
  "clusterMarketShare",
  "clusterRca",
  "productComplexity",
  "opportunityGain",
  "expectedExportValue",
  "greenValueChain",
  "globalMarketGrowth",
  "globalMarketSize",
  "greenIndustrialClusters",
  "worldAverageExport",
  "strategicPositionTopRight",
  "strategicPositionTopLeft",
  "strategicPositionBottomRight",
  "strategicPositionBottomLeft",
];

export const GG_GLOSSARY_ENTRIES: GGTermDefinition[] = GG_GLOSSARY_ORDER.map(
  (k) => GG_TERMS[k],
);

export function getTerm(key: GGTermKey): GGTermDefinition {
  return GG_TERMS[key];
}
