import { selector, selectorFamily, useRecoilValue } from "recoil";
import hs92_6Selector from "../../atoms/hs92-6";
import { useMemo, useState, useEffect, useCallback } from "react";
import { scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import expectedActualProductSelector from "../../atoms/expectedActualProduct";
import { stratify, tree, hierarchy } from "d3-hierarchy";
import { scaleSqrt, scaleLinear } from "d3-scale";
import { linkRadial } from "d3-shape";

const treeSelector = selectorFamily({
  key: "treeSelector",
  get:
    ({ selectedCountry, selectedYear }) =>
    ({ get }) => {
      const hs6Data = get(hs92_6Selector);
      const { dataLookup, countryLookup } = get(expectedActualProductSelector);

      const allYears = Array.from({ length: 11 }, (_, i) => 2022 - i);
      let maxValue = 0;

      const createTreeData = (year) => {
        const supplyChainProducts = hs6Data.values().reduce((arr, d) => {
          const {
            Id: [productName],
            hsCode,
            topic: chains,
          } = d;

          const productDataArr = dataLookup
            .get(selectedCountry)
            ?.get(selectedYear + "")
            ?.get(productName);
          const productData = productDataArr?.[0];

          if (productData && parseFloat(productData.export_value) > 0) {
            const value = parseFloat(productData.export_value);
            maxValue = Math.max(maxValue, value);
            chains.forEach((chain) => {
              arr.push({
                id: `${hsCode}-${chain}`,
                productName,
                hsCode: hsCode + "",
                hs4Code: `${hsCode}`.slice(0, -2),
                hs2Code: `${hsCode}`.slice(0, -4),
                chain,
                chainId: chain.split(" ").join("-"),
                parentId:
                  `${hsCode}`.slice(0, -2) + "-" + chain.split(" ").join("-"),
                value: productData.export_value,
                actualValue: productData.actual_value,
                expectedValue: productData.expected_exports,
              });
            });
          }
          return arr;
        }, []);

        const hs4Arr = Object.values(
          Object.fromEntries(
            supplyChainProducts.map((d) => [
              d.hs4Code + "-" + d.chainId,
              {
                ...d,
                id: d.hs4Code + "-" + d.chainId,
                hsCode: d.hs4Code,
                parentId: d.hs2Code + "-" + d.chainId,
              },
            ]),
          ),
        );

        const hs2Arr = Object.values(
          Object.fromEntries(
            supplyChainProducts.map((d) => [
              d.hs2Code + "-" + d.chainId,
              {
                ...d,
                id: d.hs2Code + "-" + d.chainId,
                hsCode: d.hs2Code,
                parentId: d.chainId,
              },
            ]),
          ),
        );

        const chainArr = Object.values(
          supplyChainProducts.reduce((acc, d) => {
            if (!acc[d.chainId]) {
              acc[d.chainId] = {
                id: d.chainId,
                parentId: "root",
              };
            }
            return acc;
          }, {}),
        );
        const root = {
          id: "root",
          parentId: null,
        };
        const greenSupplyChainTree = stratify()([
          root,
          ...chainArr,
          ...hs2Arr,
          ...hs4Arr,
          ...supplyChainProducts,
        ]);

        return greenSupplyChainTree;
      };

      const greenSupplyChainTree = createTreeData(selectedYear);

      allYears.forEach((year) => {
        if (year !== selectedYear) {
          createTreeData(year);
        }
      });

      return { greenSupplyChainTree, maxValue };
    },
});

const TreeGrowth = () => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("USA");
  const [selectedYear, setSelectedYear] = useState(2022);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredNodePosition, setHoveredNodePosition] = useState(null);

  const { greenSupplyChainTree, maxValue } = useRecoilValue(
    treeSelector({ selectedCountry, selectedYear }),
  );
  const { countryLookup } = useRecoilValue(expectedActualProductSelector);

  const availableYears = useMemo(() => {
    return Array.from({ length: 11 }, (_, i) => 2022 - i);
  }, []);

  const minYear = Math.min(...availableYears);
  const maxYear = Math.max(...availableYears);

  const advanceYear = useCallback(() => {
    setSelectedYear((prevYear) => {
      if (prevYear >= maxYear) {
        return minYear;
      }
      return prevYear + 1;
    });
  }, [minYear, maxYear]);

  useEffect(() => {
    let intervalId;
    if (isPlaying) {
      intervalId = setInterval(advanceYear, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, advanceYear]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const { nodes, links, colorScale, sizeScale, linkWidthScale, opacityScale } =
    useMemo(() => {
      if (!greenSupplyChainTree)
        return {
          nodes: [],
          links: [],
          colorScale: null,
          sizeScale: null,
          linkWidthScale: null,
          opacityScale: null,
        };

      const width = 1000;
      const height = 1000;
      const radius = Math.min(width, height) / 2;

      const root = hierarchy(greenSupplyChainTree)
        .sum((d) => d.data.value || 0)
        .sort((a, b) => b.value - a.value);

      const uniqueHS2Codes = new Set(
        root
          .descendants()
          .map((node) => node.data.data.hs2Code)
          .filter(Boolean),
      );
      const colorScale = scaleOrdinal(schemeCategory10).domain(
        Array.from(uniqueHS2Codes),
      );

      const sizeScale = scaleSqrt().domain([0, maxValue]).range([2, 20]);

      root.descendants().forEach((node) => {
        node.nodeSize = node.depth === 0 ? 10 : sizeScale(node.value);
      });

      const treeLayout = tree()
        .size([2 * Math.PI, radius * 0.9])
        .separation((a, b) => {
          return ((a.nodeSize + b.nodeSize) / 4) * Math.random();
        });

      treeLayout(root);

      root.descendants().forEach((node) => {
        if (node.parent) {
          const angle = (node.x - node.parent.x) / (node.y - node.parent.y);
          node.y += node.nodeSize / 2;
          node.x += (angle * node.nodeSize) / 2;
        }
      });

      const linkWidthScale = scaleLinear()
        .domain([0, maxValue])
        .range([0.5, 5]);

      const opacityScale = scaleLinear()
        .domain([0, root.height])
        .range([1, 0.5]);

      return {
        nodes: root.descendants(),
        links: root.links(),
        colorScale,
        sizeScale,
        linkWidthScale,
        opacityScale,
      };
    }, [greenSupplyChainTree, maxValue]);

  const linkPathGenerator = linkRadial()
    .angle((d) => d.x)
    .radius((d) => d.y)
    .source((d) => ({
      x: d.source.x,
      y: d.source.y + (d.source.depth === 0 ? 0 : sizeScale(d.source.value)),
    }))
    .target((d) => ({
      x: d.target.x,
      y: d.target.y - (d.target.depth === 0 ? 0 : sizeScale(d.target.value)),
    }));

  const maxLabelLength = 15;

  return (
    <div>
      <h2>
        Green Supply Chain Tree for {countryLookup[selectedCountry]} in{" "}
        {selectedYear}
      </h2>
      <div>
        <label htmlFor="country-select">Select Country: </label>
        <select
          id="country-select"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
        >
          {Object.entries(countryLookup).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>

        <label htmlFor="year-slider" style={{ marginLeft: "1rem" }}>
          Select Year: {selectedYear}
        </label>
        <input
          id="year-slider"
          type="range"
          min={minYear}
          max={maxYear}
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          style={{ marginLeft: "0.5rem" }}
        />

        <button onClick={togglePlay} style={{ marginLeft: "1rem" }}>
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>
      <svg
        width="100%"
        height="80%"
        viewBox="-500 -500 1000 1000"
        preserveAspectRatio="xMidYMid meet"
        style={{ maxHeight: "100vh" }}
      >
        <g>
          {links.map((link, index) => (
            <path
              key={index}
              d={linkPathGenerator(link)}
              fill="none"
              stroke="#999"
              opacity={opacityScale(link.target.depth)}
              strokeWidth={linkWidthScale(link.target.value)}
            />
          ))}
          {nodes.map((node, index) => (
            <g
              key={index}
              transform={`
                rotate(${(node.x * 180) / Math.PI - 90})
                translate(${node.y},0)
              `}
              onMouseEnter={(e) => {
                setHoveredNode(node);
                const svgRect =
                  e.currentTarget.ownerSVGElement.getBoundingClientRect();
                const nodeRect = e.currentTarget.getBoundingClientRect();
                setHoveredNodePosition({
                  x: nodeRect.left - svgRect.left + nodeRect.width / 2,
                  y: nodeRect.top - svgRect.top + nodeRect.height / 2,
                });
              }}
              onMouseLeave={() => {
                setHoveredNode(null);
                setHoveredNodePosition(null);
              }}
            >
              <circle
                r={
                  node.depth === 0
                    ? 10
                    : hoveredNode === node
                      ? node.nodeSize * 1.2
                      : node.nodeSize
                }
                fill={
                  node.data.data.hs2Code
                    ? colorScale(node.data.data.hs2Code)
                    : "#ccc"
                }
                opacity={opacityScale(node.depth)}
              />
              {node.depth === 1 && (
                <text
                  dy=".31em"
                  x={node.x < Math.PI === !node.children ? 6 : -6}
                  textAnchor={
                    node.x < Math.PI === !node.children ? "start" : "end"
                  }
                  transform={`${node.x >= Math.PI ? "rotate(180)" : ""}`}
                  fontSize="8px"
                  fontWeight={hoveredNode === node ? "bold" : "normal"}
                >
                  {(node.data.data.id || "").slice(0, maxLabelLength).trim() +
                    (node.data.data.id?.length > maxLabelLength ? "..." : "")}
                </text>
              )}
            </g>
          ))}
          {hoveredNode && hoveredNodePosition && (
            <g
              transform={`translate(${hoveredNodePosition.x}, ${hoveredNodePosition.y})`}
            >
              <rect
                x="5"
                y="-20"
                width="200"
                height="40"
                fill="white"
                opacity="0.9"
                rx="5"
                ry="5"
              />
              <text x="10" y="0" fontSize="14px" fill="black">
                {hoveredNode.data.data.productName || hoveredNode.data.data.id}
              </text>
              <text x="10" y="20" fontSize="12px" fill="gray">
                Value: {hoveredNode.value.toLocaleString()}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};

export default TreeGrowth;
