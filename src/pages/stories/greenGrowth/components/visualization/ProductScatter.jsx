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
import { countrySelectionState } from "../Story";
import { yearSelectionState } from "../ScrollApp";

// Existing helper functions
const createUniqueProductKey = (product, country) => {
  return `${product}-${country}`;
};

const getProductColor = (product) => {
  let hash = 0;
  for (let i = 0; i < product.length; i++) {
    hash = product.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = "#" + ((hash & 0x00ffffff) | 0x1000000).toString(16).slice(1);
  return color;
};

const ProductScatter = () => {
  const selectedCountry = useRecoilValue(countrySelectionState);
  const selectedYear = useRecoilValue(yearSelectionState);

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

        return {
          product: item.productId,
          productName: productDetails?.nameShortEn,
          cog: parseFloat(item.attractiveness),
          density: parseFloat(item.feasibility),
          color: getProductColor(item.productId),
          supplyChains: supplyChains.map((sc) => {
            const supplyChainDetails = supplyChainLookup.get(sc.supplyChainId);
            return supplyChainDetails
              ? supplyChainDetails.supplyChain
              : sc.supplyChainId;
          }),
          uniqueKey: createUniqueProductKey(item.productId, selectedCountry),
        };
      })
      .filter((d) => d.cog && d.density);
  }, [
    currentData,
    productLookup,
    supplyChainProductLookup,
    selectedCountry,
    supplyChainLookup,
  ]);

  const allSupplyChains = useMemo(() => {
    const chains = new Set();
    scatterData.forEach((item) => {
      item.supplyChains.forEach((chain) => chains.add(chain));
    });
    return Array.from(chains).sort();
  }, [scatterData]);

  const [selectedSupplyChains, setSelectedSupplyChains] =
    useState(allSupplyChains);

  const filteredData = useMemo(() => {
    return scatterData.filter(
      (d) =>
        selectedSupplyChains.length === 0 ||
        d.supplyChains.some((chain) => selectedSupplyChains.includes(chain)),
    );
  }, [scatterData, selectedSupplyChains]);

  const toggleSupplyChain = (chain) => {
    setSelectedSupplyChains((prev) =>
      prev.includes(chain) ? prev.filter((c) => c !== chain) : [...prev, chain],
    );
  };

  return (
    <div style={{ width: "100%", height: 600 }}>
      <h1>Product Scatter</h1>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 60,
            left: 60,
          }}
        >
          <CartesianGrid />
          <XAxis
            type="number"
            dataKey="density"
            name="Density"
            label={{
              value: "Density",
              position: "bottom",
              offset: 40,
            }}
          />
          <YAxis
            type="number"
            dataKey="cog"
            name="COG"
            domain={[-2, 2]}
            label={{
              value: "COG",
              angle: -90,
              position: "insideLeft",
              offset: -40,
            }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ payload }) => {
              if (payload && payload.length > 0) {
                const props = payload[0].payload;
                return (
                  <div
                    style={{
                      backgroundColor: "white",
                      padding: "10px",
                      border: "1px solid #ccc",
                    }}
                  >
                    <p>Product: {props.product}</p>
                    <p>Name: {props.productName}</p>
                    <p>Density: {props.density.toFixed(2)}</p>
                    <p>COG: {props.cog.toFixed(2)}</p>
                    <p>Supply Chains: {props.supplyChains.join(", ")}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter
            name="Products"
            data={filteredData}
            isAnimationActive={false}
          >
            {filteredData.map((entry) => (
              <Cell key={entry.uniqueKey} fill={entry.color} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductScatter;
