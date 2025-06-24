import { sankey } from "d3-sankey";
import { tree, hierarchy } from "d3-hierarchy";
import {
  TreeHierarchy,
  TreeNode,
  SankeyNodeExtra,
  NodePosition,
  LinkPosition,
} from "./types";

// Function to apply sankey layout
export function applySankeyLayout(
  hierarchyData: TreeHierarchy,
  dimensions: { width: number; height: number },
  leftMargin: number,
  rightMargin: number,
) {
  const visibleNodes = hierarchyData.nodes.filter((n) => n.visible);
  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));

  const sankeyNodes = visibleNodes.map((node) => ({
    name: node.id,
    type: node.type === "product" ? "manufacturing_cluster" : node.type,
  }));

  const nodeMap = Object.fromEntries(sankeyNodes.map((n, i) => [n.name, i]));

  const visibleLinks = hierarchyData.links
    .filter(
      (l) =>
        l.visible &&
        visibleNodeIds.has(l.source) &&
        visibleNodeIds.has(l.target),
    )
    .map((link) => ({
      source: nodeMap[link.source],
      target: nodeMap[link.target],
      value: link.value,
    }));

  const sankeyLayout = sankey<SankeyNodeExtra, object>()
    .nodeWidth(25)
    .nodePadding(10)
    .extent([
      [leftMargin, 70],
      [dimensions.width - rightMargin, dimensions.height - 100],
    ]);

  const { nodes, links } = sankeyLayout({
    nodes: sankeyNodes.map((n) => ({ ...n })),
    links: visibleLinks.map((l) => ({ ...l })),
  });

  return { nodes, links };
}

// Function to apply tree layout
export function applyTreeLayout(
  treeData: TreeNode,
  dimensions: { width: number; height: number },
) {
  // Create hierarchy for tree layout
  const root = hierarchy(treeData);

  // Calculate tree layout
  const treeLayout = tree<TreeNode>()
    .size([dimensions.height - 120, dimensions.width * 0.7])
    .separation((a, b) => {
      const baseSeparation = a.parent === b.parent ? 1.5 : 2;
      if (a.children && a.children.length > 3) {
        return baseSeparation + a.children.length * 0.2;
      }
      return baseSeparation;
    });

  return treeLayout(root);
}

// Function to convert hierarchy data to positioned nodes and links
export function convertToPositions(
  positionedHierarchyData: TreeHierarchy,
  focusedValueChain: string | null,
  focusedCluster: string | null,
): { nodePositions: NodePosition[]; linkPositions: LinkPosition[] } {
  const visibleNodes = positionedHierarchyData.nodes.filter((n) => n.visible);
  const nodeMap = new Map(visibleNodes.map((node) => [node.id, node]));

  const nodePosArray = visibleNodes.map((node) => ({
    id: node.id,
    x: node.x ?? 0,
    y: node.y ?? 0,
    width: node.width ?? 0,
    height: node.height ?? 0,
    color: node.color,
    label: node.name,
    type: node.type,
  }));

  const linkPosArray = positionedHierarchyData.links
    .filter((l) => l.visible)
    .map((link) => {
      const sourceNode = nodeMap.get(link.source);
      const targetNode = nodeMap.get(link.target);

      if (!sourceNode || !targetNode) return null;

      let sourceX, sourceY, targetX, targetY;

      if (focusedValueChain) {
        // Tree layout - network graph style with center-to-center connections for circles
        const circleRadius = 8; // Match the circle radius used in rendering

        // For circular nodes, connect from center to center
        sourceX = (sourceNode.x ?? 0) + (sourceNode.width ?? 0) / 2;
        sourceY = (sourceNode.y ?? 0) + (sourceNode.height ?? 0) / 2;
        targetX = (targetNode.x ?? 0) + (targetNode.width ?? 0) / 2;
        targetY = (targetNode.y ?? 0) + (targetNode.height ?? 0) / 2;

        // Calculate direction vector and adjust for circle edge
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          const unitX = dx / distance;
          const unitY = dy / distance;

          // Adjust positions to circle edges
          sourceX += unitX * circleRadius;
          sourceY += unitY * circleRadius;
          targetX -= unitX * circleRadius;
          targetY -= unitY * circleRadius;
        }

        const verticalDistance = Math.abs(sourceY - targetY);
        const curveIntensity = Math.min(0.8, verticalDistance / 300);

        // Always use value chain color for value chain → cluster links, grey for everything else
        const linkColor =
          sourceNode.type === "value_chain" ? sourceNode.color : "#808080";

        return {
          id: link.id,
          sourceName: link.source,
          targetName: link.target,
          sourceX,
          sourceY,
          targetX,
          targetY,
          color: linkColor,
          value: link.value,
          isTreeLink: true,
          curveIntensity,
          rca: link.rca,
        };
      } else if (focusedCluster) {
        // When focused on a cluster, use center-to-center connections for network graph style
        const circleRadius = 8; // Match the circle radius used in rendering

        // For circular nodes, connect from center to center
        sourceX = (sourceNode.x ?? 0) + (sourceNode.width ?? 0) / 2;
        sourceY = (sourceNode.y ?? 0) + (sourceNode.height ?? 0) / 2;
        targetX = (targetNode.x ?? 0) + (targetNode.width ?? 0) / 2;
        targetY = (targetNode.y ?? 0) + (targetNode.height ?? 0) / 2;

        // Calculate direction vector and adjust for circle edge
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          const unitX = dx / distance;
          const unitY = dy / distance;

          // Adjust positions to circle edges
          sourceX += unitX * circleRadius;
          sourceY += unitY * circleRadius;
          targetX -= unitX * circleRadius;
          targetY -= unitY * circleRadius;
        }

        const verticalDistance = Math.abs(sourceY - targetY);
        const curveIntensity = Math.min(0.8, verticalDistance / 300);

        // Always use value chain color for value chain → cluster links, grey for everything else
        const linkColor =
          sourceNode.type === "value_chain" ? sourceNode.color : "#808080";

        return {
          id: link.id,
          sourceName: link.source,
          targetName: link.target,
          sourceX,
          sourceY,
          targetX,
          targetY,
          color: linkColor,
          value: link.value,
          isTreeLink: true,
          curveIntensity,
          rca: link.rca,
        };
      } else {
        // Sankey layout - use proper proportional link positioning
        sourceX = (sourceNode.x ?? 0) + (sourceNode.width ?? 0);
        targetX = targetNode.x ?? 0;

        const sourceHeight = sourceNode.height ?? 0;
        const targetHeight = targetNode.height ?? 0;

        // Get all links coming from this source node
        const sourceLinks = positionedHierarchyData.links.filter(
          (l) => l.source === link.source && l.visible,
        );

        // Sort by target node's vertical position for better alignment
        sourceLinks.sort((a, b) => {
          const targetA = nodeMap.get(a.target);
          const targetB = nodeMap.get(b.target);
          if (targetA && targetB) {
            return (targetA.y ?? 0) - (targetB.y ?? 0);
          }
          return a.id.localeCompare(b.id);
        });

        // Find current link's index
        const linkIndex = sourceLinks.findIndex((l) => l.id === link.id);

        // Calculate total value of all links from this source
        const totalSourceLinkValue = sourceLinks.reduce(
          (sum, l) => sum + l.value,
          0,
        );

        // Sum of values up to this link
        const valueSumBefore = sourceLinks
          .slice(0, linkIndex)
          .reduce((sum, l) => sum + l.value, 0);

        // Calculate proportional positions for source
        const sourceRatio =
          totalSourceLinkValue > 0 ? valueSumBefore / totalSourceLinkValue : 0;

        // Get all links going to this target node
        const targetLinks = positionedHierarchyData.links.filter(
          (l) => l.target === link.target && l.visible,
        );

        // Sort by source node's vertical position for better alignment
        targetLinks.sort((a, b) => {
          const sourceA = nodeMap.get(a.source);
          const sourceB = nodeMap.get(b.source);
          if (sourceA && sourceB) {
            return (sourceA.y ?? 0) - (sourceB.y ?? 0);
          }
          return a.id.localeCompare(b.id);
        });

        // Find current link's index in target links
        const targetLinkIndex = targetLinks.findIndex((l) => l.id === link.id);

        // Calculate total value of all links to this target
        const totalTargetLinkValue = targetLinks.reduce(
          (sum, l) => sum + l.value,
          0,
        );

        // Sum of values up to this link for target
        const targetValueSumBefore = targetLinks
          .slice(0, targetLinkIndex)
          .reduce((sum, l) => sum + l.value, 0);

        // Calculate proportional positions for target
        const targetRatio =
          totalTargetLinkValue > 0
            ? targetValueSumBefore / totalTargetLinkValue
            : 0;

        // Calculate actual Y positions based on proportional distribution
        sourceY =
          (sourceNode.y ?? 0) +
          sourceHeight * sourceRatio +
          (sourceHeight * link.value) / (2 * totalSourceLinkValue);
        targetY =
          (targetNode.y ?? 0) +
          targetHeight * targetRatio +
          (targetHeight * link.value) / (2 * totalTargetLinkValue);

        return {
          id: link.id,
          sourceName: link.source,
          targetName: link.target,
          sourceX,
          sourceY,
          targetX,
          targetY,
          color: link.color,
          value: link.value,
          isTreeLink: false,
          curveIntensity: 0,
          rca: link.rca,
        };
      }
    })
    .filter(Boolean) as LinkPosition[];

  return { nodePositions: nodePosArray, linkPositions: linkPosArray };
}
