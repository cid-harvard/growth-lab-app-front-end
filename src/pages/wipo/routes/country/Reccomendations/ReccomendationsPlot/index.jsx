import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Scatter,
  ComposedChart,
  ResponsiveContainer,
} from "recharts";
import { useOutletContext } from "react-router-dom";
import RectangleShape from "./RectangleShape";
import { extent } from "d3-array";
import { Typography } from "@mui/material";

import { useParentSize } from "@visx/responsive";
import TooltipContents from "./TooltipContents";

const CustomYAxisTick = (props) => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={6} textAnchor="end" fontSize={12}>
        {payload.value}
      </text>
    </g>
  );
};

const RecommendationsPlot = () => {
  const { parentRef, height: containerHeight } = useParentSize({
    debounceTime: 10,
  });

  const { data, sort } = useOutletContext();

  const barSize = containerHeight * 0.05;

  const dataWithMissing = data.map((d) => ({
    ...d,
    missing: parseFloat(d.expected_value) - parseFloat(d.value),
  }));
  const sortedData = dataWithMissing.sort((d1, d2) => d2[sort] - d1[sort]);
  const xExtent = extent(
    [
      ...dataWithMissing.map((d) => d.value),
      ...dataWithMissing.map((d) => d.expected_value),
    ].map((d) => parseFloat(d)),
  );

  return (
    <>
      <Typography sx={{ textAlign: "center", fontSize: 18, fontWeight: 600 }}>
        Number of Expected Patents (based on Papers) Realized by Sector
      </Typography>

      <div
        ref={parentRef}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            layout="vertical"
            data={sortedData}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 78,
            }}
          >
            <XAxis
              domain={xExtent}
              type="number"
              tickFormatter={(value) => Math.round(value)}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              dataKey="sector_name"
              type="category"
              tick={<CustomYAxisTick />}
              tickCount={data.length}
              interval={0}
            />
            <Tooltip
              content={<TooltipContents />}
              cursor={{ stroke: "#f2f2f2", strokeWidth: barSize }}
            />
            <Legend />
            <Bar
              isAnimationActive={false}
              name="Actual Value"
              dataKey="value"
              barSize={barSize}
              fill="#ff7300"
            />
            <Scatter
              isAnimationActive={false}
              name="Expected Value"
              dataKey="expected_value"
              shape={<RectangleShape width={3} height={barSize} fill="black" />}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default RecommendationsPlot;
