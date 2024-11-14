import { useState, useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useQuery } from "@apollo/react-hooks";
import { GG_CPY_LIST_QUERY } from "../../queries/cpy";
import { useProductLookup } from "../../queries/products";
import { useSupplyChainProductLookup } from "../../queries/supplyChainProducts";
import { useSupplyChainLookup } from "../../queries/supplyChains";
import { useRecoilValue } from "recoil";
import { countrySelectionState } from "../ScollamaStory";
import { yearSelectionState } from "../ScollamaStory";
import { useCountryName } from "../../queries/useCountryName";
import {
  Typography,
  Button,
  Box,
  Paper,
  Tooltip as MuiTooltip,
  useMediaQuery,
} from "@mui/material";

const createUniqueProductKey = (product) => {
  return `${product}`;
};

const getProductColor = (product) => {
  let hash = 0;
  for (let i = 0; i < product.length; i++) {
    hash = product.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = "#" + ((hash & 0x00ffffff) | 0x1000000).toString(16).slice(1);
  return color;
};

const CustomAxisLabel = ({ viewBox, value, axis }) => {
  const isNarrow = useMediaQuery("(max-width:600px)");
  const isShort = useMediaQuery("(max-height:700px)");
  const { x, y, width, height } = viewBox;
  const isYAxis = axis === "y";

  if (isYAxis) {
    return (
      <g>
        <MuiTooltip
          title="Measures how valuable a product is based on the capabilities it will help a location develop"
          placement="right"
        >
          <text
            x={x}
            y={y + height / 2}
            textAnchor="middle"
            transform={`rotate(-90, ${x}, ${y + height / 2})`}
            style={{
              fontSize: "16px",
              fill: "black",
              textDecoration: "underline",
            }}
          >
            ATTRACTIVENESS
          </text>
        </MuiTooltip>
        {!isShort && (
          <>
            <text
              x={x}
              y={y + height * 0.2}
              textAnchor="middle"
              transform={`rotate(-90, ${x}, ${y + height * 0.2})`}
              style={{ fontSize: "12px", fill: "black", fontWeight: 600 }}
            >
              MORE ATTRACTIVE →
            </text>
            <text
              x={x}
              y={y + height * 0.8}
              textAnchor="middle"
              transform={`rotate(-90, ${x}, ${y + height * 0.8})`}
              style={{ fontSize: "12px", fill: "black", fontWeight: 600 }}
            >
              ← LESS ATTRACTIVE
            </text>
          </>
        )}
      </g>
    );
  }

  return (
    <g>
      <MuiTooltip
        title="Measures the share of capabilities, skills, and know-how present in a location that is necessary to jumpstart a specific activity"
        placement="top"
      >
        <text
          x={x + width / 2}
          y={y + height + 15}
          textAnchor="middle"
          style={{
            fontSize: "16px",
            fill: "black",
            textDecoration: "underline",
          }}
        >
          FEASIBILITY
        </text>
      </MuiTooltip>
      {!isNarrow && (
        <>
          <text
            x={x + width * 0.2}
            y={y + height + 15}
            textAnchor="middle"
            style={{ fontSize: "12px", fill: "black", fontWeight: 600 }}
          >
            ← LESS FEASIBLE
          </text>
          <text
            x={x + width * 0.8}
            y={y + height + 15}
            textAnchor="middle"
            style={{ fontSize: "12px", fill: "black", fontWeight: 600 }}
          >
            MORE FEASIBLE →
          </text>
        </>
      )}
    </g>
  );
};

const ProductScatter = () => {
  const selectedCountry = useRecoilValue(countrySelectionState);
  const selectedYear = useRecoilValue(yearSelectionState);
  const countryName = useCountryName();
  const { loading, error, data, previousData } = useQuery(GG_CPY_LIST_QUERY, {
    variables: {
      year: parseInt(selectedYear),
      countryId: parseInt(selectedCountry),
    },
  });
  const currentData = useMemo(() => data || previousData, [data, previousData]);
  const productLookup = useProductLookup();
  const supplyChainProductLookup = useSupplyChainProductLookup();
  const supplyChainLookup = useSupplyChainLookup();
  const scatterData = useMemo(() => {
    if (!currentData || !currentData.ggCpyList) return [];

    return currentData.ggCpyList
      .map((item) => {
        const productDetails = productLookup.get(item.productId);
        const supplyChains = supplyChainProductLookup.get(item.productId) || [];
        const attractiveness =
          0.6 * parseFloat(item.normalizedCog) +
          0.4 * parseFloat(item.normalizedPci);

        return {
          product: item.productId,
          productName: productDetails?.nameShortEn,
          density: parseFloat(item.feasibilityStd),
          rca: parseFloat(item.normalizedExportRca),
          color: getProductColor(item.productId),
          supplyChains: supplyChains.map((sc) => sc.supplyChainId),
          uniqueKey: createUniqueProductKey(item.productId),
          attractiveness,
        };
      })
      .filter((d) => d.rca < 1);
  }, [currentData, productLookup, supplyChainProductLookup]);

  const allSupplyChains = useMemo(() => {
    const chains = new Set();
    scatterData.forEach((item) => {
      item.supplyChains.forEach((chainId) => chains.add(chainId));
    });
    return Array.from(chains).sort();
  }, [scatterData]);

  const getSupplyChainName = (chainId) => {
    const chain = supplyChainLookup.get(chainId);
    return chain?.supplyChain || chainId;
  };

  const [selectedSupplyChains, setSelectedSupplyChains] = useState([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
  ]);

  const filteredData = useMemo(() => {
    return scatterData.filter(
      (d) =>
        selectedSupplyChains.length > 0 &&
        d.supplyChains.some((chain) => selectedSupplyChains.includes(chain)),
    );
  }, [scatterData, selectedSupplyChains]);

  const toggleSupplyChain = (chain) => {
    setSelectedSupplyChains((prev) =>
      prev.includes(chain) ? prev.filter((c) => c !== chain) : [...prev, chain],
    );
  };

  return (
    <Box sx={{ width: "100%", height: "auto" }}>
      <Box sx={{ px: 4, py: 2, height: "100%" }}>
        <Typography sx={{ fontSize: "23px", fontWeight: 600 }} gutterBottom>
          {countryName}'s High-Value Opportunities to Enter Green Value Chains
        </Typography>
        <Typography type="p" sx={{ mt: 2, mb: 2, fontSize: "22px" }}>
          What opportunities in green value chains should {countryName} enter?
          Diversifying into new, more complex products drives economic growth.
          Countries are more successful at entering new industries that build on
          existing capabilities. So {countryName}'s best opportunities will
          often be new industries that leverage its existing capabilities.
        </Typography>
        <Typography type="p" sx={{ mb: 8, fontSize: "22px" }}>
          The graph below shows which opportunities are most feasible and
          attractive for {countryName}. Feasibility measures the share of
          capabilities, skills, and know-how present in {countryName} that is
          necessary to jumpstart a specific activity. Attractiveness measures
          how valuable a product is based on the capabilities it will help{" "}
          {countryName} develop. {countryName}'s best opportunities are towards
          the top right of the graph.
        </Typography>

        <Box>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              mb: 2,
            }}
          >
            {allSupplyChains.map((chain) => (
              <Button
                key={chain}
                variant={
                  selectedSupplyChains.includes(chain)
                    ? "contained"
                    : "outlined"
                }
                onClick={() => toggleSupplyChain(chain)}
                size="small"
                sx={{
                  color: "black",
                  borderColor: "black",
                  "&.MuiButton-contained": {
                    backgroundColor: "#E4F3F6",
                    "&:hover": {
                      backgroundColor: "#c9e8ed",
                    },
                  },
                  "&.MuiButton-outlined": {
                    "&:hover": {
                      backgroundColor: "rgba(228, 243, 246, 0.1)",
                    },
                  },
                }}
              >
                {getSupplyChainName(chain)}
              </Button>
            ))}
          </Box>
          <Box
            sx={{
              position: "relative",
              height: "70vh",
              mb: 6,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 45,
                  left: 20,
                }}
              >
                {/* <ReferenceArea
                  x1={0}
                  x2={1}
                  y1={0}
                  y2={1}
                  fill="#E4F3F680"
                  fillOpacity={1}
                /> */}
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="density"
                  name="Feasibility"
                  label={<CustomAxisLabel axis="x" />}
                  tick={{ fontSize: 12 }}
                  // ticks={[-1, -0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1]}
                />
                <YAxis
                  type="number"
                  dataKey="attractiveness"
                  name="Attractiveness"
                  label={<CustomAxisLabel axis="y" />}
                  tick={{ fontSize: 12 }}
                  // ticks={[-1, -0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1]}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ payload }) => {
                    if (payload && payload.length > 0) {
                      const props = payload[0].payload;
                      return (
                        <Paper
                          elevation={3}
                          sx={{
                            p: 1,
                            minWidth: 200,
                            maxWidth: 200,
                            backgroundColor: "#fff",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "16px",
                              mb: 1,
                            }}
                          >
                            {props.productName} ({props.product})
                          </Typography>

                          <hr style={{ width: "95%", margin: "10px 0" }} />

                          <Box sx={{ display: "grid", gap: 1 }}>
                            <Box>
                              <Typography>
                                Attractiveness:{" "}
                                <b>{props.attractiveness.toFixed(1)}</b>
                              </Typography>
                            </Box>
                            <Box>
                              <Typography>
                                Feasibility: <b>{props.density.toFixed(1)}</b>
                              </Typography>
                            </Box>
                            <Box>
                              <Typography>
                                Value Chains:{" "}
                                <b>
                                  {props.supplyChains
                                    .map((chainId) =>
                                      getSupplyChainName(chainId),
                                    )
                                    .join(", ")}
                                </b>
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter
                  data={filteredData}
                  dataKey="uniqueKey"
                  isAnimationActive={false}
                >
                  {filteredData.map((entry) => (
                    <Cell
                      key={entry.uniqueKey}
                      stroke="#0F8A8F"
                      strokeWidth={1}
                      fill="#0F8A8F"
                      fillOpacity={0.5}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                textAlign: "right",
                mb: 2,
                mr: 2,
              }}
            >
              Source: Growth Lab research
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductScatter;
