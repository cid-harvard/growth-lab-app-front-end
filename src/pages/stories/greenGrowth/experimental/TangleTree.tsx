import React, { useMemo, useState, useCallback } from "react";
import * as d3 from "d3";
import styled from "styled-components";
import {
  FullWidthContent,
  FullWidthContentContainer,
} from "../../../../styling/Grid";

const PageContainer = styled(FullWidthContentContainer)`
  padding: 40px 20px;
  font-family: "Source Sans Pro", sans-serif;
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

const ChartContainer = styled.div<{ width?: number }>`
  position: relative;
  width: 100%;
  ${(props) => (props.width ? `max-width: ${props.width}px;` : "")}
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* Hide overflow to prevent scrollbars when scaling */
  margin: 0 auto 20px auto;
`;

const ChartHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  background-color: #f8f9fa;
  border-radius: 8px 8px 0 0;
`;

const ChartTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
  font-weight: 400;
  font-size: 1.3rem;
`;

const SVGContainer = styled.div<{ width?: number }>`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  min-height: 600px;
  overflow: visible;
  width: 100%;
  ${(props) => (props.width ? `max-width: ${props.width}px;` : "")}
`;

// Input data types
interface TangleNodeInput {
  id: string;
  displaytext?: string;
  parents?: string[];
}

interface TangleTreeLayoutOptions {
  color?: (d: any, i: number) => string;
  c?: number;
  bigc?: number;
  width?: number;
  clusterYOffset?: number;
}

interface TangleTreeProps {
  data: TangleNodeInput[][];
  title?: string;
  subtitle?: string;
  options?: TangleTreeLayoutOptions;
  /**
   * Optional width in pixels to make the layout responsive.
   * When provided, the component will adapt node spacing and layout to fit within this width.
   * Labels for top-level nodes will appear on the left side.
   * @example
   * <TangleTree data={myData} width={800} />
   */
  width?: number;
  /**
   * Optional Y offset for the cluster layer (level 1) relative to the first layer.
   * Negative values move the cluster layer up, positive values move it down.
   * @default -100
   * @example
   * <TangleTree data={myData} clusterYOffset={-150} />
   */
  clusterYOffset?: number;
}

// Faithful implementation of Observable notebook's constructTangleLayout function
const constructTangleLayout = (levels: any[][], options: any = {}) => {
  // Create deep copies to avoid mutating input data
  const levelsCopy = levels.map((level) =>
    level.map((node) => ({
      ...node,
      parents: node.parents ? [...node.parents] : [],
    })),
  );

  // precompute level depth
  levelsCopy.forEach((l, i) => l.forEach((n: any) => (n.level = i)));

  const nodes = levelsCopy.reduce((a, x) => a.concat(x), []);
  const nodes_index: any = {};
  nodes.forEach((d: any) => (nodes_index[d.id] = d));

  // objectification with validation
  nodes.forEach((d: any) => {
    d.parents = (d.parents === undefined ? [] : d.parents)
      .map((p: string) => {
        const parentNode = nodes_index[p];
        if (!parentNode) {
          console.warn(
            `Parent node with id "${p}" not found for node "${d.id}"`,
          );
          return null;
        }
        return parentNode;
      })
      .filter((p: any) => p !== null); // Remove any null entries
  });

  // Handle level 2+ as traditional subtrees
  const hasSubtreeLevels = levels.length > 2;
  const tangledLevels = hasSubtreeLevels ? levelsCopy.slice(0, 2) : levelsCopy;
  const subtreeLevels = hasSubtreeLevels ? levelsCopy.slice(2) : [];

  // precompute bundles (only for tangled levels 0-1)
  tangledLevels.forEach((l, i) => {
    const index: any = {};
    l.forEach((n: any) => {
      if (n.parents.length === 0) {
        return;
      }

      const id = n.parents
        .map((d: any) => d.id)
        .sort()
        .join("-X-");

      if (id in index) {
        index[id].parents = index[id].parents.concat(n.parents);
      } else {
        index[id] = {
          id: id,
          parents: n.parents.slice(),
          level: i,
          span: i - (Number(d3.min(n.parents, (p: any) => p.level)) || 0),
        };
      }
      n.bundle = index[id];
    });

    (l as any).bundles = Object.keys(index).map((k) => index[k]);
    (l as any).bundles.forEach((b: any, i: number) => (b.i = i));
  });

  // Create links
  const links: any[] = [];
  const subtreeLinks: any[] = [];

  // Tangled tree links for levels 0-1
  tangledLevels.forEach((level) => {
    level.forEach((d: any) => {
      d.parents.forEach((p: any) => {
        const linkId = `${p.id}-to-${d.id}`;
        links.push({
          id: linkId,
          source: d,
          bundle: d.bundle,
          target: p,
          type: "tangled",
        });
      });
    });
  });

  // Simple direct links for subtree levels (2+)
  subtreeLevels.forEach((level) => {
    level.forEach((d: any) => {
      // Use tree parent if available (from d3.tree layout), otherwise use original parent
      const linkTarget =
        d.treeParent || d.parents.find((p: any) => p.level === 1);
      if (linkTarget) {
        const linkId = `${linkTarget.id}-to-${d.id}`;
        subtreeLinks.push({
          id: linkId,
          source: d,
          target: linkTarget,
          type: "subtree",
        });
      }
    });
  });

  const bundles = tangledLevels.reduce(
    (a, x) => a.concat((x as any).bundles || []),
    [],
  );

  // reverse pointer from parent to bundles (only for tangled levels)
  bundles.forEach((b: any) =>
    b.parents.forEach((p: any) => {
      if (p.bundles_index === undefined) {
        p.bundles_index = {};
      }
      if (!(b.id in p.bundles_index)) {
        p.bundles_index[b.id] = [];
      }
      p.bundles_index[b.id].push(b);
    }),
  );

  nodes.forEach((n: any) => {
    if (n.bundles_index !== undefined) {
      n.bundles = Object.keys(n.bundles_index).map((k) => n.bundles_index[k]);
    } else {
      n.bundles_index = {};
      n.bundles = [];
    }
    n.bundles.sort((a: any, b: any) =>
      d3.descending(
        d3.max(a, (d: any) => d.span) || 0,
        d3.max(b, (d: any) => d.span) || 0,
      ),
    );
    n.bundles.forEach((b: any, i: number) => (b.i = i));
  });

  links.forEach((l: any) => {
    if (l.bundle.links === undefined) {
      l.bundle.links = [];
    }
    l.bundle.links.push(l);
  });

  // layout - make responsive based on width
  const padding = 8;
  const left_label_padding = 80; // Extra padding for left-positioned labels
  const node_height = 22;
  const base_node_width = 200;
  const bundle_width = 14;
  const level_y_padding = 16;
  const metro_d = 4;
  const min_family_height = 22;
  const subtreeSpacing = 250; // Horizontal space between tangled tree and subtrees
  const clusterYOffset =
    options.clusterYOffset !== undefined ? options.clusterYOffset : 0; // Default: move cluster layer 100px up

  // Calculate responsive node width based on available width
  const totalTangledLevels = tangledLevels.length;
  const maxBundlesPerLevel = Math.max(
    ...tangledLevels.map((l) => (l as any).bundles?.length || 0),
    0,
  );
  const labelBuffer = 100; // Buffer for labels on the left
  const availableWidth = options.width
    ? Math.max(
        300,
        options.width -
          2 * padding -
          left_label_padding -
          maxBundlesPerLevel * bundle_width -
          labelBuffer -
          (hasSubtreeLevels ? subtreeSpacing + 300 : 0), // Reserve space for horizontal subtrees
      )
    : 0;
  const node_width =
    options.width && totalTangledLevels > 0
      ? Math.max(
          50,
          Math.min(base_node_width, availableWidth / totalTangledLevels),
        )
      : base_node_width;

  options.c = options.c || 16;
  const c = options.c;
  options.bigc = options.bigc || node_width + c;

  // Layout tangled levels (0-1) with existing logic
  tangledLevels.forEach((level: any) =>
    level.forEach(
      (n: any) => (n.height = (Math.max(1, n.bundles.length) - 1) * metro_d),
    ),
  );

  let x_offset = padding + left_label_padding; // Add left padding for labels
  let y_offset = padding;
  tangledLevels.forEach((l: any, levelIndex: number) => {
    x_offset += (l.bundles?.length || 0) * bundle_width;
    y_offset += level_y_padding;

    // Apply cluster offset for level 1 (middle/cluster layer)
    if (levelIndex === 1) {
      y_offset += clusterYOffset;
    }

    // Group nodes with same bundle together while preserving original order within groups
    const bundleGroups: any = {};
    l.forEach((n: any, originalIndex: number) => {
      const bundleId = n.bundle?.id || `no-bundle-${originalIndex}`;
      if (!bundleGroups[bundleId]) {
        bundleGroups[bundleId] = [];
      }
      bundleGroups[bundleId].push({ node: n, originalIndex });
    });

    // Create ordered list: preserve original bundle order, but group same-bundle nodes together
    const sortedNodes: any[] = [];
    const processedBundles = new Set();

    l.forEach((n: any, i: number) => {
      const bundleId = n.bundle?.id || `no-bundle-${i}`;
      if (!processedBundles.has(bundleId)) {
        // Add all nodes with this bundle ID in their original relative order
        bundleGroups[bundleId]
          .sort((a: any, b: any) => a.originalIndex - b.originalIndex)
          .forEach((item: any) => sortedNodes.push(item.node));
        processedBundles.add(bundleId);
      }
    });

    sortedNodes.forEach((n: any) => {
      n.x = n.level * node_width + x_offset;
      n.y = node_height + y_offset + n.height / 2;

      y_offset += node_height + n.height;
    });
  });

  // Layout subtree levels (2+) as traditional tree structure
  if (hasSubtreeLevels) {
    const tangledWidth = x_offset + node_width;
    const subtreeStartX = tangledWidth + subtreeSpacing;
    const subtreeNodeSpacing = 20; // Vertical spacing between nodes in same subtree
    const minSubtreeGroupSpacing = 40; // Minimum spacing between different subtrees

    // Group all subtree nodes by their level 1 parents
    const parentGroups: any = {};
    subtreeLevels.forEach((level) => {
      level.forEach((node: any) => {
        node.parents.forEach((parent: any) => {
          if (parent.level === 1) {
            if (!parentGroups[parent.id]) {
              parentGroups[parent.id] = {
                parent: parent,
                children: [],
              };
            }
            parentGroups[parent.id].children.push(node);
          }
        });
      });
    });

    // Sort parent groups by their Y position to maintain visual order
    const sortedParentGroups = Object.values(parentGroups).sort(
      (a: any, b: any) => a.parent.y - b.parent.y,
    );

    // First pass: calculate subtree heights and ideal positions
    const subtreeInfos: any[] = [];

    sortedParentGroups.forEach((group: any) => {
      const parent = group.parent;
      const children = group.children;

      if (children.length === 0) return;

      // Create horizontal tree layout for this cluster
      const createHorizontalHierarchy = (nodes: any[]) => {
        const hierarchy: any = {
          id: "root",
          children: [],
        };

        // Group nodes by level for proper tree structure
        const nodesByLevel: any = {};
        nodes.forEach((node: any) => {
          if (!nodesByLevel[node.level]) {
            nodesByLevel[node.level] = [];
          }
          nodesByLevel[node.level].push(node);
        });

        const levels = Object.keys(nodesByLevel).sort(
          (a, b) => parseInt(a) - parseInt(b),
        );

        if (levels.length === 1) {
          // Single level - all nodes are direct children
          hierarchy.children = nodes.map((node: any) => ({
            id: node.id,
            data: node,
            children: [],
          }));
        } else {
          // Multiple levels - build proper parent-child relationships
          const nodeMap: any = {};

          nodes.forEach((node: any) => {
            nodeMap[node.id] = {
              id: node.id,
              data: node,
              children: [],
            };
          });

          nodes.forEach((node: any) => {
            const hasParentInSubtree = node.parents.some((p: any) =>
              nodes.includes(p),
            );
            if (!hasParentInSubtree) {
              hierarchy.children.push(nodeMap[node.id]);
            } else {
              node.parents.forEach((p: any) => {
                if (nodes.includes(p) && nodeMap[p.id]) {
                  nodeMap[p.id].children.push(nodeMap[node.id]);
                }
              });
            }
          });
        }

        return hierarchy;
      };

      const hierarchyData = createHorizontalHierarchy(children);
      const root = d3.hierarchy(hierarchyData);

      // Calculate horizontal tree dimensions
      const maxDepth = root.height;
      const subtreeWidth = Math.max(250, maxDepth * 120); // Horizontal spread
      const subtreeHeight = Math.max(60, children.length * subtreeNodeSpacing); // Vertical space needed

      // Create horizontal tree layout
      const treeLayout = d3
        .tree<any>()
        .size([subtreeHeight, subtreeWidth])
        .separation((a, b) => (a.parent === b.parent ? 1 : 1.2));

      const treeRoot = treeLayout(root);

      // Store subtree info for positioning
      subtreeInfos.push({
        group,
        parent,
        children,
        hierarchyData,
        root,
        treeRoot,
        subtreeWidth,
        subtreeHeight,
        idealCenterY: parent.y, // Center around parent cluster
      });
    });

    // Second pass: position subtrees efficiently from top
    let currentTopY = padding + 20; // Start near the top with small padding

    subtreeInfos.forEach((info) => {
      const { parent, treeRoot, subtreeHeight, idealCenterY } = info;

      // Try to position as close to ideal as possible, but prioritize compactness
      let finalTopY = Math.max(currentTopY, idealCenterY - subtreeHeight / 2);

      // If positioning at ideal would cause too much gap from current position,
      // place it closer to current position instead
      const gapFromCurrent = finalTopY - currentTopY;
      const maxAllowableGap = subtreeHeight * 1.5; // Allow some spacing but not too much

      if (gapFromCurrent > maxAllowableGap) {
        finalTopY = currentTopY;
      }

      const finalCenterY = finalTopY + subtreeHeight / 2;
      const finalBottomY = finalTopY + subtreeHeight;

      // Position nodes in the subtree
      const subtreeCenterOffset = finalCenterY - subtreeHeight / 2;

      // Update next position for the following subtree
      currentTopY = finalBottomY + minSubtreeGroupSpacing;

      treeRoot.descendants().forEach((treeNode: any) => {
        if (treeNode.data.data) {
          // Skip root node
          const node = treeNode.data.data;
          // For horizontal layout: x goes right (horizontal), y goes down (vertical)
          node.x = subtreeStartX + treeNode.y; // Horizontal position
          node.y = subtreeCenterOffset + treeNode.x; // Vertical position within subtree
          node.height = 0;

          // Store tree structure for link drawing
          node.treeParent = treeNode.parent?.data?.data || parent;

          // Mark root nodes for special styling
          if (treeNode.depth === 1) {
            // Direct children of root are subtree roots
            node.isSubtreeRoot = true;
          }
        }
      });
    });
  }

  let i = 0;
  let bundleYOffset = 0;
  tangledLevels.forEach((l: any, levelIndex: number) => {
    // Apply cluster offset to bundle positioning for level 1
    if (levelIndex === 1) {
      bundleYOffset += clusterYOffset;
    }

    (l.bundles || []).forEach((b: any) => {
      b.x =
        Number(d3.max(b.parents, (d: any) => d.x) || 0) +
        node_width +
        ((l.bundles?.length || 0) - 1 - b.i) * bundle_width;
      b.y = i * node_height + bundleYOffset;
    });
    i += l.length;
  });

  // Handle tangled tree links
  links.forEach((l: any) => {
    l.xt = l.target.x;
    l.yt =
      l.target.y +
      l.target.bundles_index[l.bundle.id].i * metro_d -
      (l.target.bundles.length * metro_d) / 2 +
      metro_d / 2;
    l.xb = l.bundle.x;
    l.yb = l.bundle.y;
    l.xs = l.source.x;
    l.ys = l.source.y;
  });
  // Handle subtree links (improved positioning)
  subtreeLinks.forEach((l: any) => {
    // For connections from level 1 clusters to subtree roots
    if (l.target.level === 1) {
      l.xt = l.target.x + node_width; // Start from right edge of parent cluster
      l.yt = l.target.y; // Align with center of cluster
      l.xs = l.source.x;
      l.ys = l.source.y; // Align with center of subtree root
    } else {
      // For internal subtree connections
      l.xt = l.target.x;
      l.yt = l.target.y;
      l.xs = l.source.x;
      l.ys = l.source.y;
    }
  });

  // compress vertical space (only for tangled levels)
  let y_negative_offset = 0;
  let compressionClusterOffset = 0;
  tangledLevels.forEach((l: any, levelIndex: number) => {
    // Track cluster offset for compression
    if (levelIndex === 1) {
      compressionClusterOffset = clusterYOffset;
    }

    const bundles = l.bundles || [];
    y_negative_offset +=
      -min_family_height +
      (d3.min(bundles, (b: any) =>
        d3.min(b.links, (link: any) => link.ys - 2 * c - (link.yt + c)),
      ) || 0);

    // Apply compression while preserving cluster offset
    l.forEach((n: any) => {
      n.y -= y_negative_offset;
      // Maintain cluster offset after compression for level 1
      if (levelIndex === 1) {
        n.y += compressionClusterOffset;
      }
    });
  });

  // very ugly, I know (comment from original Observable) - update tangled links after compression
  links.forEach((l: any) => {
    l.yt =
      l.target.y +
      l.target.bundles_index[l.bundle.id].i * metro_d -
      (l.target.bundles.length * metro_d) / 2 +
      metro_d / 2;
    l.ys = l.source.y;
    l.c1 =
      l.source.level - l.target.level > 1
        ? Math.min(options.bigc, l.xb - l.xt, l.yb - l.yt) - c
        : c;
    l.c2 = c;
  });

  const maxX = hasSubtreeLevels
    ? Math.max(
        d3.max(tangledLevels.flat(), (n: any) => n.x) || 0,
        d3.max(subtreeLevels.flat(), (n: any) => n.x) || 0,
      ) + 200 // Add extra space for horizontal subtree spread
    : d3.max(nodes, (n: any) => n.x) || 0;

  // Calculate the natural layout width
  const naturalWidth = maxX + node_width + padding + left_label_padding;

  // Use provided width if available, otherwise use natural width
  const finalWidth = options.width || naturalWidth;

  // If we're constraining the width and it's smaller than natural, we need to scale
  const shouldScale = options.width && options.width < naturalWidth;
  const scaleRatio = shouldScale ? options.width / naturalWidth : 1;

  const layout = {
    width: finalWidth,
    height:
      (d3.max(nodes, (n: any) => n.y) || 0) + node_height / 2 + 2 * padding,
    node_height,
    node_width,
    bundle_width,
    level_y_padding,
    metro_d,
    left_label_padding,
    scaleRatio,
    naturalWidth,
  };

  // Combine all links
  const allLinks = [...links, ...subtreeLinks];

  return {
    levels: levelsCopy,
    nodes,
    nodes_index,
    links: allLinks,
    bundles,
    layout,
  };
};

// React component for rendering bundle links - memoized for performance
const BundleLink: React.FC<{
  bundle: any;
  index: number;
  color: string;
  backgroundColor: string;
  highlightedLinks: Set<string>;
}> = React.memo(
  ({ bundle, index, color, backgroundColor, highlightedLinks }) => {
    return (
      <g key={`bundle-${index}`}>
        {bundle.links.map((link: any, linkIndex: number) => {
          const isHighlighted = highlightedLinks.has(link.id);
          const linkClassName = `link bundle-link ${isHighlighted ? "highlighted" : "dimmed"}`;

          const pathData = `
          M${link.xt} ${link.yt}
          L${link.xb - link.c1} ${link.yt}
          A${link.c1} ${link.c1} 90 0 1 ${link.xb} ${link.yt + link.c1}
          L${link.xb} ${link.ys - link.c2}
          A${link.c2} ${link.c2} 90 0 0 ${link.xb + link.c2} ${link.ys}
          L${link.xs} ${link.ys}
        `;

          return (
            <g key={`${link.id}-${linkIndex}`} className={linkClassName}>
              {/* Background stroke */}
              <path
                className="link-background"
                d={pathData}
                stroke={backgroundColor}
                strokeWidth="3"
                fill="none"
              />
              {/* Colored stroke */}
              <path
                className="link-foreground"
                d={pathData}
                stroke={color}
                strokeWidth="2"
                fill="none"
              />
            </g>
          );
        })}
      </g>
    );
  },
);

// React component for rendering subtree links - memoized for performance
const SubtreeLink: React.FC<{
  link: any;
  index: number;
  backgroundColor: string;
  isHighlighted: boolean;
}> = React.memo(({ link, index, isHighlighted }) => {
  let pathData;
  let strokeColor = "#666";
  let strokeWidth = 1.5;

  if (link.target.level === 1) {
    // Connection from cluster to subtree root - use smooth curved path
    const dx = link.xs - link.xt;
    const dy = link.ys - link.yt;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Create a smooth S-curve for cluster-to-subtree connections
    const controlPointOffset = Math.min(distance * 0.4, 60);
    const cp1x = link.xt + controlPointOffset;
    const cp1y = link.yt;
    const cp2x = link.xs - controlPointOffset;
    const cp2y = link.ys;

    pathData = `M${link.xt} ${link.yt} C${cp1x} ${cp1y} ${cp2x} ${cp2y} ${link.xs} ${link.ys}`;
    strokeColor = "#4a90e2"; // Blue for cluster connections
    strokeWidth = 2;
  } else {
    // Internal tree connections - use elegant curved lines
    const dx = link.xs - link.xt;

    // For horizontal trees, create smooth curves
    const controlOffset = Math.abs(dx) * 0.6;
    const cp1x = link.xt + controlOffset;
    const cp1y = link.yt;
    const cp2x = link.xs - Math.abs(dx) * 0.2;
    const cp2y = link.ys;

    pathData = `M${link.xt} ${link.yt} C${cp1x} ${cp1y} ${cp2x} ${cp2y} ${link.xs} ${link.ys}`;
    strokeColor = "#7fb069"; // Green for internal connections
    strokeWidth = 1.5;
  }

  const linkClassName = `link subtree-link ${isHighlighted ? "highlighted" : "dimmed"}`;

  return (
    <g key={`subtree-link-${index}`} className={linkClassName}>
      {/* Background stroke for better visibility */}
      <path
        className="link-background"
        d={pathData}
        stroke="white"
        strokeWidth={strokeWidth + 2}
        fill="none"
        strokeLinecap="round"
      />
      {/* Main colored stroke */}
      <path
        className="link-foreground"
        d={pathData}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        style={{
          filter:
            link.target.level === 1
              ? "drop-shadow(0px 1px 2px rgba(0,0,0,0.1))"
              : "none",
        }}
      />
    </g>
  );
});

// React component for rendering nodes - memoized for performance
const TangleNode: React.FC<{
  node: any;
  backgroundColor: string;
  getNodeColor: (node: any) => string;
  onMouseEnter?: (nodeId: string) => void;
  onMouseLeave?: () => void;
  isHighlighted: boolean;
  layoutInfo?: any; // Add layout info to access node_width
}> = React.memo(
  ({
    node,
    backgroundColor,
    getNodeColor,
    onMouseEnter,
    onMouseLeave,
    isHighlighted,
    layoutInfo,
  }) => {
    // Determine label position
    const isTopLevel = node.level === 0 || node.parents.length === 0;
    const isSubtreeNode = node.level >= 2;
    const isClusterNode = node.level === 1;
    const isSubtreeRoot = node.isSubtreeRoot;

    let textX, textY, textAnchor;

    if (isTopLevel) {
      textX = node.x - 12;
      textY = node.y + 4;
      textAnchor = "end";
    } else if (isSubtreeNode) {
      textX = node.x + 12;
      textY = node.y + 4;
      textAnchor = "start";
    } else {
      // Level 1 nodes
      textX = node.x + 6;
      textY = node.y - node.height / 2 + 4;
      textAnchor = "start";
    }

    // Calculate text dimensions for level 1 cluster rectangles
    const text = node.displaytext || node.id;
    const textLength = text.length * 6; // Rough approximation, 6px per character
    const textHeight = 12; // Font size + padding
    const rectPadding = 4;

    // Use layout node_width for cluster rectangles if available, otherwise use text-based width
    const clusterRectWidth =
      isClusterNode && layoutInfo?.node_width
        ? layoutInfo.node_width
        : Math.max(textLength + rectPadding * 2, 150); // Minimum width of 150px

    const rectWidth = isClusterNode
      ? clusterRectWidth
      : textLength + rectPadding * 2;
    const rectHeight = textHeight + rectPadding * 2;

    // Position rectangle based on text anchor
    let rectX;
    if (textAnchor === "start") {
      rectX = textX - rectPadding;
    } else if (textAnchor === "end") {
      rectX = textX - rectWidth + rectPadding;
    } else {
      rectX = textX - rectWidth / 2;
    }

    const rectY = textY - textHeight + rectPadding;

    return (
      <g
        key={`node-${node.id}`}
        className={`node-group ${isHighlighted ? "highlighted" : "dimmed"}`}
        style={{ cursor: "pointer" }}
        onMouseEnter={() => onMouseEnter?.(node.id)}
        onMouseLeave={() => onMouseLeave?.()}
      >
        {/* Node background stroke */}
        <path
          className="selectable node"
          data-id={node.id}
          stroke="black"
          strokeWidth="8"
          d={`M${node.x} ${node.y - node.height / 2} L${node.x} ${node.y + node.height / 2}`}
        />

        {/* Node foreground stroke */}
        <path
          className="node"
          stroke="white"
          strokeWidth="4"
          d={`M${node.x} ${node.y - node.height / 2} L${node.x} ${node.y + node.height / 2}`}
        />

        {/* Special circle for subtree root nodes */}
        {isSubtreeRoot && (
          <circle
            cx={node.x}
            cy={node.y}
            r="6"
            fill="#4a90e2"
            stroke="white"
            strokeWidth="2"
            style={{
              filter: "drop-shadow(0px 1px 3px rgba(0,0,0,0.2))",
            }}
          />
        )}

        {/* Cluster rectangle for level 1 nodes */}
        {isClusterNode && (
          <rect
            x={rectX}
            y={rectY}
            width={rectWidth}
            height={rectHeight}
            fill="white"
            stroke={getNodeColor(node)}
            strokeWidth="2"
            rx="3"
            ry="3"
          />
        )}

        {/* Text background stroke */}
        <text
          className="selectable"
          data-id={node.id}
          x={textX}
          y={isClusterNode ? textY + 4 : textY}
          textAnchor={textAnchor}
          stroke={backgroundColor}
          strokeWidth="2"
          style={{
            pointerEvents: "none",
            fontSize: isClusterNode ? "15px" : isSubtreeRoot ? "13px" : "11px",
            fontWeight: isSubtreeRoot ? "600" : "normal",
          }}
          fontFamily="sans-serif"
        >
          {text}
        </text>

        {/* Text foreground */}
        <text
          x={textX}
          y={isClusterNode ? textY + 4 : textY}
          textAnchor={textAnchor}
          fontFamily="sans-serif"
          style={{
            pointerEvents: "none",
            fontSize: isClusterNode ? "15px" : isSubtreeRoot ? "13px" : "11px",
            fontWeight: isSubtreeRoot ? "600" : "normal",
            fill: isSubtreeRoot ? "#2c3e50" : "black",
          }}
        >
          {text}
        </text>
      </g>
    );
  },
);

/**
 * TangleTree - A responsive tangled tree visualization component
 *
 * Features:
 * - Responsive layout that adapts to specified width
 * - Top-level parent node labels positioned on the left side
 * - Other node labels positioned above nodes
 * - Smooth curves connecting related nodes across levels
 * - Configurable cluster layer positioning
 *
 * @param data - Array of levels, each containing nodes with id, displaytext, and parents
 * @param title - Optional title for the visualization
 * @param subtitle - Optional subtitle for the visualization
 * @param width - Optional width in pixels for responsive layout
 * @param clusterYOffset - Optional Y offset for cluster layer (level 1) relative to first layer (default: -100px)
 * @param options - Optional styling and layout options
 */
const TangleTree: React.FC<TangleTreeProps> = ({
  data,
  title = "Tangled Tree Visualization",
  subtitle,
  options = {},
  width,
  clusterYOffset = -100,
}) => {
  // Add hover state
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Create color scale exactly as in Observable
  const colorScale = useMemo(() => d3.scaleOrdinal(d3.schemeDark2), []);
  const backgroundColor = "white";

  const tangleLayout = useMemo(() => {
    if (!data || data.length === 0) return null;

    const defaultOptions = {
      color: (_d: any, i: number) => colorScale(i.toString()),
      ...options,
      width,
      clusterYOffset,
    };

    return constructTangleLayout(data, defaultOptions);
  }, [data, options, colorScale, width, clusterYOffset]);

  const defaultColor = useMemo(
    () => options.color || ((_d: any, i: number) => colorScale(i.toString())),
    [options.color, colorScale],
  );

  // Function to get node color based on bundle
  const getNodeColor = useMemo(() => {
    return (node: any) => {
      if (node.bundle && tangleLayout) {
        // Find the bundle index to get the right color
        const bundleIndex = tangleLayout.bundles.findIndex(
          (b: any) => b.id === node.bundle.id,
        );
        return defaultColor(node.bundle, bundleIndex >= 0 ? bundleIndex : 0);
      }
      return defaultColor(node, 0);
    };
  }, [defaultColor, tangleLayout]);

  // Helper functions for hover highlighting
  const getConnectedNodeIds = useMemo(() => {
    if (!tangleLayout || !hoveredNodeId) return new Set<string>();

    const connectedIds = new Set<string>();
    connectedIds.add(hoveredNodeId);

    // Find connected nodes through links
    tangleLayout.links.forEach((link: any) => {
      if (link.source.id === hoveredNodeId) {
        connectedIds.add(link.target.id);
      }
      if (link.target.id === hoveredNodeId) {
        connectedIds.add(link.source.id);
      }
    });

    return connectedIds;
  }, [tangleLayout, hoveredNodeId]);

  // Memoized functions for better performance
  const isNodeHighlighted = useCallback(
    (nodeId: string) => {
      if (!hoveredNodeId) return true;
      return getConnectedNodeIds.has(nodeId);
    },
    [hoveredNodeId, getConnectedNodeIds],
  );

  const isLinkHighlighted = useCallback(
    (link: any) => {
      if (!hoveredNodeId) return true;
      return (
        link.source.id === hoveredNodeId || link.target.id === hoveredNodeId
      );
    },
    [hoveredNodeId],
  );

  const getHighlightedLinksInBundle = useCallback(
    (bundle: any): Set<string> => {
      if (!hoveredNodeId) {
        return new Set(
          bundle.links
            .filter((link: any) => link.id && typeof link.id === "string")
            .map((link: any) => link.id),
        );
      }
      return new Set(
        bundle.links
          .filter(
            (link: any) =>
              link.id && typeof link.id === "string" && isLinkHighlighted(link),
          )
          .map((link: any) => link.id),
      );
    },
    [hoveredNodeId, isLinkHighlighted],
  );

  const handleNodeMouseEnter = useCallback((nodeId: string) => {
    setHoveredNodeId(nodeId);
  }, []);

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  if (!tangleLayout) {
    return (
      <FullWidthContent>
        <PageContainer>
          <Title>{title}</Title>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
          <ChartContainer width={width}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "300px",
                color: "#7f8c8d",
              }}
            >
              Loading tangle layout...
            </div>
          </ChartContainer>
        </PageContainer>
      </FullWidthContent>
    );
  }

  const subtreeLinks = tangleLayout.links.filter(
    (l: any) => l.type === "subtree",
  );

  return (
    <FullWidthContent>
      <PageContainer>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
        <ChartContainer width={width}>
          <ChartHeader>
            <ChartTitle>
              {data.length} Levels •{" "}
              {data.reduce((sum, level) => sum + level.length, 0)} Total Nodes
            </ChartTitle>
          </ChartHeader>
          <SVGContainer width={width}>
            <svg
              width={width || tangleLayout.layout.width}
              height={tangleLayout.layout.height}
              viewBox={`0 0 ${tangleLayout.layout.naturalWidth || tangleLayout.layout.width} ${tangleLayout.layout.height}`}
              style={{
                backgroundColor: backgroundColor,
                border: "1px solid #ddd",
                borderRadius: "4px",
                maxWidth: "100%",
                height: "auto",
              }}
            >
              <defs>
                <style>
                  {`
                    text {
                      font-family: sans-serif;
                      font-size: 10px;
                    }
                    .node {
                      stroke-linecap: round;
                    }
                    .link {
                      fill: none;
                    }
                    
                    /* Performance optimized hover effects using CSS transitions */
                    .node-group, .link, .bundle-link, .subtree-link {
                      transition: opacity 0.15s ease-out;
                    }
                    
                    .node-group.highlighted, .bundle-link.highlighted, .subtree-link.highlighted {
                      opacity: 1;
                    }
                    
                    .node-group.dimmed, .bundle-link.dimmed, .subtree-link.dimmed {
                      opacity: 0.25;
                    }
                    
                    /* Default state - show all elements */
                    .node-group:not(.highlighted):not(.dimmed),
                    .bundle-link:not(.highlighted):not(.dimmed),
                    .subtree-link:not(.highlighted):not(.dimmed) {
                      opacity: 1;
                    }
                  `}
                </style>
              </defs>

              {/* Render bundle links */}
              {tangleLayout.bundles.map((bundle: any, i: number) => (
                <BundleLink
                  key={`bundle-${i}`}
                  bundle={bundle}
                  index={i}
                  color={defaultColor(bundle, i)}
                  backgroundColor={backgroundColor}
                  highlightedLinks={getHighlightedLinksInBundle(bundle)}
                />
              ))}

              {/* Render subtree links */}
              {subtreeLinks.map((link: any, i: number) => (
                <SubtreeLink
                  key={`subtree-${i}`}
                  link={link}
                  index={i}
                  backgroundColor={backgroundColor}
                  isHighlighted={isLinkHighlighted(link)}
                />
              ))}

              {/* Render nodes */}
              {tangleLayout.nodes.map((node: any) => (
                <TangleNode
                  key={node.id}
                  node={node}
                  backgroundColor={backgroundColor}
                  getNodeColor={getNodeColor}
                  onMouseEnter={handleNodeMouseEnter}
                  onMouseLeave={handleNodeMouseLeave}
                  isHighlighted={isNodeHighlighted(node.id)}
                  layoutInfo={tangleLayout.layout}
                />
              ))}
            </svg>
          </SVGContainer>
        </ChartContainer>
      </PageContainer>
    </FullWidthContent>
  );
};

export default TangleTree;
