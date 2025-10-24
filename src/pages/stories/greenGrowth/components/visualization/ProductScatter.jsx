import { useMemo, useEffect, useRef } from "react";
import { ParentSize } from "@visx/responsive";
import { scaleSequential, scaleLinear } from "d3-scale";
import { interpolateRdYlBu } from "d3-scale-chromatic";
import { animated, useTransition } from "@react-spring/web";
import BookmarkIcon from "@mui/icons-material/Bookmark";

import { extent } from "d3-array";
import { useProductLookup } from "../../queries/products";
import { useSupplyChainProductLookup } from "../../queries/supplyChainProducts";
import { useCountryName } from "../../queries/useCountryName";
import {
  useCountrySelection,
  useYearSelection,
} from "../../hooks/useUrlParams";
import { useGreenGrowthData } from "../../hooks/useGreenGrowthData";
import { useImageCaptureContext } from "../../hooks/useImageCaptureContext";

import { Typography, Box, useMediaQuery, useTheme } from "@mui/material";
import { useTooltip, TooltipWithBounds } from "@visx/tooltip";
import { localPoint } from "@visx/event";

import TableWrapper from "../shared/TableWrapper";
import { SharedTooltip } from "../shared";
import GGTooltip from "../shared/GGTooltip";
import { getTerm } from "../../utils/terms";
import html2canvas from "html2canvas";
import ClickHint from "../../../../../components/general/ClickHint";
import { useSelectionDataModal } from "../../hooks/useSelectionDataModal";
import { useStrategicPosition } from "../../hooks/useStrategicPosition";
import { calculateTopRightScore } from "../../utils/rankings";

const createUniqueProductKey = (product) => {
  return `${product}`;
};

// Helper function to get color based on potential score using D3 RdYlBu (same as ClusterTree)
const getPotentialColor = (score, minScore, maxScore) => {
  const scoreRange = maxScore - minScore;
  if (scoreRange === 0) return "#4A90E2"; // Default blue if all scores are the same

  // Create D3 sequential color scale using RdYlBu (red → yellow → blue)
  // High potential (higher scores) map to blue; low potential to red
  const colorScale = scaleSequential(interpolateRdYlBu).domain([
    minScore,
    maxScore,
  ]);

  return colorScale(score);
};

// Custom scatter plot component with force-directed labels
const CustomScatterPlot = ({
  data,
  width,
  height,
  margin,
  viewMode,
  topItemsMap,
  onTooltip,
  isMobile,
}) => {
  const svgRef = useRef();
  const { openSelectionModal } = useSelectionDataModal();

  // Create scales
  const xScale = useMemo(() => {
    const [minX, maxX] = extent(data, (d) => d.density);
    return scaleLinear()
      .domain([minX || 0, maxX || 1])
      .range([margin.left, width - margin.right])
      .nice();
  }, [data, width, margin.left, margin.right]);

  const yScale = useMemo(() => {
    const [minY, maxY] = extent(data, (d) => d.attractiveness);
    return scaleLinear()
      .domain([minY || 0, maxY || 1])
      .range([height - margin.bottom, margin.top])
      .nice();
  }, [data, height, margin.top, margin.bottom]);

  // Get top items with pixel coordinates
  const topItemsWithCoords = useMemo(() => {
    return data
      .filter((d) => topItemsMap.has(d.uniqueKey))
      .map((d) => ({
        ...d,
        pixelX: xScale(d.density),
        pixelY: yScale(d.attractiveness),
      }));
  }, [data, topItemsMap, xScale, yScale]);

  // Memoized simulated annealing for stable label positioning
  const labelPositions = useMemo(() => {
    if (topItemsWithCoords.length === 0) return new Map();

    // Define visualization boundaries with proper label space
    const boundaryMargin = 20; // Increased margin
    const labelMaxWidth = 200; // Increased for larger font size
    const labelHeight = 20; // Increased for 16px font

    const leftBound = margin.left + boundaryMargin;
    const rightBound = width - margin.right - boundaryMargin - labelMaxWidth; // Account for full label width
    const topBound = margin.top + boundaryMargin + labelHeight; // Account for label height - uses new larger margin
    const bottomBound = height - margin.bottom - boundaryMargin;

    // Create label and anchor arrays for simulated annealing
    const labels = [];
    const anchors = [];

    // Deterministic seeded random for consistent results
    const seedRandom = (seed) => {
      let s = seed;
      return () => {
        s = Math.sin(s) * 10000;
        return s - Math.floor(s);
      };
    };

    // Create seed from data characteristics for consistency
    const dataSeed = topItemsWithCoords.reduce(
      (acc, point) => acc + point.pixelX + point.pixelY,
      0,
    );
    const random = seedRandom(dataSeed);

    topItemsWithCoords.forEach((point, index) => {
      const labelWidth = 200; // Increased for larger font size
      const labelHeight = 20; // Increased for 16px font

      // Anchor (data point)
      anchors.push({
        x: point.pixelX,
        y: point.pixelY,
        r: (point.nodeSize || 6) + 12, // Circle radius + buffer
        uniqueKey: point.uniqueKey,
      });

      // Better initial positioning - radial placement around data point
      const angle = index * 2.4 + random() * 0.5; // Deterministic but varied angles
      const radius = 40 + random() * 20; // 40-60px from center
      let initialX = point.pixelX + Math.cos(angle) * radius;
      let initialY = point.pixelY + Math.sin(angle) * radius;

      // Ensure initial position is within bounds
      initialX = Math.max(leftBound, Math.min(rightBound, initialX));
      initialY = Math.max(topBound, Math.min(bottomBound, initialY));

      labels.push({
        x: initialX,
        y: initialY,
        width: labelWidth,
        height: labelHeight,
        uniqueKey: point.uniqueKey,
      });
    });

    // Simulated Annealing Energy Function
    const calculateEnergy = (labelIndex) => {
      const label = labels[labelIndex];
      const anchor = anchors[labelIndex];
      let energy = 0;

      // 1. Leader line length penalty
      // Calculate distance to center of label instead of start
      const labelCenterX = label.x + label.width / 2;
      const labelCenterY = label.y - label.height / 2;
      const dx = labelCenterX - anchor.x;
      const dy = labelCenterY - anchor.y;
      const leaderLength = Math.sqrt(dx * dx + dy * dy);
      energy += leaderLength * 4; // w_len = 0.6 (moderate penalty for distance)

      // 2. Angular distribution preference (spread labels radially)
      let angularPenalty = 0;

      // Calculate angle for this label
      const labelAngle = Math.atan2(dy, dx);

      // Check angular crowding with other labels from nearby anchors
      for (let i = 0; i < labels.length; i++) {
        if (i === labelIndex) continue;

        const otherLabel = labels[i];
        const otherAnchor = anchors[i];

        // Only consider other anchors that are close to this anchor
        const anchorDistance = Math.sqrt(
          Math.pow(otherAnchor.x - anchor.x, 2) +
            Math.pow(otherAnchor.y - anchor.y, 2),
        );

        if (anchorDistance < 100) {
          // Within 100px
          const otherLabelCenterX = otherLabel.x + otherLabel.width / 2;
          const otherLabelCenterY = otherLabel.y - otherLabel.height / 2;
          const otherDx = otherLabelCenterX - otherAnchor.x;
          const otherDy = otherLabelCenterY - otherAnchor.y;
          const otherAngle = Math.atan2(otherDy, otherDx);

          // Calculate angular difference
          let angleDiff = Math.abs(labelAngle - otherAngle);
          if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

          // Penalty for labels pointing in similar directions from nearby anchors
          if (angleDiff < Math.PI / 3) {
            // Within 60 degrees
            angularPenalty += (Math.PI / 3 - angleDiff) * 0.5;
          }
        }
      }

      energy += angularPenalty;

      // 4. Label-label overlap penalty
      const x1 = label.x;
      const y1 = label.y - label.height;
      const x2 = label.x + label.width;
      const y2 = label.y;

      for (let i = 0; i < labels.length; i++) {
        if (i === labelIndex) continue;

        const otherLabel = labels[i];
        const ox1 = otherLabel.x;
        const oy1 = otherLabel.y - otherLabel.height;
        const ox2 = otherLabel.x + otherLabel.width;
        const oy2 = otherLabel.y;

        // Rectangle intersection penalty (actual overlap)
        const xOverlap = Math.max(0, Math.min(x2, ox2) - Math.max(x1, ox1));
        const yOverlap = Math.max(0, Math.min(y2, oy2) - Math.max(y1, oy1));
        const overlapArea = xOverlap * yOverlap;
        energy += overlapArea * 50; // w_lab2 = 50

        // Proximity penalty (labels too close but not overlapping)
        const centerX1 = label.x + label.width / 2;
        const centerY1 = label.y - label.height / 2;
        const centerX2 = otherLabel.x + otherLabel.width / 2;
        const centerY2 = otherLabel.y - otherLabel.height / 2;

        const distance = Math.sqrt(
          Math.pow(centerX2 - centerX1, 2) + Math.pow(centerY2 - centerY1, 2),
        );

        // Personal space buffer - penalty when labels are closer than desired
        const minDesiredDistance = 35; // Increased comfortable distance between label centers
        if (distance < minDesiredDistance && distance > 0) {
          const proximityPenalty =
            Math.pow(minDesiredDistance - distance, 2) * 1.0; // Increased weight for better spacing
          energy += proximityPenalty; // w_proximity = 1.0
        }
      }

      // 5. Label-anchor overlap penalty
      for (let i = 0; i < anchors.length; i++) {
        const otherAnchor = anchors[i];

        // Proper rectangle-circle intersection detection
        if (
          rectangleIntersectsCircle(
            x1,
            y1,
            x2,
            y2,
            otherAnchor.x,
            otherAnchor.y,
            otherAnchor.r,
          )
        ) {
          // Calculate overlap severity based on how much the circle penetrates the rectangle
          const overlapSeverity = calculateRectCircleOverlapSeverity(
            x1,
            y1,
            x2,
            y2,
            otherAnchor.x,
            otherAnchor.y,
            otherAnchor.r,
          );
          energy += overlapSeverity * 40; // w_lab_anc = 40
        }
      }

      // 6. Leader line intersection penalty
      for (let i = 0; i < labels.length; i++) {
        if (i === labelIndex) continue;

        const otherLabel = labels[i];
        const otherAnchor = anchors[i];

        // Check if leader lines intersect
        if (
          linesIntersect(
            anchor.x,
            anchor.y,
            labelCenterX,
            labelCenterY,
            otherAnchor.x,
            otherAnchor.y,
            otherLabel.x + otherLabel.width / 2,
            otherLabel.y - otherLabel.height / 2,
          )
        ) {
          energy += 5; // w_inter = 5
        }
      }

      // 7. Leader line-circle intersection penalty
      for (let i = 0; i < anchors.length; i++) {
        if (i === labelIndex) continue;

        const otherAnchor = anchors[i];

        // Check if this leader line intersects with other circles
        if (
          lineIntersectsCircle(
            anchor.x,
            anchor.y,
            labelCenterX,
            labelCenterY,
            otherAnchor.x,
            otherAnchor.y,
            otherAnchor.r,
          )
        ) {
          energy += 8; // Higher penalty for crossing through data points
        }
      }

      return energy;
    };

    // Line intersection detection
    const linesIntersect = (x1, y1, x2, y2, x3, y3, x4, y4) => {
      const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
      if (Math.abs(denom) < 1e-10) return false;

      const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
      const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

      return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
    };

    // Line-circle intersection detection
    const lineIntersectsCircle = (x1, y1, x2, y2, cx, cy, r) => {
      // Vector from start to end of line
      const dx = x2 - x1;
      const dy = y2 - y1;

      // Vector from start of line to circle center
      const fx = x1 - cx;
      const fy = y1 - cy;

      // Quadratic equation coefficients for line-circle intersection
      const a = dx * dx + dy * dy;
      const b = 2 * (fx * dx + fy * dy);
      const c = fx * fx + fy * fy - r * r;

      const discriminant = b * b - 4 * a * c;

      // No intersection if discriminant is negative
      if (discriminant < 0) return false;

      // Check if intersection points are within the line segment
      const sqrtDiscriminant = Math.sqrt(discriminant);
      const t1 = (-b - sqrtDiscriminant) / (2 * a);
      const t2 = (-b + sqrtDiscriminant) / (2 * a);

      // Intersection occurs if either t value is between 0 and 1
      return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1) || (t1 < 0 && t2 > 1);
    };

    // Rectangle-circle intersection detection
    const rectangleIntersectsCircle = (
      rectX1,
      rectY1,
      rectX2,
      rectY2,
      circleX,
      circleY,
      radius,
    ) => {
      // Find the closest point on the rectangle to the circle center
      const closestX = Math.max(rectX1, Math.min(circleX, rectX2));
      const closestY = Math.max(rectY1, Math.min(circleY, rectY2));

      // Calculate distance from circle center to closest point
      const distanceX = circleX - closestX;
      const distanceY = circleY - closestY;
      const distanceSquared = distanceX * distanceX + distanceY * distanceY;

      // Intersection occurs if distance is less than or equal to radius
      return distanceSquared <= radius * radius;
    };

    // Calculate overlap severity for rectangle-circle intersection
    const calculateRectCircleOverlapSeverity = (
      rectX1,
      rectY1,
      rectX2,
      rectY2,
      circleX,
      circleY,
      radius,
    ) => {
      // Find the closest point on the rectangle to the circle center
      const closestX = Math.max(rectX1, Math.min(circleX, rectX2));
      const closestY = Math.max(rectY1, Math.min(circleY, rectY2));

      // Calculate distance from circle center to closest point
      const distance = Math.sqrt(
        Math.pow(circleX - closestX, 2) + Math.pow(circleY - closestY, 2),
      );

      // Calculate penetration depth (how much the circle overlaps the rectangle)
      const penetration = Math.max(0, radius - distance);

      // Return a severity score based on penetration depth
      // More penetration = higher severity
      return penetration * penetration; // Quadratic penalty for deeper overlaps
    };

    // Monte Carlo move function with seeded random
    const makeMove = (currentTemp, random) => {
      const labelIndex = Math.floor(random() * labels.length);
      const label = labels[labelIndex];

      // Save old position
      const oldX = label.x;
      const oldY = label.y;

      // Calculate old energy
      const oldEnergy = calculateEnergy(labelIndex);

      // Temperature-based movement strategy for better exploration
      const tempRatio = currentTemp / 80.0; // Normalize temperature (80.0 is initial temp)

      if (tempRatio > 0.7) {
        // HIGH HEAT PHASE: Aggressive exploration - can jump anywhere around the anchor
        const anchor = anchors[labelIndex];
        const jumpChance = 0.3; // 30% chance of big jump during high heat

        if (random() < jumpChance) {
          // JUMP MOVE: Relocate to a completely new position around the anchor
          const jumpAngle = random() * 2 * Math.PI;
          const jumpRadius = 30 + random() * 120; // Jump 30-150px from anchor

          label.x = anchor.x + Math.cos(jumpAngle) * jumpRadius;
          label.y = anchor.y + Math.sin(jumpAngle) * jumpRadius;
        } else {
          // Large random move
          const maxMove = currentTemp * 1.5; // Much more aggressive (was 0.5)
          label.x += (random() - 0.5) * maxMove;
          label.y += (random() - 0.5) * maxMove;
        }
      } else if (tempRatio > 0.3) {
        // MEDIUM HEAT PHASE: Moderate exploration
        const maxMove = currentTemp * 1.0; // Still more aggressive than before
        label.x += (random() - 0.5) * maxMove;
        label.y += (random() - 0.5) * maxMove;
      } else {
        // LOW HEAT PHASE: Fine-tuning moves
        const maxMove = Math.max(3, currentTemp * 0.8);
        label.x += (random() - 0.5) * maxMove;
        label.y += (random() - 0.5) * maxMove;
      }

      // Strict boundary enforcement - ensure labels stay fully within plot area
      const minX = leftBound;
      const maxX = rightBound;
      const minY = topBound;
      const maxY = bottomBound;

      // Clamp label position so entire label rectangle stays in bounds
      label.x = Math.max(minX, Math.min(maxX, label.x));
      label.y = Math.max(minY, Math.min(maxY, label.y));

      // Double-check: if label would extend outside, pull it back
      if (label.x + label.width > width - margin.right - boundaryMargin) {
        label.x = width - margin.right - boundaryMargin - label.width;
      }
      if (label.y - label.height < margin.top + boundaryMargin) {
        label.y = margin.top + boundaryMargin + label.height;
      }

      // Calculate new energy
      const newEnergy = calculateEnergy(labelIndex);
      const deltaEnergy = newEnergy - oldEnergy;

      // Accept or reject move
      if (deltaEnergy <= 0 || random() < Math.exp(-deltaEnergy / currentTemp)) {
        // Accept move - keep new position
        return true;
      } else {
        // Reject move - restore old position
        label.x = oldX;
        label.y = oldY;
        return false;
      }
    };

    // Multi-restart simulated annealing for better consistency
    const runOptimization = (seedOffset = 0) => {
      const restartRandom = seedRandom(dataSeed + seedOffset);

      // Reset positions to initial state
      topItemsWithCoords.forEach((point, index) => {
        const angle = index * 2.4 + restartRandom() * 0.5;
        const radius = 40 + restartRandom() * 20;
        let initialX = point.pixelX + Math.cos(angle) * radius;
        let initialY = point.pixelY + Math.sin(angle) * radius;

        initialX = Math.max(leftBound, Math.min(rightBound, initialX));
        initialY = Math.max(topBound, Math.min(bottomBound, initialY));

        labels[index].x = initialX;
        labels[index].y = initialY;
      });

      // Improved annealing parameters for better exploration
      const initialTemp = 80.0; // Higher initial temp for more aggressive exploration
      const finalTemp = 0.1; // Higher final temp to avoid getting stuck
      const coolingRate = 0.88; // Slower cooling for better exploration
      const iterationsPerTemp = labels.length * 35; // More iterations for exploration

      let currentTemp = initialTemp;
      let acceptedMoves = 0;
      let totalMoves = 0;

      while (currentTemp > finalTemp) {
        for (let i = 0; i < iterationsPerTemp; i++) {
          if (makeMove(currentTemp, restartRandom)) acceptedMoves++;
          totalMoves++;
        }
        currentTemp *= coolingRate;
      }

      // Calculate total energy of this solution
      let totalEnergy = 0;
      for (let i = 0; i < labels.length; i++) {
        totalEnergy += calculateEnergy(i);
      }

      return {
        labels: labels.map((l) => ({ ...l })), // Deep copy
        energy: totalEnergy,
        acceptedMoves,
        totalMoves,
      };
    };

    // Run multiple optimizations and pick the best
    // With aggressive exploration, each restart can find very different solutions
    const numRestarts = 5;
    let bestSolution = runOptimization(0);

    for (let restart = 1; restart < numRestarts; restart++) {
      const solution = runOptimization(restart * 1000);
      if (solution.energy < bestSolution.energy) {
        bestSolution = solution;
      }
    }

    // Apply best solution
    bestSolution.labels.forEach((bestLabel, index) => {
      labels[index].x = bestLabel.x;
      labels[index].y = bestLabel.y;
    });

    console.log(
      `Label optimization: Best of ${numRestarts} runs with aggressive exploration`,
      `${bestSolution.acceptedMoves}/${bestSolution.totalMoves} moves accepted, final energy: ${bestSolution.energy.toFixed(2)}`,
    );

    // Final safety check: ensure all labels are within bounds
    labels.forEach((label) => {
      label.x = Math.max(leftBound, Math.min(rightBound, label.x));
      label.y = Math.max(topBound, Math.min(bottomBound, label.y));

      // Ensure label doesn't extend beyond plot area
      if (label.x + label.width > width - margin.right - boundaryMargin) {
        label.x = width - margin.right - boundaryMargin - label.width;
      }
      if (label.y - label.height < margin.top + boundaryMargin) {
        label.y = margin.top + boundaryMargin + label.height;
      }
    });

    // Convert results to the expected format
    const positions = new Map();
    labels.forEach((label, index) => {
      const anchor = anchors[index];
      positions.set(label.uniqueKey, {
        x: label.x,
        y: label.y,
        dataX: anchor.x,
        dataY: anchor.y,
      });
    });

    return positions;
  }, [topItemsWithCoords, width, height, margin]);

  // Grid lines
  const xGridLines = xScale.ticks(6);
  const yGridLines = yScale.ticks(6);

  // Prepare data for transitions with positions
  const circleData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      x: xScale(d.density),
      y: yScale(d.attractiveness),
      isTop: topItemsMap.has(d.uniqueKey),
    }));
  }, [data, xScale, yScale, topItemsMap]);

  const labelData = useMemo(() => {
    return Array.from(labelPositions.entries())
      .map(([uniqueKey, position]) => {
        const item = data.find((d) => d.uniqueKey === uniqueKey);
        if (!item) return null;

        const displayName =
          viewMode === "cluster" ? item.clusterName : item.productName;
        const textWidth = Math.min(
          displayName.length * (isMobile ? 7.5 : 9.5),
          isMobile ? 180 : 200,
        );
        const truncatedName =
          displayName.length > (isMobile ? 18 : 16)
            ? `${displayName.substring(0, isMobile ? 22 : 20)}...`
            : displayName;

        return {
          uniqueKey,
          position,
          item,
          displayName,
          textWidth,
          truncatedName,
        };
      })
      .filter(Boolean);
  }, [labelPositions, data, viewMode, isMobile]);

  // Transitions for data points (circles)
  const circleTransitions = useTransition(circleData, {
    keys: (item) => item.uniqueKey,
    from: (item) => ({
      cx: item.x,
      cy: item.y,
      opacity: 0,
      r: 0,
    }),
    enter: (item) => ({
      cx: item.x,
      cy: item.y,
      opacity: item.isTop ? 0.9 : 0.4,
      r: item.nodeSize || 6,
    }),
    update: (item) => ({
      cx: item.x,
      cy: item.y,
      opacity: item.isTop ? 0.9 : 0.4,
      r: item.nodeSize || 6,
    }),
    leave: () => ({
      opacity: 0,
      r: 0,
    }),
    config: { tension: 300, friction: 30 },
  });

  // Transitions for labels
  const labelTransitions = useTransition(labelData, {
    keys: (item) => item.uniqueKey,
    from: (item) => ({
      x: item.position.x,
      y: item.position.y,
      dataX: item.position.dataX,
      dataY: item.position.dataY,
      opacity: 0,
    }),
    enter: (item) => ({
      x: item.position.x,
      y: item.position.y,
      dataX: item.position.dataX,
      dataY: item.position.dataY,
      opacity: 1,
    }),
    update: (item) => ({
      x: item.position.x,
      y: item.position.y,
      dataX: item.position.dataX,
      dataY: item.position.dataY,
      opacity: 1,
    }),
    leave: () => ({
      opacity: 0,
    }),
    config: { tension: 300, friction: 30 },
  });

  return (
    <div style={{ position: "relative", width, height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        role="img"
        aria-label="Green Value Chains Scatter Plot"
        aria-describedby="product-scatter-desc"
      >
        <desc id="product-scatter-desc">
          Scatter plot of products in green value chains with axes for the
          chosen variables. Hover or focus a point to view its details.
        </desc>
        <defs>
          {/* Clip path to prevent nodes overflowing past axes */}
          <clipPath id="scatter-clip">
            <rect
              x={margin.left}
              y={margin.top}
              width={Math.max(0, width - margin.left - margin.right)}
              height={Math.max(0, height - margin.top - margin.bottom)}
            />
          </clipPath>
        </defs>

        {/* Click hint row - positioned at top */}
        <g transform={`translate(0, ${margin.top - 40})`}>
          <ClickHint
            text="Click on a cluster to see its products"
            x={margin.left}
            y={0}
          />
        </g>
        {/* Grid */}
        <g className="grid">
          {xGridLines.map((tick) => (
            <line
              key={`x-grid-${tick}`}
              x1={xScale(tick)}
              y1={margin.top}
              x2={xScale(tick)}
              y2={height - margin.bottom}
              stroke="rgb(223,223,223)"
              strokeWidth={1}
            />
          ))}
          {yGridLines.map((tick) => (
            <line
              key={`y-grid-${tick}`}
              x1={margin.left}
              y1={yScale(tick)}
              x2={width - margin.right}
              y2={yScale(tick)}
              stroke="rgb(223,223,223)"
              strokeWidth={1}
            />
          ))}
        </g>

        {/* Data points */}
        <g className="data-points" clipPath="url(#scatter-clip)">
          {circleTransitions((style, item) => {
            const strokeOpacity = item.isTop ? 0.9 : 0.4;

            return (
              <animated.circle
                cx={style.cx}
                cy={style.cy}
                r={10}
                fillOpacity={style.opacity}
                fill={item.color || "#4A90E2"}
                stroke="#000"
                strokeWidth={1}
                strokeOpacity={strokeOpacity}
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) => onTooltip?.(e, item)}
                onMouseLeave={() => onTooltip?.(null)}
                onClick={() => {
                  if (viewMode === "cluster") {
                    openSelectionModal({
                      type: "cluster",
                      clusterId: item.clusterId,
                      title: item.clusterName,
                      source: "product-scatter",
                      detailLevel: "full",
                    });
                  } else {
                    const id = String(item.product || "").match(/\d+/)?.[0];
                    if (id) {
                      openSelectionModal({
                        type: "product",
                        productId: Number(id),
                        title: item.productName,
                        source: "product-scatter",
                        detailLevel: "full",
                      });
                    }
                  }
                }}
              />
            );
          })}
        </g>

        {/* Labels */}
        <g className="labels">
          {labelTransitions((style, item) => (
            <animated.g
              opacity={style.opacity}
              style={{ pointerEvents: "none" }}
            >
              {/* Connection line */}
              <animated.line
                x1={style.dataX}
                y1={style.dataY}
                x2={style.x.to((x) => x + item.textWidth / 2)}
                y2={style.y.to((y) => y - 7)}
                stroke="rgba(0, 0, 0, 0.4)"
                strokeWidth={1}
                strokeDasharray="2,2"
              />

              {/* Label text with white stroke outline */}
              <animated.text
                x={style.x}
                y={style.y}
                fontSize={isMobile ? "12" : "16"}
                fontWeight="600"
                fill="rgba(0, 0, 0, 0.8)"
                stroke="white"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
                paintOrder="stroke fill"
                textAnchor="start"
                dominantBaseline="middle"
              >
                {item.truncatedName}
              </animated.text>
            </animated.g>
          ))}
        </g>

        {/* Axes - lines only */}
        <g className="x-axis">
          <line
            x1={margin.left}
            y1={height - margin.bottom}
            x2={width - margin.right}
            y2={height - margin.bottom}
            stroke="#333"
            strokeWidth={2}
          />
        </g>

        <g className="y-axis">
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={height - margin.bottom}
            stroke="#333"
            strokeWidth={2}
          />
        </g>
      </svg>

      {/* HTML Overlay for Axis Labels */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        {/* X-axis label with underline and tooltip */}
        <GGTooltip title={getTerm("feasibility").description}>
          <div
            style={{
              position: "absolute",
              left: "50%",
              // Match StrategicPositionChart placement: centered below plot frame
              top: `${height - margin.bottom + 10}px`,
              transform: "translateX(-50%)",
              fontSize: isMobile ? "0.75rem" : "1rem",
              fontWeight: "600",
              color: "black",
              textAlign: "center",
              cursor: "help",
              pointerEvents: "auto",
              borderBottom: "1px solid black",
            }}
          >
            Feasibility
          </div>
        </GGTooltip>

        {/* X-axis directional arrows */}
        {!isMobile && (
          <>
            <div
              style={{
                position: "absolute",
                left: "50%",
                // Match StrategicPositionChart arrow offset relative to plot bottom
                top: `${height - margin.bottom + 34}px`,
                transform: "translateX(-50%) translateX(-100px)",
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "#2685bd",
                textAlign: "center",
              }}
            >
              ← Less Feasible
            </div>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: `${height - margin.bottom + 34}px`,
                transform: "translateX(-50%) translateX(100px)",
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "#2685bd",
                textAlign: "center",
              }}
            >
              More Feasible →
            </div>
          </>
        )}

        {/* Y-axis label with underline and tooltip */}
        <GGTooltip title={getTerm("attractiveness").description}>
          <div
            style={{
              position: "absolute",
              // Align with StrategicPositionChart left padding for y-axis label
              left: 0,
              // Center vertically to the plot frame
              top: `${margin.top + (height - margin.top - margin.bottom) / 2}px`,
              transform: "rotate(-90deg)",
              fontSize: isMobile ? "0.75rem" : "1rem",
              fontWeight: "600",
              color: "black",
              textAlign: "center",
              transformOrigin: "center",
              cursor: "help",
              pointerEvents: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                borderBottom: "1px solid black",
              }}
            >
              Attractiveness
            </div>
          </div>
        </GGTooltip>

        {/* Y-axis directional arrows */}
        {!isMobile && (
          <>
            <div
              style={{
                position: "absolute",
                // Match StrategicPositionChart arrow x-position inside label area
                left: "-40px",
                // Center relative to plot frame and offset upward
                top: `${margin.top + (height - margin.top - margin.bottom) / 2}px`,
                transform: `translateY(-100px) rotate(-90deg)`,
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "#2685bd",
                textAlign: "center",
                transformOrigin: "center",
              }}
            >
              More Attractive →
            </div>
            <div
              style={{
                position: "absolute",
                left: "-40px",
                // Center relative to plot frame and offset downward
                top: `${margin.top + (height - margin.top - margin.bottom) / 2}px`,
                transform: `translateY(100px) rotate(-90deg)`,
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "#2685bd",
                textAlign: "center",
                transformOrigin: "center",
              }}
            >
              ← Less Attractive
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// (unused helper removed)

// Legend component for ProductScatter
const ProductScatterLegend = ({ isMobile }) => {
  // Use D3 RdYlBu to build a precise left-to-right (red→blue) gradient
  const gradientCss = useMemo(() => {
    const steps = 20; // smoothness of the gradient
    const stops = Array.from({ length: steps + 1 }, (_, i) => {
      const t = i / steps; // left is red, right is blue
      const pct = Math.round((i / steps) * 100);
      return `${interpolateRdYlBu(t)} ${pct}%`;
    }).join(", ");
    return `linear-gradient(to right, ${stops})`;
  }, []);
  return (
    <Box
      sx={{
        transform: "translateY(-15px)",
        width: "100%",
        maxWidth: "1200px",
        mx: "auto",
        px: isMobile ? 2 : 3,
        py: isMobile ? 1 : 1.5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 1,
        gap: isMobile ? 1 : 1.5,
      }}
    >
      {/* Color legend - centered layout like ClusterTree */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? "10px" : "15px",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Typography
          sx={{
            fontSize: isMobile ? "0.875rem" : "1rem",
            fontWeight: 600,
            color: "#000",
            fontFamily: "Source Sans Pro, sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          Low Potential
        </Typography>

        {/* Gradient bar - matching ClusterTree style */}
        <Box
          sx={{
            width: isMobile ? "120px" : "300px",
            height: isMobile ? "12px" : "16px",
            background: gradientCss,
            border: "1px solid #ccc",
            borderRadius: "3px",
          }}
        />

        <Typography
          sx={{
            fontSize: isMobile ? "0.875rem" : "1rem",
            fontWeight: 600,
            color: "#000",
            fontFamily: "Source Sans Pro, sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          High Potential
        </Typography>
      </Box>
    </Box>
  );
};

const ProductScatterInternal = ({ width, height }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const selectedCountry = useCountrySelection();
  const selectedYear = useYearSelection();
  const countryName = useCountryName(Number.parseInt(selectedCountry));
  const strategicPosition = useStrategicPosition(
    Number.parseInt(selectedCountry),
    Number.parseInt(selectedYear),
  );

  // Use default settings (controls removed)
  const viewMode = "cluster"; // Default view mode
  const nodeSizing = "uniform"; // Use uniform sizing instead of export-based

  // Image capture functionality
  const chartContainerRef = useRef(null);
  const chartAreaRef = useRef(null);
  const { registerCaptureFunction, unregisterCaptureFunction } =
    useImageCaptureContext();

  // Register/unregister image capture function
  useEffect(() => {
    if (registerCaptureFunction && chartContainerRef.current) {
      const captureFunction = async () => {
        if (chartContainerRef.current) {
          try {
            // Temporarily hide non-export elements (e.g., click hints)
            const hiddenElements = [];
            const candidates = chartContainerRef.current.querySelectorAll(
              '[data-export-hide="true"]',
            );
            candidates.forEach((el) => {
              const element = el;
              if (element && element.style) {
                hiddenElements.push(element);
                element.setAttribute(
                  "data-export-original-display",
                  element.style.display || "",
                );
                element.style.display = "none";
              }
            });

            const canvas = await html2canvas(chartContainerRef.current, {
              backgroundColor: "#ffffff",
              scale: 2,
              useCORS: true,
              allowTaint: true,
              logging: false,
              width: chartContainerRef.current.offsetWidth,
              height: chartContainerRef.current.offsetHeight,
            });

            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `product_scatter_${selectedCountry}_${selectedYear}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }
            }, "image/png");

            // Restore hidden elements
            hiddenElements.forEach((el) => {
              const original =
                el.getAttribute("data-export-original-display") || "";
              el.style.display = original;
              el.removeAttribute("data-export-original-display");
            });
          } catch (error) {
            console.error("Error capturing image:", error);
          }
        }
      };

      registerCaptureFunction(captureFunction);

      return () => {
        if (unregisterCaptureFunction) {
          unregisterCaptureFunction();
        }
      };
    }
  }, [
    registerCaptureFunction,
    unregisterCaptureFunction,
    selectedCountry,
    selectedYear,
  ]);

  // Use the comprehensive shared data fetching hook
  const { countryData, clustersData } = useGreenGrowthData(
    Number.parseInt(selectedCountry),
    Number.parseInt(selectedYear),
  );

  // Extract country product data from shared hook
  const currentData = useMemo(() => {
    if (!countryData?.productData) return null;
    return { gpCpyList: countryData.productData };
  }, [countryData]);

  // Clusters lookup for names
  const clusterLookup = useMemo(() => {
    if (!clustersData?.gpClusterList) return new Map();
    return new Map(
      clustersData.gpClusterList.map((cluster) => [
        cluster.clusterId,
        cluster.clusterName,
      ]),
    );
  }, [clustersData]);

  const productLookup = useProductLookup();
  const supplyChainProductLookup = useSupplyChainProductLookup();
  // removed unused supplyChainLookup

  // Responsive layout with flexbox - minimal padding for maximum space
  const padding = isMobile ? 4 : 8;

  const scatterData = useMemo(() => {
    if (viewMode === "product") {
      if (!currentData || !currentData.gpCpyList) return [];

      // Filter products (RCA < 1) first
      const filteredProducts = currentData.gpCpyList;
      // .filter(
      //   (item) => Number.parseFloat(item.exportRca) < 1,
      // );

      // First pass: calculate all attractiveness and density values for score calculation
      const productsWithPositions = filteredProducts.map((item) => {
        const attractiveness =
          0.6 * Number.parseFloat(item.normalizedCog) +
          0.4 * Number.parseFloat(item.normalizedPci);
        const density = Number.parseFloat(item.exportRca);

        return {
          ...item,
          attractiveness,
          density,
        };
      });

      // Calculate top-right scores for all products
      const productsWithScores = productsWithPositions.map((item) => ({
        ...item,
        topRightScore: calculateTopRightScore(
          item.attractiveness,
          item.density,
          productsWithPositions,
        ),
      }));

      // Get min/max scores for color scaling
      const scores = productsWithScores.map((item) => item.topRightScore);
      const minScore = Math.min(...scores);
      const maxScore = Math.max(...scores);

      // Sort by topRightScore to identify top 5
      const sortedProducts = [...productsWithScores].sort(
        (a, b) => b.topRightScore - a.topRightScore,
      );
      const topProductIds = new Set(
        sortedProducts.slice(0, 5).map((item) => item.productId),
      );

      return productsWithScores.map((item) => {
        const productDetails = productLookup.get(item.productId);
        const supplyChains = supplyChainProductLookup.get(item.productId) || [];

        // Parse export value for sizing
        const exportValue = Number.parseFloat(item.exportValue) || 0;
        const isTopCluster = topProductIds.has(item.productId);

        return {
          product: productDetails?.code || item.productId,
          productName:
            productDetails?.nameShortEn || `Product ${item.productId}`,
          density: item.density,
          rca: item.density,
          color: getPotentialColor(item.topRightScore, minScore, maxScore),
          supplyChains: supplyChains.map((sc) => sc.supplyChainId),
          uniqueKey: createUniqueProductKey(item.productId),
          attractiveness: item.attractiveness,
          exportValue,
          topRightScore: item.topRightScore,
          isTopCluster,
          nodeSize: 6,
        };
      });
    } else {
      // Cluster mode
      if (!countryData?.clusterData) return [];

      const allClusterData = countryData.clusterData;

      // Filter clusters (RCA < 1) first
      const filteredClusters = allClusterData;
      // .filter(
      //   (item) => Number.parseFloat(item.rca) < 1,
      // );

      // Calculate export values for filtered clusters only
      const clusterExportData = filteredClusters.map((clusterItem) => {
        // Find products that belong to this cluster and sum their export values
        if (!currentData?.gpCpyList)
          return { clusterItem, exportValue: 0, products: [] };

        const clusterProducts = currentData.gpCpyList.filter((productItem) => {
          const mappings =
            supplyChainProductLookup.get(productItem.productId) || [];
          return mappings.some(
            (mapping) => mapping.clusterId === clusterItem.clusterId,
          );
        });

        const exportValue = clusterProducts.reduce((sum, product) => {
          return sum + (Number.parseFloat(product.exportValue) || 0);
        }, 0);

        return { clusterItem, exportValue, products: clusterProducts };
      });

      // First pass: calculate all attractiveness and density values for score calculation
      const clustersWithPositions = clusterExportData.map((data) => {
        const { clusterItem } = data;
        const attractiveness =
          0.6 * Number.parseFloat(clusterItem.cog) +
          0.4 * Number.parseFloat(clusterItem.pci);
        const density = Number.parseFloat(clusterItem.density);

        return {
          ...data,
          attractiveness,
          density,
        };
      });

      // Calculate top-right scores for all clusters
      const clustersWithScores = clustersWithPositions.map((data) => ({
        ...data,
        topRightScore: calculateTopRightScore(
          data.attractiveness,
          data.density,
          clustersWithPositions,
        ),
      }));

      // Get min/max scores for color scaling
      const scores = clustersWithScores.map((data) => data.topRightScore);
      const minScore = Math.min(...scores);
      const maxScore = Math.max(...scores);

      // Sort by topRightScore to identify top 5
      const sortedClusters = [...clustersWithScores].sort(
        (a, b) => b.topRightScore - a.topRightScore,
      );
      const topClusterIds = new Set(
        sortedClusters.slice(0, 5).map((data) => data.clusterItem.clusterId),
      );

      return clustersWithScores.map((data) => {
        const {
          clusterItem,
          exportValue,
          products,
          topRightScore,
          attractiveness,
          density,
        } = data;
        const clusterName = clusterLookup.get(clusterItem.clusterId);
        const isTopCluster = topClusterIds.has(clusterItem.clusterId);

        // Get product names and codes for the tooltip
        const productNames = products
          .map((product) => {
            const productDetails = productLookup.get(product.productId);
            const name =
              productDetails?.nameShortEn || `Product ${product.productId}`;
            const code = productDetails?.code || product.productId;
            return `${name} (${code})`;
          })
          .sort();

        return {
          clusterId: clusterItem.clusterId,
          clusterName: clusterName || `Cluster ${clusterItem.clusterId}`,
          density: density,
          rca: density,
          color: getPotentialColor(topRightScore, minScore, maxScore),
          uniqueKey: `cluster_${clusterItem.clusterId}`,
          attractiveness: attractiveness,
          exportValue,
          productNames,
          topRightScore,
          isTopCluster,
          nodeSize: 8,
        };
      });
    }
  }, [
    currentData,
    countryData,
    productLookup,
    supplyChainProductLookup,
    clusterLookup,
  ]);

  // (unused helper removed)

  // Get top 5 items for labeling
  const topItems = useMemo(() => {
    return scatterData
      .filter((item) => item.isTopCluster)
      .sort((a, b) => b.topRightScore - a.topRightScore)
      .slice(0, 5);
  }, [scatterData]);

  // Create a map for quick lookup of top items
  const topItemsMap = useMemo(() => {
    const map = new Map();
    topItems.forEach((item, index) => {
      map.set(item.uniqueKey, { ...item, labelIndex: index });
    });
    return map;
  }, [topItems]);

  // Chart margins - reduced top margin since title is now outside SVG
  const margin = {
    top: isMobile ? 40 : 50,
    right: isMobile ? 20 : 40,
    bottom: isMobile ? 100 : 100,
    left: isMobile ? 60 : 80,
  };

  // Tooltip via visx
  const {
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  const handleTooltip = (event, data) => {
    if (event && data) {
      // Use chartAreaRef which is closer to where the tooltip is rendered
      const coords = localPoint(
        chartAreaRef.current || chartContainerRef.current,
        event,
      );
      if (coords) {
        showTooltip({
          tooltipLeft: coords.x,
          tooltipTop: coords.y,
          tooltipData: data,
        });
      }
    } else {
      hideTooltip();
    }
  };

  return (
    <Box
      ref={chartContainerRef}
      sx={{
        width: "100%",
        height: "100%",
        padding: "0px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative", // Ensure this is a positioned container for TooltipWithBounds
      }}
    >
      {/* Main Title */}
      <Box
        sx={{
          height: 60,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          mb: 1,
        }}
      >
        <Typography variant="chart-title">
          Which clusters offer green growth opportunities for {countryName}?
        </Typography>
      </Box>

      {/* Chart, Legend, and Attribution Container (exported with title via parent ref) */}
      <Box
        ref={chartAreaRef}
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff", // Ensure white background for export
          position: "relative",
        }}
      >
        {/* Strategic approach pill - top-right overlay */}
        <GGTooltip title={strategicPosition?.description || ""}>
          <div
            style={{
              position: "absolute",
              top: isMobile ? 8 : 10,
              right: isMobile ? 8 : 12,
              backgroundColor: strategicPosition?.color || "#fff",
              color: strategicPosition?.color ? "#fff" : "#000",
              padding: isMobile ? "4px 8px" : "6px 12px",
              borderRadius: "4px",
              fontSize: isMobile ? "0.75rem" : "1rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              pointerEvents: "auto",
              zIndex: 2,
              cursor: "help",
            }}
          >
            <BookmarkIcon
              sx={{ fontSize: isMobile ? "0.875rem" : "1.125rem" }}
            />
            <span
              style={{
                borderBottom: strategicPosition?.color
                  ? "1px solid #FFFFFF"
                  : "1px solid #000000",
                paddingBottom: "1px",
              }}
            >
              {strategicPosition?.label || "Strategic Approach"}
            </span>
          </div>
        </GGTooltip>
        {/* Chart Container */}
        <Box
          sx={{
            flex: 1,
            minHeight: 300, // Minimum height to ensure chart is usable
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {scatterData.length > 0 && (
            <CustomScatterPlot
              data={scatterData}
              width={width}
              height={Math.max(height - 120, 300)} // Optimized height - minimal buffer for legend and attribution
              margin={margin}
              viewMode={viewMode}
              topItemsMap={topItemsMap}
              onTooltip={handleTooltip}
              isMobile={isMobile}
            />
          )}
        </Box>

        {/* Tooltip */}
        {tooltipOpen && tooltipData && (
          <TooltipWithBounds
            left={tooltipLeft}
            top={tooltipTop}
            offsetLeft={12}
            offsetTop={12}
            detectBounds={true}
            className="gg-unskinned-tooltip"
          >
            <SharedTooltip
              payload={{
                type: "custom",
                data: {
                  title:
                    viewMode === "cluster"
                      ? tooltipData.clusterName
                      : `${tooltipData.productName} (${tooltipData.product})`,
                  rows:
                    viewMode === "cluster"
                      ? [
                          {
                            label: "Attractiveness:",
                            value: tooltipData.attractiveness.toFixed(1),
                          },
                          {
                            label: "Feasibility:",
                            value: tooltipData.density.toFixed(1),
                          },
                          {
                            label: "Year:",
                            value: Number.parseInt(selectedYear),
                          },
                        ]
                      : [
                          {
                            label: "Attractiveness:",
                            value: tooltipData.attractiveness.toFixed(1),
                          },
                          {
                            label: "RCA:",
                            value: tooltipData.density.toFixed(1),
                          },
                          {
                            label: "Year:",
                            value: Number.parseInt(selectedYear),
                          },
                        ],
                },
              }}
            />
          </TooltipWithBounds>
        )}

        {/* Legend - included in export area */}
        <Box sx={{ mt: 0 }}>
          <ProductScatterLegend
            viewMode={viewMode}
            nodeSizing={nodeSizing}
            isMobile={isMobile}
          />
        </Box>
      </Box>
    </Box>
  );
};

const ProductScatter = () => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <TableWrapper defaultDataType="products">
        <ParentSize>
          {({ width, height }) => {
            if (width === 0 || height === 0) {
              return null;
            }
            return <ProductScatterInternal width={width} height={height} />;
          }}
        </ParentSize>
      </TableWrapper>
    </div>
  );
};

export default ProductScatter;
