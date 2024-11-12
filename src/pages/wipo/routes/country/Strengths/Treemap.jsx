import Plot from "react-plotly.js";
import { useOutletContext } from "react-router-dom";
import { colorMap } from "../../../components/utils";
import { Box, Container, Typography } from "@mui/material";
import { useParentSize } from "@visx/responsive";
import { rollup } from "d3-array";
import { sum } from "d3-array";
import { dimensions } from "../../../components/utils";
import LightTooltip from "../../../components/LightTooltip";

const Treemap = () => {
  const { data, visibleInnovations } = useOutletContext();
  const { parentRef, width, height } = useParentSize({ debounceTime: 150 });

  const labels = [];
  const parents = [];
  const values = [];
  const colors = [];

  data.forEach((item) => {
    if (visibleInnovations.includes(item.inno_type)) {
      labels.push(item.sector_name);
      parents.push(item.inno_type);
      values.push(item.mcp);
      colors.push(colorMap[item.inno_type]);
    }
  });

  const uniqueInnoTypes = [...new Set(data.map((item) => item.inno_type))];
  const parentTotals = rollup(
    data,
    (v) => sum(v, (d) => d.mcp),
    (d) => d.inno_type,
  );
  const totalCapabilities = sum(data, (d) => d.mcp);

  //add parent capabilities
  uniqueInnoTypes.forEach((type) => {
    if (visibleInnovations.includes(type)) {
      labels.push(type);
      parents.push("Innovation Capabilities");
      values.push(0);
      colors.push(colorMap[type]);
    }
  });

  // Add the root entry
  labels.push("Innovation Capabilities");
  parents.push("");
  values.push(0);
  colors.push("#FFFFFF");
  const treemapData = [
    {
      type: "treemap",
      labels: labels,
      parents: parents,
      values: values,
      marker: {
        colors: colors,
      },
      hovertemplate:
        "<b>%{customdata.label}</b><br>%{customdata.value}<extra></extra>",
      hoverlabel: {
        bgcolor: "white",
        padding: 10,
        font: {
          family: "Source Sans Pro, sans-serif",
          size: 16,
          weight: 400,
        },
      },
      customdata: labels.map((label, index) => {
        if (label === "Innovation Capabilities") {
          return { label, value: `${totalCapabilities} Total Capabilities` };
        } else if (parentTotals.get(label)) {
          return {
            label: dimensions[label].label,
            value: `${parentTotals.get(label)} Capabilities`,
          };
        } else {
          return { label, value: `${values[index]} Capabilities` };
        }
      }),
      textinfo: "label+text",
      text: labels.map((label, index) => {
        if (label === "Innovation Capabilities") {
          return `${totalCapabilities} Total Capabilities`;
        } else if (parentTotals.get(label)) {
          return `${parentTotals.get(label)} Capabilities`;
        } else {
          return `${values[index]} Capabilities`;
        }
      }),
      root: { color: "rgba(0,0,0,0)" },
    },
  ];

  const layout = {
    height: height - 100,
    width,
    margin: { l: 0, r: 0, t: 0, b: 0 },
    pathbar: { visible: true },
    font: {
      family: "Source Sans Pro, sans-serif",
      size: 16,
      weight: 400,
    },
  };

  return (
    <Container ref={parentRef} sx={{ height: "100vh" }}>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          mt: 0,
          flexShrink: 1,
          minHeight: 0,
          "& svg": {
            "& g text[data-unformatted='technology']": {
              fontWeight: "600 !important",
              textTransform: "capitalize",
              fontSize: "18px !important",
            },
            "& g text[data-unformatted='science']": {
              fontWeight: "600 !important",
              textTransform: "capitalize",
              fontSize: "18px !important",
            },
            "& g text[data-unformatted='trade']": {
              fontWeight: "600 !important",
              textTransform: "capitalize",
              fontSize: "18px !important",
            },
            "& g text[data-unformatted='Innovation Capabilities']": {
              fontWeight: "600 !important",
              textTransform: "capitalize",
              fontSize: "20px !important",
            },
          },
        }}
      >
        <Box
          sx={{
            zIndex: 1000,
            display: "flex",
            mb: 1,
          }}
        >
          <Typography variant="subtitle1">
            Rectangles are sized by number of{" "}
            <LightTooltip
              title="Drivers of innovation revealed through the production, patents and scientific publications"
              placement="right"
            >
              <span
                style={{
                  textDecoration: "underline dotted",
                }}
              >
                Innovation Capabilities
              </span>
            </LightTooltip>
          </Typography>
        </Box>

        <Plot
          data={treemapData}
          layout={layout}
          config={{
            responsive: true,
            displayModeBar: false,
            showLink: false,
            displaylogo: false,
            maxdepth: 2,
          }}
        />
      </Box>
    </Container>
  );
};

export default Treemap;
