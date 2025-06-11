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
      [leftMargin, 20],
      [dimensions.width - rightMargin, dimensions.height - 40],
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
        // Tree layout - links go from right side of source to left side of target
        const sourceWidth = sourceNode.width ?? 0;
        const sourceHeight = sourceNode.height ?? 0;
        const targetHeight = targetNode.height ?? 0;

        sourceX = (sourceNode.x ?? 0) + sourceWidth;
        sourceY = (sourceNode.y ?? 0) + sourceHeight / 2;
        targetX = targetNode.x ?? 0;
        targetY = (targetNode.y ?? 0) + targetHeight / 2;

        const verticalDistance = Math.abs(sourceY - targetY);
        const curveIntensity = Math.min(0.8, verticalDistance / 300);

        const linkColor =
          targetNode.type === "product" ? targetNode.color : sourceNode.color;

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
        };
      } else if (focusedCluster) {
        // When focused on a cluster, use center-to-center connections like a tree
        const sourceWidth = sourceNode.width ?? 0;
        const sourceHeight = sourceNode.height ?? 0;
        const targetWidth = targetNode.width ?? 0;
        const targetHeight = targetNode.height ?? 0;

        if (sourceNode.type === "manufacturing_cluster") {
          sourceX = (sourceNode.x ?? 0) + sourceWidth / 2;
          sourceY = (sourceNode.y ?? 0) + sourceHeight / 2;
        } else {
          sourceX = (sourceNode.x ?? 0) + sourceWidth;
          sourceY = (sourceNode.y ?? 0) + sourceHeight / 2;
        }

        if (targetNode.type === "manufacturing_cluster") {
          targetX = (targetNode.x ?? 0) + targetWidth / 2;
          targetY = (targetNode.y ?? 0) + targetHeight / 2;
        } else {
          targetX = targetNode.x ?? 0;
          targetY = (targetNode.y ?? 0) + targetHeight / 2;
        }

        const verticalDistance = Math.abs(sourceY - targetY);
        const curveIntensity = Math.min(0.8, verticalDistance / 300);

        const linkColor =
          targetNode.type === "product" ? targetNode.color : sourceNode.color;

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
        };
      } else {
        // Sankey layout - use standard sankey positioning
        sourceX = (sourceNode.x ?? 0) + (sourceNode.width ?? 0);
        targetX = targetNode.x ?? 0;

        const sourceHeight = sourceNode.height ?? 0;
        const targetHeight = targetNode.height ?? 0;

        sourceY = (sourceNode.y ?? 0) + sourceHeight / 2;
        targetY = (targetNode.y ?? 0) + targetHeight / 2;

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
        };
      }
    })
    .filter(Boolean) as LinkPosition[];

  return { nodePositions: nodePosArray, linkPositions: linkPosArray };
}
