import {
  Label,
  LabelList,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import LabelContents from "./LabelContents";
import Circle from "./Circle";
import { Box } from "@mui/material";
import { incomeGroups } from "../utils";
import TooltipContents from "./TooltipContents";
import { group } from "d3-array";
import { useParams } from "react-router-dom";
import YAxisLabel from "../../../../components/YAxisLabel";
import XAxisLabel from "../../../../components/XAxisLabel";
import {
  diversityDescription,
  ubiquityDescription,
} from "../../../../assets/descriptions";
import { Fragment } from "react";

const normalizeData = (data, xKey, yKey, xMax, yMax) => {
  return data.map((d) => ({
    ...d,
    [xKey]: d[xKey] / xMax,
    [yKey]: Math.min(d[yKey] / yMax, 1),
  }));
};

const sortData = (data, countryId) => {
  return data.sort((a, b) => {
    if (a.unit === countryId) return -1;
    if (b.unit === countryId) return 1;
    return 0;
  });
};

const Plot = ({
  data = [],
  title = "",
  visibleInnovations = [],
  highlightedCountry,
  highlightCountry,
}) => {
  const { countryId } = useParams();
  const normalizedData = normalizeData(
    data,
    "diversity",
    "avg_ubiquity",
    140,
    100,
  );
  const incomeGroupData = group(normalizedData, (d) => d.income_group);
  const focusIncomeGroup = normalizedData.find(
    (d) => d.unit === countryId,
  ).income_group;

  return (
    <>
      <Box
        sx={{
          fontSize: "18px",
          width: "100%",
          textAlign: "center",
          fontWeight: 600,
        }}
      >
        {title}
      </Box>
      <ResponsiveContainer width="100%" height="90%">
        <ScatterChart
          margin={{
            top: 10,
            right: 10,
            bottom: 17,
            left: 0,
          }}
        >
          <XAxis
            domain={[0, 1]}
            type="number"
            dataKey="diversity"
            name="diversity"
          >
            <Label
              value="Diversity"
              offset={28}
              position="insideBottom"
              content={<XAxisLabel tooltipValue={diversityDescription} />}
            />
          </XAxis>
          <YAxis
            domain={[0, 1]}
            type="number"
            dataKey="avg_ubiquity"
            name={"Average Ubiquity"}
            tickFormatter={(tick) => tick}
          >
            <Label
              angle={270}
              value="Average Ubiquity"
              offset={60}
              position="insideLeft"
              content={<YAxisLabel tooltipValue={ubiquityDescription} />}
            />
          </YAxis>
          <Tooltip cursor={{ stroke: "none" }} content={<TooltipContents />} />

          {Object.entries(incomeGroups)
            .sort(([a], [b]) => {
              if (a === focusIncomeGroup) return 1;
              if (b === focusIncomeGroup) return -1;
              return 0;
            })
            .map(([group_abbrev, info]) => {
              const groupData =
                sortData(incomeGroupData.get(group_abbrev), countryId) || [];

              return (
                <Fragment key={`${group_abbrev}-series`}>
                  <Scatter
                    name={`${info.name} Income`}
                    data={groupData}
                    fill={info.color}
                    onMouseEnter={({ unit }) => highlightCountry(unit)}
                    onMouseLeave={() => highlightCountry(null)}
                    shape={
                      <Circle
                        visibleInnovations={visibleInnovations}
                        highlightedCountry={highlightedCountry}
                      />
                    }
                    isAnimationActive={false}
                  >
                    <LabelList
                      position="top"
                      valueAccessor={(d) =>
                        d.unit === countryId ? d.unit_name : ""
                      }
                      content={<LabelContents />}
                    />
                  </Scatter>
                </Fragment>
              );
            })}
        </ScatterChart>
      </ResponsiveContainer>
    </>
  );
};

export default Plot;
