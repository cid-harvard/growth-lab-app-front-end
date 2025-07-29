import React, { useState, useMemo, useEffect, useRef } from "react";
import { animated, useSpring, useSprings, config } from "@react-spring/web";
import { Box, Typography, IconButton } from "@mui/material";
import { PlayArrow, Pause, SkipNext, SkipPrevious } from "@mui/icons-material";
import { useGreenGrowthData } from "../../hooks/useGreenGrowthData";
import { getSupplyChainColor } from "../../utils";
import * as d3 from "d3";

// Type definitions
interface ChainData {
  id: number;
  name: string;
  color: string;
  initialPosition: { x: number; y: number };
  leftPosition: { x: number; y: number }; // Changed from topPosition to leftPosition
}

interface ClusterData {
  id: number;
  name: string;
  chains: number[];
}

interface ProductData {
  clusterId: number;
  products: Array<{
    id: number;
    code: string;
    name: string;
  }>;
}

interface ConnectionData {
  clusterId: number;
  clusterName: string;
  chains: number[];
}

interface AnimationData {
  chains: ChainData[];
  clusters: ClusterData[];
  products: ProductData[];
  connections: ConnectionData[];
}

// D3 Force simulation interfaces
interface ForceClusterNode extends d3.SimulationNodeDatum {
  id: string | number;
  name: string;
  color: string;
  products: Array<{
    id: number;
    code: string;
    name: string;
  }>;
  radius: number;
  originalX: number;
  originalY: number;
  parentX: number;
  parentY: number;
  isAnchor?: boolean; // To distinguish anchor nodes from cluster nodes
}

interface ForceLink extends d3.SimulationLinkDatum<ForceClusterNode> {
  source: string | number | ForceClusterNode;
  target: string | number | ForceClusterNode;
}

interface PackedProduct {
  data: {
    id: number;
    code: string;
    name: string;
  };
  x: number;
  y: number;
  r: number;
}

// Animation steps
const STEPS = [
  {
    id: "intro",
    title: "Green Value Chains Overview",
    description: "All value chains in the green economy ecosystem",
  },
  {
    id: "chains-to-top",
    title: "Value Chain Categories",
    description: "Value chains form the backbone of green technologies",
  },
  {
    id: "clusters-reveal",
    title: "Clusters Within Value Chains",
    description: "Each value chain contains multiple technology clusters",
  },
  {
    id: "products-reveal",
    title: "Products Within Clusters",
    description: "Clusters are composed of specific tradeable products",
  },
  {
    id: "cross-connections",
    title: "Cross-Chain Connections",
    description: "Some clusters appear across multiple value chains",
  },
  {
    id: "bubble-layout",
    title: "Bubble Visualization Preview",
    description: "How this data appears in our main visualization",
  },
];

interface AnimatedValueChainIntroProps {
  width?: number;
  height?: number;
  selectedCountry?: number;
  selectedYear?: number;
}

export const AnimatedValueChainIntro: React.FC<
  AnimatedValueChainIntroProps
> = ({
  width = 800,
  height = 600,
  selectedCountry = 1, // Default to a country with data
  selectedYear = 2021,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [focusedChain, setFocusedChain] = useState<number | null>(6);
  const [demonstrationChain, setDemonstrationChain] = useState<number | null>(
    null,
  );

  // Get data from shared hook
  const { supplyChainsData, clustersData, productClusterRows, isLoading } =
    useGreenGrowthData(selectedCountry, selectedYear);

  // Process data for animation
  const animationData = useMemo((): AnimationData => {
    if (
      !supplyChainsData?.ggSupplyChainList ||
      !clustersData?.ggClusterList ||
      !productClusterRows
    ) {
      return { chains: [], clusters: [], products: [], connections: [] };
    }

    // Create supply chain lookup: name -> id
    const supplyChainNameToId = new Map(
      supplyChainsData.ggSupplyChainList.map((chain: any) => [
        chain.supplyChain,
        chain.supplyChainId,
      ]),
    );

    const chains: ChainData[] = supplyChainsData.ggSupplyChainList.map(
      (chain: any, index: number) => {
        const totalChains = supplyChainsData.ggSupplyChainList.length;

        return {
          id: chain.supplyChainId,
          name: chain.supplyChain,
          color: getSupplyChainColor(chain.supplyChainId),
          initialPosition: {
            x: (width / 6) * (index % 5) + width / 6,
            y: (height / 4) * Math.floor(index / 5) + height / 4,
          },
          leftPosition: {
            x: 60, // Closer to text labels
            y: ((height - 180) / (totalChains - 1)) * index + 100, // Better vertical spread using more height
          },
        };
      },
    );

    // Get clusters for each chain - FIX: use supply chain IDs, not names
    const chainClusters = new Map<number, Set<number>>(); // chainId -> Set<clusterId>
    const clusterChains = new Map<number, Set<number>>(); // clusterId -> Set<chainId>

    productClusterRows.forEach((row) => {
      const chainName = row.supply_chain; // This is a string like "Heat Pumps"
      const chainId = supplyChainNameToId.get(chainName); // Convert to number ID
      const clusterId = row.dominant_cluster; // This is already a number

      if (chainId !== undefined && typeof chainId === "number") {
        if (!chainClusters.has(chainId)) {
          chainClusters.set(chainId, new Set());
        }
        chainClusters.get(chainId)!.add(clusterId);

        if (!clusterChains.has(clusterId)) {
          clusterChains.set(clusterId, new Set());
        }
        clusterChains.get(clusterId)!.add(chainId);
      }
    });

    const clusters: ClusterData[] = clustersData.ggClusterList.map(
      (cluster: any) => ({
        id: cluster.clusterId,
        name: cluster.clusterName,
        chains: Array.from(clusterChains.get(cluster.clusterId) || []),
      }),
    );

    // Products grouped by cluster
    const clusterProducts = new Map<
      number,
      Array<{ id: number; code: string; name: string }>
    >();
    productClusterRows.forEach((row) => {
      const clusterId = row.dominant_cluster;
      if (!clusterProducts.has(clusterId)) {
        clusterProducts.set(clusterId, []);
      }
      clusterProducts.get(clusterId)!.push({
        id: row.product_id,
        code: row.HS2012_4dg,
        name: row.name_short_en,
      });
    });

    const products: ProductData[] = Array.from(clusterProducts.entries()).map(
      ([clusterId, products]) => ({
        clusterId,
        products: products, // Limit for animation performance
      }),
    );

    // Find cross-connections (clusters that appear in multiple chains)
    const connections: ConnectionData[] = clusters
      .filter((cluster: ClusterData) => cluster.chains.length > 1)
      // Limit to 3 for clear visualization
      .map((cluster: ClusterData) => ({
        clusterId: cluster.id,
        clusterName: cluster.name,
        chains: cluster.chains,
      }));

    return { chains, clusters, products, connections };
  }, [supplyChainsData, clustersData, productClusterRows, width, height]);

  // Auto-demonstrate functionality - automatically select a chain for steps 3-4
  useEffect(() => {
    if (animationData.chains.length === 0) return;

    if (currentStep >= 2 && currentStep <= 4) {
      // Automatically select the first chain with clusters for demonstration
      const chainWithClusters = animationData.chains.find((chain) =>
        animationData.clusters.some((cluster) =>
          cluster.chains.includes(chain.id),
        ),
      );
      if (chainWithClusters && demonstrationChain !== chainWithClusters.id) {
        setDemonstrationChain(chainWithClusters.id);
      }
    } else {
      setDemonstrationChain(null);
    }
  }, [
    currentStep,
    animationData.chains,
    animationData.clusters,
    demonstrationChain,
  ]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsPlaying(false);
      }
    }, 2000); // 4 seconds per step

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying]);

  const currentStepData = STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height,
        }}
      >
        <Typography>Loading animation data...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width,
        height,
        position: "relative",
        border: "1px solid #e0e0e0",
        borderRadius: 2,
      }}
    >
      {/* Header with step info and controls */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          p: 2,
          backgroundColor: "rgba(255,255,255,0.95)",
          borderBottom: "1px solid #e0e0e0",
          zIndex: 10,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h6">{currentStepData.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {currentStepData.description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Step {currentStep + 1} of {STEPS.length}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              onClick={handlePrevious}
              disabled={currentStep === 0}
              size="small"
            >
              <SkipPrevious />
            </IconButton>
            <IconButton onClick={togglePlay} size="small">
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
            <IconButton
              onClick={handleNext}
              disabled={currentStep === STEPS.length - 1}
              size="small"
            >
              <SkipNext />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Main SVG Animation Area */}
      <svg width={width} height={height} style={{ marginTop: 80 }}>
        <title>Green Value Chains Animation</title>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Render value chain circles */}
        {animationData.chains.map((chain) => {
          const isLeftPosition = currentStep >= 1;
          const isBubbleLayout = currentStep === 5; // Step 6 (index 5) is bubble layout
          const isDemonstrating = demonstrationChain === chain.id;
          const isUserFocused = focusedChain === chain.id;

          let x: number, y: number, radius: number;

          if (isBubbleLayout) {
            // Bubble layout positions - arrange in grid like original but larger to show nested products
            const chainIndex = animationData.chains.findIndex(
              (c) => c.id === chain.id,
            );
            const cols = 5;
            const rows = Math.ceil(animationData.chains.length / cols);
            const gridWidth = width - 200; // Leave margin
            const gridHeight = height - 200;
            const cellWidth = gridWidth / cols;
            const cellHeight = gridHeight / rows;

            const row = Math.floor(chainIndex / cols);
            const col = chainIndex % cols;

            x = 100 + col * cellWidth + cellWidth / 2;
            y = 120 + row * cellHeight + cellHeight / 2;
            radius = 75; // Larger radius for 3-level nested hierarchy
          } else if (isLeftPosition) {
            x = chain.leftPosition.x;
            y = chain.leftPosition.y;

            radius = 30;
          } else {
            x = chain.initialPosition.x;
            y = chain.initialPosition.y;

            radius = 30;
          }

          // Highlight effect for demonstration or user focus
          const isHighlighted = isDemonstrating || isUserFocused;

          return (
            <animated.g key={chain.id}>
              <animated.circle
                cx={x}
                cy={y}
                r={radius}
                fill={chain.color}
                fillOpacity={isBubbleLayout ? 0.15 : 1}
                stroke={isHighlighted ? "#FFD700" : "white"}
                strokeWidth={isHighlighted ? "3" : "2"}
                opacity={
                  isDemonstrating
                    ? 1
                    : isLeftPosition && !isUserFocused
                      ? 0.8
                      : 1
                }
                style={{
                  cursor: "pointer",
                  filter: isHighlighted ? "url(#glow)" : "none",
                  transition: "all 0.8s ease",
                }}
                onClick={() =>
                  setFocusedChain(focusedChain === chain.id ? null : chain.id)
                }
              />

              {/* Nested clusters will be rendered by ClustersLayer and ProductsLayer */}

              <animated.text
                x={isBubbleLayout ? x : isLeftPosition ? x + 38 : x + 40}
                y={isBubbleLayout ? y - radius - 10 : y + 4}
                textAnchor={isBubbleLayout ? "middle" : "start"}
                fontSize="12"
                fill="#333"
                opacity={1}
                fontWeight={isHighlighted ? "bold" : "normal"}
                style={{ transition: "all 0.8s ease" }}
              >
                {chain.name.length > 20
                  ? `${chain.name.substring(0, 20)}...`
                  : chain.name}
              </animated.text>
            </animated.g>
          );
        })}

        {/* Instructions text */}
        {currentStep >= 2 &&
          currentStep < 5 &&
          !focusedChain &&
          !demonstrationChain && (
            <text
              x={width / 2}
              y={height - 50}
              textAnchor="middle"
              fontSize="12"
              fill="#666"
              fontStyle="italic"
            >
              Click on a value chain on the left to explore its clusters and
              products
            </text>
          )}

        {/* Final step explanation */}
        {currentStep === 5 && (
          <g>
            <text
              x={width / 2}
              y={height - 45}
              textAnchor="middle"
              fontSize="14"
              fill="#333"
              fontWeight="bold"
            >
              Complete 3-Level Hierarchy: Value Chains → Clusters → Products
            </text>
            <text
              x={width / 2}
              y={height - 25}
              textAnchor="middle"
              fontSize="12"
              fill="#666"
              fontStyle="italic"
            >
              Outer circles: Value chains | Middle circles: Technology clusters
              | Inner circles: Tradeable products
            </text>
          </g>
        )}

        {/* Step-specific content - clusters and products animate through all steps */}
        {currentStep >= 2 && (
          <ClustersLayer
            focusedChain={focusedChain || demonstrationChain}
            data={animationData}
            height={height}
            currentStep={currentStep}
            width={width}
          />
        )}
        {currentStep >= 3 && (
          <ProductsLayer
            focusedChain={focusedChain || demonstrationChain}
            data={animationData}
            height={height}
            currentStep={currentStep}
            width={width}
          />
        )}
        {currentStep >= 4 && currentStep < 5 && (
          <ConnectionsLayer
            data={animationData}
            currentStep={currentStep}
            height={height}
            focusedChain={focusedChain || demonstrationChain}
          />
        )}
      </svg>
    </Box>
  );
};

// Animated Cluster Background Component
const AnimatedClusterBackground: React.FC<{
  clusterNode: ForceClusterNode;
  bubbleProducts: PackedProduct[];
  isBubbleLayout: boolean;
  data: AnimationData;
  width: number;
  height: number;
  currentStep: number;
}> = ({
  clusterNode,

  isBubbleLayout,
  data,
  width,
  height,
  currentStep,
}) => {
  // Calculate bubble position for this cluster
  const bubblePosition = useMemo(() => {
    if (!isBubbleLayout) {
      return {
        x: clusterNode.x || 0,
        y: clusterNode.y || 0,
        r: clusterNode.radius,
      };
    }

    // Get cluster bubble position (same logic as getBubblePackedProducts)
    const nodeIdStr = String(clusterNode.id);
    const cluster = data.clusters.find((c) =>
      nodeIdStr.includes(`cluster-${c.id}-`),
    );
    if (!cluster)
      return {
        x: clusterNode.x || 0,
        y: clusterNode.y || 0,
        r: clusterNode.radius,
      };

    const chainId = parseInt(nodeIdStr.split("-chain-")[1]);
    const parentChain = data.chains.find((c) => c.id === chainId);
    if (!parentChain)
      return {
        x: clusterNode.x || 0,
        y: clusterNode.y || 0,
        r: clusterNode.radius,
      };

    // Calculate bubble position
    const chainIndex = data.chains.findIndex((c) => c.id === parentChain.id);
    const cols = 5;
    const rows = Math.ceil(data.chains.length / cols);
    const gridWidth = width - 200;
    const gridHeight = height - 200;
    const cellWidth = gridWidth / cols;
    const cellHeight = gridHeight / rows;

    const row = Math.floor(chainIndex / cols);
    const col = chainIndex % cols;

    const chainCenterX = 100 + col * cellWidth + cellWidth / 2;
    const chainCenterY = 120 + row * cellHeight + cellHeight / 2;
    const chainRadius = 75;

    // Pack clusters within the value chain circle
    const chainClusters = data.clusters.filter((c) =>
      c.chains.includes(parentChain.id),
    );
    const hierarchyData = {
      children: chainClusters.map((c) => {
        const products = data.products.find((p) => p.clusterId === c.id);
        return {
          id: c.id,
          value: Math.max(products?.products.length || 1, 1),
        };
      }),
    };

    const packSize = (chainRadius - 10) * 2;
    const pack = d3.pack<any>().size([packSize, packSize]).padding(8);
    const root = d3.hierarchy(hierarchyData).sum((d: any) => d.value || 1);
    const packedRoot = pack(root);

    const packedCluster = packedRoot.children?.find(
      (child) => child.data.id === cluster.id,
    );

    if (!packedCluster)
      return {
        x: clusterNode.x || 0,
        y: clusterNode.y || 0,
        r: clusterNode.radius,
      };

    return {
      x: chainCenterX + (packedCluster.x || 0) - (chainRadius - 10),
      y: chainCenterY + (packedCluster.y || 0) - (chainRadius - 10),
      r: Math.max(10, Math.min(packedCluster.r || 0, chainRadius * 0.4)), // Ensure minimum radius
    };
  }, [clusterNode, isBubbleLayout, data, width, height]);

  // Use react-spring for cluster background animation with proper bounds
  const clusterSpring = useSpring({
    cx: isBubbleLayout ? bubblePosition.x : clusterNode.x || 0,
    cy: isBubbleLayout ? bubblePosition.y : clusterNode.y || 0,
    r: Math.max(5, isBubbleLayout ? bubblePosition.r : clusterNode.radius), // Ensure positive radius
    fillOpacity: isBubbleLayout ? 0.25 : 0.1,
    config: config.gentle,
  });

  const labelSpring = useSpring({
    x: isBubbleLayout ? bubblePosition.x : clusterNode.x || 0,
    y: isBubbleLayout
      ? bubblePosition.y - Math.max(5, bubblePosition.r) - 3
      : (clusterNode.y || 0) - clusterNode.radius - 5,
    fontSize: isBubbleLayout
      ? Math.max(8, Math.min(10, bubblePosition.r * 0.3))
      : 12,
    opacity: isBubbleLayout ? (bubblePosition.r > 15 ? 1 : 0.7) : 1,
    config: config.gentle,
  });

  return (
    <>
      <animated.circle
        cx={clusterSpring.cx}
        cy={clusterSpring.cy}
        r={clusterSpring.r}
        fill={clusterNode.color}
        fillOpacity={clusterSpring.fillOpacity}
        stroke={clusterNode.color}
        strokeWidth={isBubbleLayout ? 1.5 : 2}
        strokeDasharray={isBubbleLayout ? "3,2" : "4,4"}
      />
      {currentStep <= 4 && (
        <animated.text
          x={labelSpring.x}
          y={labelSpring.y}
          textAnchor="middle"
          fontSize={labelSpring.fontSize}
          fill="#333"
          fontWeight="bold"
          opacity={labelSpring.opacity}
        >
          {clusterNode.name.length > 20
            ? `${clusterNode.name.substring(0, 20)}...`
            : clusterNode.name}
        </animated.text>
      )}
    </>
  );
};

// Animated Products Component with react-spring
const AnimatedProducts: React.FC<{
  clusterNode: ForceClusterNode;
  treeProducts: PackedProduct[];
  bubbleProducts: PackedProduct[];
  isBubbleLayout: boolean;
}> = ({ clusterNode, treeProducts, bubbleProducts, isBubbleLayout }) => {
  // Create unified product list with both tree and bubble positions
  const productAnimations = useMemo(() => {
    return treeProducts.map((treeProduct, index) => {
      // Find corresponding bubble product
      const bubbleProduct = bubbleProducts.find(
        (bp) => bp.data.id === treeProduct.data.id,
      ) || {
        x: (clusterNode.x || 0) + treeProduct.x,
        y: (clusterNode.y || 0) + treeProduct.y,
        r: treeProduct.r,
        data: treeProduct.data,
      };

      // Calculate positions
      const treeX = (clusterNode.x || 0) + treeProduct.x;
      const treeY = (clusterNode.y || 0) + treeProduct.y;
      const bubbleX = bubbleProduct.x;
      const bubbleY = bubbleProduct.y;

      return {
        key: `${clusterNode.id}-product-${treeProduct.data.id}-${index}`,
        product: treeProduct,
        treeX,
        treeY,
        bubbleX,
        bubbleY,
        treeR: Math.max(3, treeProduct.r), // Ensure minimum radius
        bubbleR: Math.max(3, bubbleProduct.r), // Ensure minimum radius
      };
    });
  }, [treeProducts, bubbleProducts, clusterNode]);

  // Use useSprings to create springs for all products at once (avoids Rules of Hooks violation)
  const productSprings = useSprings(
    productAnimations.length,
    productAnimations.map((item) => ({
      cx: isBubbleLayout ? item.bubbleX : item.treeX,
      cy: isBubbleLayout ? item.bubbleY : item.treeY,
      r: Math.max(3, isBubbleLayout ? item.bubbleR : item.treeR), // Ensure positive radius
      config: config.gentle,
    })),
  );

  const textSprings = useSprings(
    productAnimations.length,
    productAnimations.map((item) => ({
      x: isBubbleLayout ? item.bubbleX : item.treeX,
      y: isBubbleLayout ? item.bubbleY + 2 : item.treeY + 2,
      fontSize: Math.max(
        6,
        Math.round((isBubbleLayout ? item.bubbleR : item.treeR) * 0.7),
      ),
      opacity: (isBubbleLayout ? item.bubbleR : item.treeR) > 4 ? 1 : 0,
      config: config.gentle,
    })),
  );

  return (
    <>
      {productAnimations.map((item, index) => {
        const productSpring = productSprings[index];
        const textSpring = textSprings[index];

        return (
          <g key={item.key}>
            <animated.circle
              cx={productSpring.cx}
              cy={productSpring.cy}
              r={productSpring.r}
              fill={clusterNode.color}
              stroke="white"
              strokeWidth={1}
              fillOpacity={0.8}
            />
            <animated.text
              x={textSpring.x}
              y={textSpring.y}
              textAnchor="middle"
              fontSize={textSpring.fontSize}
              fill="white"
              fontWeight="bold"
              opacity={textSpring.opacity}
            >
              {item.product.data.code.substring(0, 4)}
            </animated.text>
          </g>
        );
      })}
    </>
  );
};

// Additional layer components for different steps
const ClustersLayer: React.FC<{
  focusedChain: number | null;
  data: AnimationData;
  height: number;
  currentStep: number;
  width: number;
}> = ({ focusedChain, data, height, currentStep, width }) => {
  const isBubbleLayout = currentStep === 5;

  // Get clusters to render based on mode
  const clustersToRender = useMemo(() => {
    if (isBubbleLayout) {
      // Show all clusters for all chains in bubble layout
      return data.chains.flatMap((chain) => {
        const chainClusters = data.clusters.filter((cluster) =>
          cluster.chains.includes(chain.id),
        );
        return chainClusters.map((cluster) => ({
          ...cluster,
          parentChain: chain,
        }));
      });
    } else {
      // Show only clusters for focused chain in hierarchy mode
      if (!focusedChain) return [];
      const chain = data.chains.find((c) => c.id === focusedChain);
      if (!chain) return [];

      const chainClusters = data.clusters.filter((cluster) =>
        cluster.chains.includes(focusedChain),
      );
      return chainClusters.map((cluster) => ({
        ...cluster,
        parentChain: chain,
      }));
    }
  }, [isBubbleLayout, focusedChain, data.chains, data.clusters]);

  // Calculate cluster positions and animations with react-spring
  const clusterAnimations = useMemo(() => {
    return clustersToRender.map((clusterWithChain) => {
      const { parentChain } = clusterWithChain;

      // Calculate hierarchy position (when not in bubble layout)
      const chainClustersForChain = clustersToRender.filter(
        (c) => c.parentChain.id === parentChain.id,
      );
      const clusterIndexInChain = chainClustersForChain.findIndex(
        (c) => c.id === clusterWithChain.id,
      );

      const clusterCount = chainClustersForChain.length;
      const availableHeight = height - 160;
      const startY = 50;
      const endY = height - 60;

      const maxClusterHeight = Math.min(
        60,
        Math.max(25, availableHeight / clusterCount - 5),
      );
      const actualSpacing =
        clusterCount > 1
          ? Math.max(
              5,
              (availableHeight - clusterCount * maxClusterHeight) /
                (clusterCount - 1),
            )
          : 0;

      const hierarchyX = parentChain.leftPosition.x + 350;
      const hierarchyY =
        clusterCount === 1
          ? (startY + endY) / 2
          : startY +
            clusterIndexInChain * (maxClusterHeight + actualSpacing) +
            maxClusterHeight / 2;

      // Calculate bubble layout position (when in bubble layout)
      let bubbleX = hierarchyX;
      let bubbleY = hierarchyY;
      let bubbleRadius = 20;

      if (isBubbleLayout) {
        // Find parent chain's bubble position
        const chainIndex = data.chains.findIndex(
          (c) => c.id === parentChain.id,
        );
        const cols = 5;
        const rows = Math.ceil(data.chains.length / cols);
        const gridWidth = width - 200;
        const gridHeight = height - 200;
        const cellWidth = gridWidth / cols;
        const cellHeight = gridHeight / rows;

        const row = Math.floor(chainIndex / cols);
        const col = chainIndex % cols;

        const chainCenterX = 100 + col * cellWidth + cellWidth / 2;
        const chainCenterY = 120 + row * cellHeight + cellHeight / 2;
        const chainRadius = 75;

        const hierarchyData = {
          children: chainClustersForChain.map((cluster) => {
            const products = data.products.find(
              (p) => p.clusterId === cluster.id,
            );
            return {
              id: cluster.id,
              value: Math.max(products?.products.length || 1, 1),
            };
          }),
        };

        const packSize = (chainRadius - 10) * 2;
        const pack = d3.pack<any>().size([packSize, packSize]).padding(8);
        const root = d3.hierarchy(hierarchyData).sum((d: any) => d.value || 1);
        const packedRoot = pack(root);

        const packedCluster = packedRoot.children?.find(
          (child) => child.data.id === clusterWithChain.id,
        );

        if (packedCluster) {
          bubbleX = chainCenterX + (packedCluster.x || 0) - (chainRadius - 10);
          bubbleY = chainCenterY + (packedCluster.y || 0) - (chainRadius - 10);
          bubbleRadius = Math.min(packedCluster.r || 0, chainRadius * 0.4);
        }
      }

      return {
        cluster: clusterWithChain,
        parentChain,
        hierarchyX,
        hierarchyY,
        bubbleX,
        bubbleY,
        bubbleRadius,
        maxClusterHeight,
      };
    });
  }, [
    clustersToRender,
    isBubbleLayout,
    height,
    width,
    data.chains,
    data.products,
  ]);

  // In bubble layout, show all clusters for all chains; otherwise only show for focused chain
  if (!isBubbleLayout && !focusedChain) return null;
  if (clustersToRender.length === 0) return null;

  return (
    <g>
      {/* Render animated clusters */}
      {clusterAnimations.map((clusterAnim) => {
        const {
          cluster,
          parentChain,
          hierarchyX,
          hierarchyY,
          bubbleX,
          bubbleY,
          bubbleRadius,
          maxClusterHeight,
        } = clusterAnim;

        // Calculate dynamic sizing for hierarchy mode
        const fontSize = 12;
        const clusterWidth = 200;
        const maxTextLength = Math.floor(clusterWidth / (fontSize * 0.6));

        return (
          <animated.g key={`cluster-${cluster.id}-chain-${parentChain.id}`}>
            {/* Cluster shape - rect for hierarchy, circle for bubble */}
            {isBubbleLayout ? (
              <animated.circle
                cx={bubbleX}
                cy={bubbleY}
                r={bubbleRadius}
                fill={parentChain.color}
                fillOpacity={0.25}
                stroke={parentChain.color}
                strokeWidth={1.5}
                strokeDasharray="3,2"
                style={{
                  transition: "all 0.8s ease",
                }}
              />
            ) : (
              <animated.rect
                x={hierarchyX - clusterWidth / 2}
                y={hierarchyY - maxClusterHeight / 2}
                width={clusterWidth}
                height={maxClusterHeight}
                fill={parentChain.color}
                fillOpacity={0.08}
                stroke={parentChain.color}
                strokeWidth={2}
                rx={Math.min(15, maxClusterHeight / 3)}
                style={{
                  transition: "all 0.8s ease",
                }}
              />
            )}

            {/* Cluster name */}
            <animated.text
              x={isBubbleLayout ? bubbleX : hierarchyX}
              y={
                isBubbleLayout
                  ? bubbleY - bubbleRadius - 3
                  : hierarchyY + fontSize / 3
              }
              textAnchor="middle"
              fontSize={
                isBubbleLayout ? Math.min(10, bubbleRadius * 0.3) : fontSize
              }
              fill="#333"
              fontWeight="bold"
              style={{
                transition: "all 0.8s ease",
              }}
            >
              {cluster.name.length > maxTextLength
                ? `${cluster.name.substring(0, maxTextLength)}...`
                : cluster.name}
            </animated.text>

            {/* Connection line - only in hierarchy mode */}
            {!isBubbleLayout && (
              <>
                <animated.line
                  x1={parentChain.leftPosition.x + 30}
                  y1={parentChain.leftPosition.y}
                  x2={hierarchyX - clusterWidth / 2}
                  y2={hierarchyY}
                  stroke={parentChain.color}
                  strokeWidth={3}
                  opacity={0.7}
                  style={{
                    transition: "all 0.8s ease",
                  }}
                />
                <animated.circle
                  cx={hierarchyX - clusterWidth / 2}
                  cy={hierarchyY}
                  r={5}
                  fill={parentChain.color}
                  stroke="white"
                  strokeWidth={2}
                  opacity={0.95}
                  style={{
                    transition: "all 0.8s ease",
                  }}
                />
              </>
            )}
          </animated.g>
        );
      })}

      {/* Header and explanation - only in hierarchy mode */}
      {!isBubbleLayout && focusedChain && (
        <g>
          <line
            x1={clustersToRender[0]?.parentChain.leftPosition.x + 200}
            y1={30}
            x2={clustersToRender[0]?.parentChain.leftPosition.x + 200}
            y2={height - 60}
            stroke={clustersToRender[0]?.parentChain.color}
            strokeWidth={2}
            opacity={0.4}
          />
          <text
            x={clustersToRender[0]?.parentChain.leftPosition.x + 210}
            y={45}
            fontSize="14"
            fill="black"
            fontWeight="bold"
          >
            Level 1: Technology Clusters
          </text>
          <text
            x={clustersToRender[0]?.parentChain.leftPosition.x + 470}
            y={height - 40}
            fontSize="12"
            fill="#777"
            fontStyle="italic"
          >
            ← Related technology groups
          </text>
        </g>
      )}
    </g>
  );
};

const ProductsLayer: React.FC<{
  focusedChain: number | null;
  data: AnimationData;
  height: number;
  currentStep: number;
  width: number;
}> = ({ focusedChain, data, height, currentStep, width }) => {
  const simulationRef = useRef<d3.Simulation<
    ForceClusterNode,
    undefined
  > | null>(null);
  const [forceNodes, setForceNodes] = useState<ForceClusterNode[]>([]);
  const isBubbleLayout = currentStep === 5;

  // Find the focused chain
  const chain = data.chains.find((c) => c.id === focusedChain);

  // Find clusters for this chain and get their products
  const chainClusters = useMemo(() => {
    if (!focusedChain) return [];
    return data.clusters.filter((cluster) =>
      cluster.chains.includes(focusedChain),
    );
  }, [focusedChain, data.clusters]);

  // Simple global product radius - consistent size for all products
  const globalProductRadius = 14; // Fixed size for optimal readability and space usage

  // Create force simulation nodes
  const createForceNodes = useMemo((): ForceClusterNode[] => {
    if (!chain || chainClusters.length === 0) return [];

    return chainClusters.map((cluster, clusterIndex) => {
      const clusterProducts = data.products.find(
        (p) => p.clusterId === cluster.id,
      );

      const products = clusterProducts?.products.slice(0, 12) || []; // Limit products for performance
      const productCount = products.length;

      // Calculate cluster radius based on actual product space needed
      let radius: number;
      if (productCount === 0) {
        radius = 20;
      } else {
        // Calculate radius with enough space for 10px radius products and packing

        if (productCount === 1) {
          radius = globalProductRadius + 10; // Single product
        } else if (productCount <= 3) {
          radius = 45; // Small clusters need more space for 10px products
        } else if (productCount <= 6) {
          radius = 55; // Medium clusters
        } else if (productCount <= 9) {
          radius = 65; // Larger clusters
        } else {
          radius = 75; // Large clusters with plenty of room
        }
      }

      // Initial position based on cluster index and available space
      const clusterCount = chainClusters.length;
      const availableHeight = height - 160;
      const startY = 50;
      const endY = height - 60;
      const maxClusterHeight = Math.min(
        80,
        Math.max(25, availableHeight / clusterCount - 6),
      );
      const actualSpacing =
        clusterCount > 1
          ? Math.max(
              5,
              (availableHeight - clusterCount * maxClusterHeight) /
                (clusterCount - 1),
            )
          : 0;

      const clusterY =
        clusterCount === 1
          ? (startY + endY) / 2
          : startY +
            clusterIndex * (maxClusterHeight + actualSpacing) +
            maxClusterHeight / 2;

      const baseX = chain.leftPosition.x + 700 + clusterIndex * 200;

      // Calculate parent cluster position (from Level 1)
      // Use the right side of the cluster rectangle for cluster=>product connections
      // Recalculate fontSize and clusterWidth to match ClustersLayer logic
      const totalClusters = chainClusters.length;
      const fontSize =
        totalClusters <= 3
          ? 16
          : totalClusters <= 8
            ? 14
            : totalClusters <= 15
              ? 12
              : 10;
      const clusterWidth =
        fontSize >= 16
          ? 240
          : fontSize >= 14
            ? 220
            : fontSize >= 12
              ? 200
              : 180;
      const parentClusterX = chain.leftPosition.x + 350 + clusterWidth / 2; // Right side of cluster rectangle
      const parentClusterY = clusterY; // Same Y as Level 1 cluster

      return {
        id: `cluster-${cluster.id}-chain-${chain.id}`, // Include chain ID for uniqueness
        name: cluster.name,
        color: chain.color,
        products,
        radius,
        originalX: baseX,
        originalY: clusterY,
        parentX: parentClusterX,
        parentY: parentClusterY,
        x: baseX,
        y: clusterY,
      };
    });
  }, [chain, chainClusters, data.products, height]);

  // Set up D3 force simulation
  useEffect(() => {
    if (createForceNodes.length === 0) {
      setForceNodes([]);
      return;
    }

    // Define the bounds for the force simulation
    const bounds = {
      left: chain!.leftPosition.x + 600,
      right: chain!.leftPosition.x + 1200,
      top: 80,
      bottom: height - 80,
    };

    // Create anchor nodes for Level 1 cluster positions (fixed positions)
    const anchorNodes: ForceClusterNode[] = createForceNodes.map((node) => ({
      id: `anchor-${node.id}`,
      name: `Anchor for ${node.name}`,
      color: node.color,
      products: [],
      radius: 0, // Invisible anchor
      originalX: node.parentX,
      originalY: node.parentY,
      parentX: node.parentX,
      parentY: node.parentY,
      isAnchor: true,
      x: node.parentX,
      y: node.parentY,
      fx: node.parentX, // Fixed X position
      fy: node.parentY, // Fixed Y position
    }));

    // Combine cluster nodes and anchor nodes
    const allNodes = [...createForceNodes, ...anchorNodes];

    // Create links between clusters and their anchors
    const links: ForceLink[] = createForceNodes.map((node) => ({
      source: node.id,
      target: `anchor-${node.id}`,
    }));

    const simulation = d3
      .forceSimulation<ForceClusterNode>(allNodes)
      .force(
        "collision",
        d3.forceCollide<ForceClusterNode>().radius((d) => {
          const node = d as ForceClusterNode;
          if (node.isAnchor) return 0;
          // Dynamic collision buffer: smaller for small circles, larger for big circles
          const collisionBuffer = 20;
          return node.radius + collisionBuffer;
        }),
      )

      .force(
        "y",
        d3
          .forceY()
          .y((d) => (d as ForceClusterNode).parentY)
          .strength(0.8),
      )
      .force(
        "charge",
        d3
          .forceManyBody()
          .strength((d) => ((d as ForceClusterNode).isAnchor ? 0 : -200)),
      )
      .force(
        "link",
        d3
          .forceLink<ForceClusterNode, ForceLink>(links)
          .id((d) => d.id.toString())

          .strength(0.7),
      )

      .force("boundary", () => {
        allNodes.forEach((node) => {
          if ((node as ForceClusterNode).isAnchor) return; // Skip boundary constraints for anchors
          const clusterNode = node as ForceClusterNode;
          if (clusterNode.x! < bounds.left + clusterNode.radius)
            clusterNode.x = bounds.left + clusterNode.radius;
          if (clusterNode.x! > bounds.right - clusterNode.radius)
            clusterNode.x = bounds.right - clusterNode.radius;
          if (clusterNode.y! < bounds.top + clusterNode.radius)
            clusterNode.y = bounds.top + clusterNode.radius;
          if (clusterNode.y! > bounds.bottom - clusterNode.radius)
            clusterNode.y = bounds.bottom - clusterNode.radius;
        });
      });

    simulation.on("tick", () => {
      // Only update state with cluster nodes (not anchors)
      setForceNodes([...createForceNodes]);
    });

    simulationRef.current = simulation;

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [createForceNodes, chain, height]);

  // Calculate bubble layout positions for products
  const getBubblePackedProducts = (
    clusterNode: ForceClusterNode,
  ): PackedProduct[] => {
    if (!isBubbleLayout || clusterNode.products.length === 0) return [];

    // Find the cluster's bubble position from ClustersLayer logic
    const nodeIdStr = String(clusterNode.id);
    const cluster = data.clusters.find((c) =>
      nodeIdStr.includes(`cluster-${c.id}-`),
    );
    if (!cluster) return [];

    // Get the parent chain
    const chainId = parseInt(nodeIdStr.split("-chain-")[1]);
    const parentChain = data.chains.find((c) => c.id === chainId);
    if (!parentChain) return [];

    // Calculate bubble position (same logic as ClustersLayer)
    const chainIndex = data.chains.findIndex((c) => c.id === parentChain.id);
    const cols = 5;
    const rows = Math.ceil(data.chains.length / cols);
    const gridWidth = width - 200;
    const gridHeight = height - 200;
    const cellWidth = gridWidth / cols;
    const cellHeight = gridHeight / rows;

    const row = Math.floor(chainIndex / cols);
    const col = chainIndex % cols;

    const chainCenterX = 100 + col * cellWidth + cellWidth / 2;
    const chainCenterY = 120 + row * cellHeight + cellHeight / 2;
    const chainRadius = 75;

    // Pack clusters within the value chain circle to find this cluster's position
    const chainClusters = data.clusters.filter((c) =>
      c.chains.includes(parentChain.id),
    );
    const hierarchyData = {
      children: chainClusters.map((c) => {
        const products = data.products.find((p) => p.clusterId === c.id);
        return {
          id: c.id,
          value: Math.max(products?.products.length || 1, 1),
        };
      }),
    };

    const packSize = (chainRadius - 10) * 2;
    const pack = d3.pack<any>().size([packSize, packSize]).padding(8);
    const root = d3.hierarchy(hierarchyData).sum((d: any) => d.value || 1);
    const packedRoot = pack(root);

    const packedCluster = packedRoot.children?.find(
      (child) => child.data.id === cluster.id,
    );

    if (!packedCluster) return [];

    const clusterBubbleX =
      chainCenterX + (packedCluster.x || 0) - (chainRadius - 10);
    const clusterBubbleY =
      chainCenterY + (packedCluster.y || 0) - (chainRadius - 10);
    const clusterBubbleRadius = Math.min(
      packedCluster.r || 0,
      chainRadius * 0.4,
    );

    // Pack products within this cluster bubble
    const productHierarchy = {
      children: clusterNode.products.map((product, index) => ({
        ...product,
        value: 1,
        id: `${product.id}-${index}`,
      })),
    };

    const productPackSize = (clusterBubbleRadius - 3) * 2;
    const productPack = d3
      .pack<any>()
      .size([productPackSize, productPackSize])
      .padding(1.5);
    const productRoot = d3
      .hierarchy(productHierarchy)
      .sum((d: any) => d.value || 1);
    const productPackedRoot = productPack(productRoot);

    return (
      productPackedRoot.children?.map((child) => ({
        data: {
          id: child.data.id,
          code: child.data.code,
          name: child.data.name,
        },
        x: clusterBubbleX + (child.x || 0) - (clusterBubbleRadius - 3),
        y: clusterBubbleY + (child.y || 0) - (clusterBubbleRadius - 3),
        r: Math.min(child.r || 0, 6), // Cap product radius
      })) || []
    );
  };

  // Simple circle packing with consistent product sizes for tree layout
  const getPackedProducts = (
    clusterNode: ForceClusterNode,
  ): PackedProduct[] => {
    if (clusterNode.products.length === 0) return [];

    // Fix overlapping by giving d3.pack enough space to work with
    const packSize = clusterNode.radius * 1.8; // More space for the packing algorithm
    const padding = 2.5; // Sufficient padding to prevent overlaps with 10px radius circles

    const hierarchyData = {
      children: clusterNode.products.map((product, index) => ({
        ...product,
        value: 1, // Equal values for optimal packing
        id: `${product.id}-${index}`,
      })),
    };

    const pack = d3.pack<any>().size([packSize, packSize]).padding(padding);
    const root = d3.hierarchy(hierarchyData).sum((d: any) => d.value || 0);
    const packedRoot = pack(root);

    return (
      packedRoot.children?.map((child) => ({
        data: {
          id: child.data.id,
          code: child.data.code,
          name: child.data.name,
        },
        x: (child.x || 0) - packSize / 2,
        y: (child.y || 0) - packSize / 2,
        r: globalProductRadius, // Always use consistent size
      })) || []
    );
  };

  // ProductsLayer will handle animation to bubble positions in step 5
  if (!focusedChain || !chain) return null;

  return (
    <g>
      {/* Hierarchy Level 2: Products */}
      {currentStep <= 4 && (
        <>
          <line
            x1={chain.leftPosition.x + 550}
            y1={10}
            x2={chain.leftPosition.x + 550}
            y2={height - 50}
            stroke={chain.color}
            strokeWidth={2}
            opacity={0.4}
          />
          <text
            x={chain.leftPosition.x + 555}
            y={30}
            fontSize="14"
            fill="black"
            fontWeight="bold"
          >
            Level 2: Tradeable Products
          </text>
        </>
      )}
      {/* Render force-simulated cluster circles */}
      {forceNodes
        .filter((node) => !node.isAnchor)
        .map((clusterNode) => {
          const treeProducts = getPackedProducts(clusterNode);
          const bubbleProducts = getBubblePackedProducts(clusterNode);

          return (
            <g key={clusterNode.id}>
              {/* Animated cluster background */}
              <AnimatedClusterBackground
                clusterNode={clusterNode}
                bubbleProducts={bubbleProducts}
                isBubbleLayout={isBubbleLayout}
                data={data}
                width={width}
                height={height}
                currentStep={currentStep}
              />

              {/* Animated products with react-spring */}
              <AnimatedProducts
                clusterNode={clusterNode}
                treeProducts={treeProducts}
                bubbleProducts={bubbleProducts}
                isBubbleLayout={isBubbleLayout}
              />

              {/* Connection lines - only show in hierarchy mode */}
              {currentStep <= 4 && (
                <>
                  <line
                    x1={clusterNode.parentX}
                    y1={clusterNode.parentY}
                    x2={(clusterNode.x || 0) - clusterNode.radius}
                    y2={clusterNode.y || 0}
                    stroke={clusterNode.color}
                    strokeWidth={2}
                    strokeDasharray="6,3"
                    strokeOpacity={0.5}
                  />

                  {/* Connection point at parent cluster */}
                  <circle
                    cx={clusterNode.parentX}
                    cy={clusterNode.parentY}
                    r={6}
                    fill={clusterNode.color}
                    stroke="white"
                    strokeWidth={2}
                    opacity={0.8}
                  />

                  {/* Connection point at Level 2 cluster - left side */}
                  <circle
                    cx={(clusterNode.x || 0) - clusterNode.radius}
                    cy={clusterNode.y || 0}
                    r={4}
                    fill={clusterNode.color}
                    stroke="white"
                    strokeWidth={2}
                    opacity={0.9}
                  />
                </>
              )}
              {/* Explanation text */}
              {chain && (
                <text
                  x={chain.leftPosition.x + 650}
                  y={height - 30}
                  fontSize="12"
                  fill="#777"
                  fontStyle="italic"
                >
                  Individual tradeable goods →
                </text>
              )}
            </g>
          );
        })}
    </g>
  );
};

const ConnectionsLayer: React.FC<{
  data: AnimationData;
  currentStep: number;
  height: number;
  focusedChain: number | null;
}> = ({ data, currentStep, height, focusedChain }) => {
  // Get clustersToRender using the same logic as ClustersLayer
  const clustersToRender = useMemo(() => {
    // Show only clusters for focused chain in hierarchy mode (matches ClustersLayer)
    if (!focusedChain) return [];
    const chain = data.chains.find((c) => c.id === focusedChain);
    if (!chain) return [];

    const chainClusters = data.clusters.filter((cluster) =>
      cluster.chains.includes(focusedChain),
    );
    return chainClusters.map((cluster) => ({
      ...cluster,
      parentChain: chain,
    }));
  }, [focusedChain, data.chains, data.clusters]);

  // Show connections from ALL chains to currently visible clusters
  const connectionsToShow = useMemo(() => {
    if (currentStep < 4) return [];

    // If no chain is focused, don't show any connections (matches ClustersLayer behavior)
    if (!focusedChain) return [];

    const visibleClusterIds = new Set(clustersToRender.map((c) => c.id));

    // Show ALL connections to visible clusters (from any value chain)
    return data.connections.filter((connection) =>
      visibleClusterIds.has(connection.clusterId),
    );
  }, [currentStep, focusedChain, data.connections, clustersToRender]);

  if (connectionsToShow.length === 0) return null;

  return (
    <g>
      {connectionsToShow.map((connection) => {
        const connectedChains = data.chains.filter((chain) =>
          connection.chains.includes(chain.id),
        );

        if (connectedChains.length < 2) return null;

        return (
          <g key={connection.clusterId}>
            {/* Draw connections from each chain to the shared cluster */}
            {connectedChains.map((chain) => {
              // Find the cluster position as it appears in the focused chain's view
              const targetClusterInFocusedView = clustersToRender.find(
                (c) => c.id === connection.clusterId,
              );

              if (!targetClusterInFocusedView) return null;

              // Calculate the cluster's position in the focused chain's layout
              const clusterIndexInFocusedView = clustersToRender.findIndex(
                (c) => c.id === connection.clusterId,
              );

              if (clusterIndexInFocusedView === -1) return null;

              const clusterCount = clustersToRender.length;
              // Use same height calculations as ClustersLayer
              const availableHeight = height - 160;
              const startY = 50;
              const endY = height - 60;

              const maxClusterHeight = Math.min(
                60,
                Math.max(25, availableHeight / clusterCount - 5),
              );
              const actualSpacing =
                clusterCount > 1
                  ? Math.max(
                      5,
                      (availableHeight - clusterCount * maxClusterHeight) /
                        (clusterCount - 1),
                    )
                  : 0;

              // Use focused chain's position for the cluster layout
              const focusedChainData = data.chains.find(
                (c) => c.id === focusedChain,
              );
              const hierarchyX = focusedChainData
                ? focusedChainData.leftPosition.x + 350
                : 0;
              const hierarchyY =
                clusterCount === 1
                  ? (startY + endY) / 2
                  : startY +
                    clusterIndexInFocusedView *
                      (maxClusterHeight + actualSpacing) +
                    maxClusterHeight / 2;

              // Use the same width calculation as ClustersLayer
              const clusterWidth = 200; // ClustersLayer uses 200

              const clusterCenterX = hierarchyX;
              const clusterCenterY = hierarchyY;

              // Connection points
              const chainX = chain.leftPosition.x + 30;
              const chainY = chain.leftPosition.y;
              const clusterConnectionX = clusterCenterX - clusterWidth / 2; // Left side of cluster

              // Control point for curved connection
              const midX = (chainX + clusterConnectionX) / 2;
              const controlY = Math.min(chainY, clusterCenterY) - 20;

              return (
                <g key={`${chain.id}-${connection.clusterId}`}>
                  {/* Curved connection line from chain to cluster */}
                  <path
                    d={`M ${chainX} ${chainY} Q ${midX} ${controlY} ${clusterConnectionX} ${clusterCenterY}`}
                    stroke={chain.color}
                    strokeWidth={2}
                    fill="none"
                    // strokeDasharray="6,4"
                    opacity={0.3}
                  />

                  {/* Connection point at chain */}
                  <circle
                    cx={chainX}
                    cy={chainY}
                    r={3}
                    fill="#ff6b6b"
                    opacity={0.8}
                  />

                  {/* Connection point at cluster */}
                  <circle
                    cx={clusterConnectionX}
                    cy={clusterCenterY}
                    r={4}
                    fill="#ff6b6b"
                    stroke="white"
                    strokeWidth={2}
                    opacity={0.9}
                  />
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Simplified explanation */}
      {currentStep >= 4 && (
        <text
          x={580}
          y={450}
          fontSize="11"
          fill="#ff6b6b"
          fontStyle="italic"
          textAnchor="middle"
        >
          ← Shared clusters connect multiple value chains
        </text>
      )}
    </g>
  );
};

export default AnimatedValueChainIntro;
