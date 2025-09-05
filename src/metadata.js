const Routes = {
  Landing: "/",
  About: "/about",
  Community: "/community",
  AlbaniaTool: "/albania-tool",
  AlbaniaStory: "/accelerating-growth-in-albania",
  JordanTool: "/jordan-tool",
  JordanOverview: "/jordan-project-overview",
  BestOf2020: "/best-of-2020",
  BestOf2021: "/best-of-2021",
  BestOf2022: "/best-of-2022",
  BestOf2024: "/best-of-2024",
  NamibiaTool: "/namibia-tool",
  CustomProductSpace: "/custom-product-space",
  CustomIndustrySpace: "/custom-industry-space",
  PortEcosystemsStory: "/port-ecosystems",
  NamibiaWalvisBay: "/namibia-walvis-bay",
  GreenGrowth: "/greenplexity",
  // Green Growth sub-routes
  GreenGrowthIntroduction: "/greenplexity/introduction",
  GreenGrowthOverview: "/greenplexity/overview",
  GreenGrowthAdvantage: "/greenplexity/competitive-advantage",
  GreenGrowthValueChains: "/greenplexity/value-chains",
  GreenGrowthClusters: "/greenplexity/clusters",
  GreenGrowthCompetitiveness: "/greenplexity/competitiveness",
  GreenGrowthOpportunities: "/greenplexity/opportunities",
  GreenGrowthStrategicPosition: "/greenplexity/strategic-position",
  GreenGrowthDimensions: "/greenplexity/dimensions",
  GreenGrowthExplore: "/greenplexity/explore",
  // Experimental routes (no links)
  GreenEciBumpChart: "/experimental/green-eci-bump-chart",
  TangleTreeExperiment: "/experimental",
  SugiyamaDAGExperiment: "/experimental/sugiyama-dag",
  TreeGrowthExperiment: "/experimental/tree-growth",
  CirclePackMapExperiment: "/experimental/circle-pack-map",
  ClusterTreeExperiment: "/experimental/cluster-tree",
  ProductSpaceClusterBoundaries:
    "/experimental/product-space-cluster-boundaries",
};

const defaultTitle = "The Growth Lab at Harvard Kennedy School";
const defaultDescription =
  "Translating Growth Lab research into powerful online tools and interactive storytelling";
const defaultOgImage = "default.png";
const defaultFavicon = "/favicon.svg";

const metadata = [
  {
    url: Routes.Landing,
    title: "Harvard Growth Lab Viz Hub | " + defaultTitle,
    description: defaultDescription,
    og_image: "growth-lab-hub.jpg",
    favicon: defaultFavicon,
  },
  {
    url: Routes.About,
    title: "About | " + defaultTitle,
    description: defaultDescription,
    og_image: "growth-lab-hub.jpg",
    favicon: defaultFavicon,
  },
  {
    url: Routes.Community,
    title: "Community | " + defaultTitle,
    description: defaultDescription,
    og_image: "growth-lab-hub.jpg",
    favicon: defaultFavicon,
  },
  {
    url: Routes.AlbaniaTool,
    title: "Albania's Industry Targeting Dashboard | " + defaultTitle,
    description: "View data visualizations for Albania's industries.",
    og_image: "albania-dashboard-card-background.jpg",
    favicon: defaultFavicon,
  },
  {
    url: Routes.AlbaniaStory,
    title:
      "Can Albania's Economic Turnaround Survive COVID-19? A Growth Diagnostic Update | " +
      defaultTitle,
    description:
      "This brief analysis takes stock of Albania's economic growth prior to the COVID-19 crisis and what the strengths and weaknesses of the pre-COVID economy imply for recovery and the possibility of accelerating long-term and inclusive growth in the years to come. Albania is a place where much has been achieved to expand opportunity and well-being as growth has gradually accelerated since 2013-14, but where much remains to be done to continue this acceleration once the immediate crisis of COVID-19 has passed.",
    og_image: "albania-story-card-background.jpg",
    favicon: defaultFavicon,
  },
  {
    url: Routes.JordanTool,
    title:
      "A Roadmap for Export Diversification: Jordan's Complexity Profile | " +
      defaultTitle,
    description:
      "This tool displays the results of the complexity analysis developed for Jordan by the Growth Lab at Harvard University.",
    og_image: "jordan-tool-background.png",
    favicon: defaultFavicon,
  },
  {
    url: Routes.JordanOverview,
    title:
      "A Roadmap for Export Diversification: Jordan's Complexity Profile | " +
      defaultTitle,
    description:
      "This tool displays the results of the complexity analysis developed for Jordan by the Growth Lab at Harvard University.",
    og_image: "jordan-tool-background.png",
    favicon: defaultFavicon,
  },
  {
    url: Routes.BestOf2020,
    title: "15 Visual Insights from the Growth Lab in 2020 | " + defaultTitle,
    description:
      "2020's most notable visual insights from faculty, fellows, researchers and staff at Harvard's Growth Lab.",
    og_image: "best-of-2020-share-image.jpg",
    favicon: defaultFavicon,
  },
  {
    url: Routes.BestOf2021,
    title:
      "Visual Insights from the Growth Lab's 2021 Research | " + defaultTitle,
    description:
      "2021's most notable visual insights from faculty, fellows, researchers and staff at Harvard's Growth Lab.",
    og_image: "best-of-2021-share-image.jpg",
    favicon: defaultFavicon,
  },
  {
    url: Routes.BestOf2022,
    title:
      "Visual Insights from the Growth Lab's 2022 Research | " + defaultTitle,
    description:
      "2022's most notable visual insights from faculty, fellows, researchers and staff at Harvard's Growth Lab.",
    og_image: "best-of-2022-card-background-lo.jpg",
    favicon: defaultFavicon,
  },
  {
    url: Routes.BestOf2024,
    title:
      "Visual Insights from the Growth Lab's 2024 Research | " + defaultTitle,
    description:
      "2024's most notable visual insights from faculty, fellows, researchers and staff at Harvard's Growth Lab.",
    og_image: "best-of-2024-share-image.png",
    favicon: defaultFavicon,
  },
  {
    url: Routes.NamibiaTool,
    title: "Namibia's Industry Targeting Dashboard | " + defaultTitle,
    description: "View data visualizations for Namibia's industries.",
    og_image: defaultOgImage,
    favicon: defaultFavicon,
  },
  {
    url: Routes.PortEcosystemsStory,
    title:
      "Harboring Opportunity: The Industrial Ecosystems of Port Cities | " +
      defaultTitle,
    description:
      "Commercial ports are crucial to the world economy in driving trade and globalization, but they also play a strong role in shaping their local economies. In this analysis, we investigate the industrial composition of port cities and the types of activities that tend to concentrate more heavily near ports. We assess which of these activities are closely linked to port operations, which of these activities simply occur more frequently in port cities. The analysis suggests ways that these insights can be useful to policymakers seeking to develop and diversify port cities.",
    og_image: "harboring-opportunity-background-lo.jpg",
    favicon: defaultFavicon,
  },
  {
    url: Routes.NamibiaWalvisBay,
    title:
      "Port Resiliency in the Face of Global Shocks: The Case of Walvis Bay in Namibia | " +
      defaultTitle,
    description:
      "The article explores the economic resilience of ports in the face of global shocks, with particular focus on the port of Walvis Bay, Namibia. Walvis Bay faces challenges in attracting volume due to its relative unconnectedness to population centers in Africa, but it experienced a fourteen-fold increase in containerized cargo volumes during the global commodity super-cycle. This was due to its efficient operations and relative competitiveness. However, containerized traffic plummet at the end of the cycle and volumes have struggled to recover since. The article  discusses the potential opportunities for growth in the future by capitalizing on global developments in clean energy technologies and the closeness to mining operations in the region, whereby Walvis Bay can serve as a regional logistics hub for exports.",
    og_image: "namibia-walvis-bay-background-lo.jpg",
    favicon: defaultFavicon,
  },
  {
    url: Routes.GreenGrowth,
    title: "Greenplexity | " + defaultTitle,
    description:
      "Identify green growth opportunities to generate prosperity by supplying what the world needs to decarbonize.",
    og_image: "greenplexity-card-background-lo.jpg",
    favicon: defaultFavicon,
  },
  {
    url: Routes.GreenGrowthIntroduction,
    title: "Introduction to Green Value Chains | " + defaultTitle,
    description:
      "An animated introduction to green value chains hierarchy, showing how different components build upon each other from raw materials to final products in the green economy.",
    og_image: "greenplexity-card-background-lo.jpg",
    favicon: defaultFavicon,
  },
  {
    url: Routes.ClusterTreeExperiment,
    title: "Cluster Tree Explorer | " + defaultTitle,
    description:
      "Explore manufacturing clusters and their hierarchical relationships with supply chains and products",
    og_image: defaultOgImage,
    favicon: defaultFavicon,
  },
  {
    url: Routes.ProductSpaceClusterBoundaries,
    title: "Product Space with Cluster Boundaries | " + defaultTitle,
    description:
      "Visualize the product space for a given country and year with boundaries drawn around products based on their clusters from the Green Growth taxonomy",
    og_image: defaultOgImage,
    favicon: defaultFavicon,
  },
];

const get = (route) => {
  const data = metadata.find(({ url }) => url === route);
  if (data) {
    return data;
  } else {
    return {
      url: route,
      title: "Harvard Growth Lab Viz Hub | " + defaultTitle,
      description: defaultDescription,
      og_image: defaultOgImage,
      favicon: defaultFavicon,
    };
  }
};

module.exports = {
  metadata,
  Routes,
  get,
};
