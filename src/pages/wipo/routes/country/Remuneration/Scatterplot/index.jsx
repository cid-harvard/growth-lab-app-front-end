import { Box, Grid } from "@mui/material";
import { group } from "d3-array";
import { useOutletContext } from "react-router-dom";
import { incomeGroups } from "../utils";
import { useState } from "react";
import { PointLegend } from "../../../../components/PointLegend";
import Plot from "./Plot";

const InnovationGridItem = ({
  data,
  title,
  visibleInnovations,
  highlightedCountry,
  highlightCountry,
  paddingLeft,
  paddingRight,
}) => (
  <Grid
    item
    xs={12}
    sm={12}
    md={visibleInnovations.length === 1 ? 12 : 6}
    lg={12 / visibleInnovations.length || 0}
    sx={{
      paddingLeft: { xs: 0, sm: paddingLeft || 0 },
      paddingRight: { xs: 0, sm: paddingRight || 0 },
      display: "flex",
      flexDirection: "column",
      flexGrow: 1,
      flexShrink: 1,
      height: {
        xs: `${90 / visibleInnovations.length}vh`,
        sm: `${90 / visibleInnovations.length}vh`,

        md: visibleInnovations.length === 1 ? "30vh" : "45vh",
        lg: "90vh",
      },
    }}
  >
    <Plot
      data={data}
      title={title}
      visibleInnovations={visibleInnovations}
      highlightedCountry={highlightedCountry}
      highlightCountry={highlightCountry}
    />
  </Grid>
);

const Scatterplots = () => {
  const [highlightedCountry, highlightCountry] = useState();
  const { data, visibleInnovations } = useOutletContext();
  const sortedData = data;
  const groupedData = group(sortedData, (d) => d.inno_type);
  const scienceData = groupedData.get("science");
  const tradeData = groupedData.get("trade");
  const techData = groupedData.get("technology");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Grid container spacing={0} sx={{ flex: 1 }}>
        {visibleInnovations.includes("trade") && (
          <InnovationGridItem
            data={tradeData}
            title="Trade"
            visibleInnovations={visibleInnovations}
            highlightedCountry={highlightedCountry}
            highlightCountry={highlightCountry}
          />
        )}
        {visibleInnovations.includes("science") && (
          <InnovationGridItem
            data={scienceData}
            title="Science"
            visibleInnovations={visibleInnovations}
            highlightedCountry={highlightedCountry}
            highlightCountry={highlightCountry}
            paddingLeft={2}
          />
        )}
        {visibleInnovations.includes("technology") && (
          <InnovationGridItem
            data={techData}
            title="Technology"
            visibleInnovations={visibleInnovations}
            highlightedCountry={highlightedCountry}
            highlightCountry={highlightCountry}
            paddingLeft={2}
            paddingRight={2}
          />
        )}
      </Grid>
      <PointLegend
        groups={incomeGroups}
        nameFormatter={(name) => name + " Income"}
      />
    </Box>
  );
};
export default Scatterplots;
