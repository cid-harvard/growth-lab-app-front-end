import { useTransition, animated, config } from "@react-spring/web";
import { interpolate } from "flubber";
import { useScreenSize } from "@visx/responsive";
import { memo, useMemo, useRef, useState } from "react";
import "./scrollyCanvas.css";
import { colorScale } from "../../utils";
import { useSupplyChainBubbles } from "./useSupplyChainBubbles";
import { useQuery } from "@apollo/react-hooks";
import { GG_CPY_LIST_QUERY } from "../../queries/cpy";
import { useProductLookup } from "../../queries/products";
import { useSupplyChainProductLookup } from "../../queries/supplyChainProducts";
import { useSupplyChainLookup } from "../../queries/supplyChains";
import { max, index } from "d3-array";
import { useCallback } from "react";

const useStackedBars = ({ year, countryId, width, height }) => {
  const { loading, error, data, previousData } = useQuery(GG_CPY_LIST_QUERY, {
    variables: { year: parseInt(year), countryId: parseInt(countryId) },
  });
  const currentData = data || previousData;
  const productLookup = useProductLookup();
  const supplyChainLookup = useSupplyChainLookup();
  const supplyChainProductLookup = useSupplyChainProductLookup();

  const createLayout = useCallback(
    (ggCpyList) => {
      if (!ggCpyList || !width || !height)
        return { bars: [], expectedOverlays: [] };

      const margin = { top: 40, right: 20, bottom: 40, left: 60 };
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom - 100;
      const barPadding = 20;

      const sectorArray = ggCpyList.reduce((arr, product) => {
        const productDetails = productLookup.get(product.productId);
        const supplyChains =
          supplyChainProductLookup.get(product.productId) || [];

        supplyChains.forEach((sc) => {
          const supplyChainId = sc.supplyChainId;
          const supplyChainDetails = supplyChainLookup.get(supplyChainId);
          const supplyChainName = supplyChainDetails
            ? supplyChainDetails.supplyChain
            : supplyChainId;

          arr.push({
            id: productDetails?.code,
            parentId: supplyChainDetails.supplyChainId,
            exportValue: parseFloat(product.exportValue) || 0,
            expectedExports: parseFloat(product.expectedExports) || 0,
            title: `${supplyChainName}-${productDetails?.nameShortEn}`,
            value: parseFloat(product.exportValue) || 0,
            parent: supplyChainDetails,
          });
        });
        return arr;
      }, []);

      const groupedData = sectorArray.reduce((acc, item) => {
        if (!acc[item.parentId]) {
          acc[item.parentId] = [];
        }
        acc[item.parentId].push(item);
        return acc;
      }, {});

      const sortedParents = Object.keys(groupedData).sort();
      const barHeight =
        (chartHeight - (sortedParents.length - 1) * barPadding) /
        sortedParents.length;

      const expectedTotals = sortedParents.reduce((acc, parentId) => {
        acc[parentId] = groupedData[parentId].reduce(
          (sum, child) => sum + child.expectedExports,
          0,
        );
        return acc;
      }, {});

      const maxTotalValue = max(sortedParents, (parentId) =>
        Math.max(
          groupedData[parentId].reduce(
            (sum, child) => sum + child.exportValue,
            0,
          ),
          expectedTotals[parentId],
        ),
      );

      let result = [];
      let expectedPositions = [];

      sortedParents.forEach((parentId, parentIndex) => {
        const children = groupedData[parentId];
        let cumulativeWidth = 0;

        children.forEach((item) => {
          const itemWidth = (item.exportValue / maxTotalValue) * chartWidth;
          const y = margin.top + parentIndex * (barHeight + barPadding);
          const x = margin.left + cumulativeWidth;

          result.push({
            id: `${item.id}-${item.parentId}`,
            parentId: item.parentId,
            coords: [
              [x, y],
              [x + itemWidth, y],
              [x + itemWidth, y + barHeight],
              [x, y + barHeight],
            ],
            exportValue: item.exportValue,
            expectedExports: item.expectedExports,
            title: item.title,
            value: item.value,
            parent: item.parent,
            data: { product: { code: item.id } },
            fill: colorScale(item.parentId),
          });

          cumulativeWidth += itemWidth;
        });

        const expectedWidth =
          (expectedTotals[parentId] / maxTotalValue) * chartWidth;
        const y = margin.top + parentIndex * (barHeight + barPadding);
        const x = margin.left + expectedWidth;

        expectedPositions.push({
          parentId: parentId,
          name: groupedData[parentId][0].parent.supplyChain,
          coords: [
            [x, y],
            [x, y + barHeight],
          ],
          expectedTotal: expectedTotals[parentId],
        });
      });
      const bars = index(
        result.filter(
          (d) =>
            !d.coords.flat().flat().includes(NaN) &&
            !d.id.includes("undefined"),
        ),
        (d) => d.id,
      );
      return {
        bars,
        expectedOverlays: expectedPositions,
      };
    },
    [productLookup, supplyChainProductLookup, supplyChainLookup, width, height],
  );

  const layout = useMemo(
    () => createLayout(currentData?.ggCpyList),
    [currentData, createLayout],
  );

  return { loading, error, ...layout };
};

const ScrollyCanvas = ({
  view,
  showTooltip,
  hideTooltip,
  onScroll,
  yearSelection,
  countrySelection,
  prevBase,
}) => {
  const { fill, stroke } = view;
  const screenSize = useScreenSize({ debounceTime: 150 });
  const { childBubbles, parentCircles } = useSupplyChainBubbles({
    year: yearSelection,
    countryId: countrySelection,
    width: screenSize.width,
    height: screenSize.height,
    fill,
    stroke,
  });

  const { bars, expectedOverlays } = useStackedBars({
    year: yearSelection,
    countryId: countrySelection,
    width: screenSize.width,
    height: screenSize.height,
  });

  const layouts = useMemo(
    () => ({
      bubbles: childBubbles,
      bars: bars,
    }),
    [childBubbles, bars],
  );

  const currentLayout = useMemo(() => layouts[view.base], [view.base, layouts]);
  const previousLayout = useMemo(() => layouts[prevBase], [prevBase, layouts]);
  const isAnimating = useRef(false);
  const finishedAnimation = useRef();

  const layoutArray = useMemo(
    () => Array.from(currentLayout.values()),
    [currentLayout],
  );

  const transitions = useTransition(layoutArray, {
    from: { fillOpacity: 1, transition: 0, stroke: "white" },
    enter: (item) => ({
      fill: item.fill,
      fillOpacity: item.opacity,
      transition: 1,
      stroke: item.stroke,
      strokeWidth: item.strokeWidth,
      strokeOpacity: item.strokeOpacity,
    }),
    update: (item) => ({
      fill: item.fill,
      fillOpacity: item.opacity,
      transition: 1,
      stroke: item.stroke,
      strokeWidth: item.strokeWidth,
      strokeOpacity: item.strokeOpacity,
    }),
    leave: { fillOpacity: 0, transition: 1, stroke: "white" },
    keys: (item) => `${item?.data?.product?.code}-${item?.parentId}`,
    reset: view.base !== prevBase && finishedAnimation.current !== view.base,
    onStart: () => (isAnimating.current = true),
    onRest: () => {
      finishedAnimation.current = view.base;
      isAnimating.current = false;
    },
  });

  const flubberInterpolator = (fromShape, toShape) => {
    const interpolator = interpolate(fromShape, toShape);
    return (t) => interpolator(t);
  };
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const [hoveredSupplyChain, setHoveredSupplyChain] = useState(null);
  return (
    <>
      <h3 style={{ marginLeft: 60, marginTop: 10 }}>{view.title}</h3>
      <svg
        style={{ position: "absolute", top: "10%", left: "0" }}
        width="100%"
        height="90%"
        preserveAspectRatio="xMidYMid meet"
      >
        {view.base === "bubbles" &&
          parentCircles.map((circle) => (
            <g
              key={circle.id}
              className="parent-circle"
              onMouseEnter={() =>
                !isAnimating.current && setHoveredSupplyChain(circle.id)
              }
              onMouseLeave={() =>
                !isAnimating.current && setHoveredSupplyChain(null)
              }
            >
              <rect
                x={circle.x - circle.radius}
                y={circle.y - circle.radius}
                width={circle.radius * 2}
                height={circle.radius * 2}
                fill="transparent"
                cursor="pointer"
              />
              <circle
                id={`parent-circle-${circle.id}`}
                cx={circle.x}
                cy={circle.y}
                r={circle.radius + 4}
                fill={colorScale(circle.id)}
                fillOpacity={0.1}
                strokeWidth={2}
                stroke={colorScale(circle.id)}
                strokeOpacity={0.3}
              />
              {hoveredSupplyChain === circle.id && (
                <rect
                  x={circle.x - circle.radius - 5}
                  y={circle.y - circle.radius - 35}
                  width={circle.radius * 2 + 10}
                  height={circle.radius * 2 + 40}
                  fill="none"
                  stroke={colorScale(circle.id)}
                  strokeWidth={2}
                  strokeDasharray="5,5"
                />
              )}
            </g>
          ))}
        {transitions((style, node) => {
          return (
            <animated.path
              key={`${node.id}-${node.parentId}`}
              stroke={style.stroke}
              strokeWidth={style.strokeWidth}
              d={style.transition.to((o) => {
                const prevCoords = previousLayout.get(node.id)?.coords ||
                  currentLayout.get(node.id)?.coords || [
                    [0, 0],
                    [0, 0],
                    [0, 0],
                    [0, 0],
                  ];
                const currCoords = currentLayout.get(node.id)?.coords || [
                  [0, 0],
                  [0, 0],
                  [0, 0],
                  [0, 0],
                ];
                if (
                  previousLayout.get(node.id)?.type ===
                  currentLayout.get(node.id)?.type
                ) {
                  return flubberInterpolator(prevCoords, currCoords)(1);
                } else {
                  return flubberInterpolator(prevCoords, currCoords)(o);
                }
              })}
              strokeOpacity={style.strokeOpacity}
              fill={colorScale(childBubbles.get(node.id)?.parentId)}
              style={style}
              fillOpacity={style.fillOpacity}
              onMouseEnter={(event) => {
                const { clientX, clientY } = event;
                !isAnimating.current &&
                  showTooltip({
                    tooltipData: {
                      ...node,
                      radius: childBubbles.get(node.id).radius,
                    },
                    tooltipLeft: clientX,
                    tooltipTop: clientY,
                  });
              }}
              onMouseLeave={() => hideTooltip()}
            />
          );
        })}
        {view.base === "bars" && (
          <>
            {expectedOverlays.map((overlay) => {
              const actualValue = Array.from(bars.values())
                .filter((bar) => bar.parentId === overlay.parentId)
                .reduce((sum, bar) => sum + bar.exportValue, 0);

              return (
                <g
                  key={`supply-chain-${overlay.parentId}`}
                  className="parent-circle"
                >
                  <rect
                    x={overlay.coords[0][0]}
                    y={overlay.coords[0][1]}
                    width={5}
                    height={overlay.coords[1][1] - overlay.coords[0][1]}
                    fill="grey"
                    fillOpacity={0.7}
                  />

                  <text
                    x={60}
                    y={overlay.coords[0][1] - 8}
                    fontSize="10px"
                    textAnchor="start"
                    fontWeight="bold"
                  >
                    {overlay.name} Actual Value: {formatter.format(actualValue)}{" "}
                    | Expected Value: {formatter.format(overlay.expectedTotal)}
                  </text>
                </g>
              );
            })}
          </>
        )}
      </svg>
      {/* Add HTML overlay for text */}
      {view.base === "bubbles" &&
        parentCircles.map((circle) => (
          <div
            key={`text-${circle.id}`}
            style={{
              position: "absolute",
              left: `${circle.x}px`,
              bottom: `calc(${screenSize.height - (circle.y - circle.radius - 10)}px - 10%)`,
              transform: "translateX(-50%)",
              textAlign: "center",
              maxWidth: `${circle.radius * 2}px`,
              fontSize: "12px",
              fontWeight: "bold",
              pointerEvents: "none",
            }}
          >
            {circle.name}
          </div>
        ))}
    </>
  );
};

export default memo(ScrollyCanvas);
