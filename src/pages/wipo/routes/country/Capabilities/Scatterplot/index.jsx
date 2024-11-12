import {
  Label,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
} from "recharts";
import { colorMap } from "../../../../components/utils";
import { useOutletContext } from "react-router-dom";
import { extent, group } from "d3-array";
import TooltipContent from "./TooltipContent";
import { PointLegend } from "../../../../components/PointLegend";
import { Box } from "@mui/material";
import XAxisLabel from "../../../../components/XAxisLabel";
import YAxisLabel from "../../../../components/YAxisLabel";
import {
  densityDescription,
  innovationCapabilityComplexity,
} from "../../../../assets/descriptions";
import { useEffect, useState } from "react";

const ScatterPlot = () => {
  const data = useOutletContext();
  const [animationActive, setAnimationActive] = useState(false);

  //no entry animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationActive(true);
    }, 10);
    return () => clearTimeout(timer);
  }, []);
  const groupedData = group(
    data.map((d) => ({
      ...d,
      pci_together: parseFloat(d.pci_together),
      density_together: parseFloat(d.density_together),
    })),
    (d) => d.inno_type,
  );
  const xDomain = extent(data, (d) => d.density_together);
  const yDomain = extent(data, (d) => d.pci_together);

  return (
    <>
      <Box
        aria-label="Scatter shart showing countries arranged by density and innovation complexity."
        px={2}
        role="img"
        sx={{
          height: "100%",
          display: "flex",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            }}
          >
            <XAxis
              domain={xDomain}
              type="number"
              dataKey="density_together"
              name="Density"
              tickFormatter={(d) => parseFloat(d).toFixed(1)}
            >
              <Label
                value="Density"
                offset={20}
                position="insideBottom"
                content={<XAxisLabel tooltipValue={densityDescription} />}
              />
            </XAxis>
            <ZAxis range={[30, 30]} />
            <YAxis
              domain={yDomain}
              type="number"
              dataKey="pci_together"
              name={"Innovation Capability Complexity"}
              tickFormatter={(d) => parseFloat(d).toFixed(1)}
            >
              <Label
                angle={270}
                value="Innovation Capability Complexity"
                offset={55}
                position="insideLeft"
                content={
                  <YAxisLabel tooltipValue={innovationCapabilityComplexity} />
                }
              />
            </YAxis>
            <Tooltip cursor={{ stroke: "none" }} content={<TooltipContent />} />
            {[...groupedData.entries()].map(([inno_type, d], i) => {
              return (
                <Scatter
                  key={i}
                  name={inno_type}
                  data={d}
                  fill={colorMap[inno_type]}
                  animationDuration={600}
                  isAnimationActive={animationActive}
                />
              );
            })}
          </ScatterChart>
        </ResponsiveContainer>
      </Box>
      <PointLegend
        groups={Object.entries(colorMap)
          .filter(([name]) => /^[A-Z]/.test(name))
          .map(([name, color]) => ({
            name,
            color,
          }))}
      />
    </>
  );
};
export default ScatterPlot;
