import { Box, Paper } from "@mui/material";
import { colorMap, dimensions } from "../../../../components/utils";

const TooltipContent = ({ payload: [{ payload: x } = {}] = [] }) => {
  if (!x) {
    return null;
  }

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: "350px",
      }}
    >
      <Box p={2}>
        <div>{x.field_name}</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              height: 16,
              width: 16,
              backgroundColor: colorMap[x.inno_type],
              marginRight: "5px",
            }}
          />
          <span>{dimensions[x.inno_type].label}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <b>Innovation Capability Complexity: </b>
          <span style={{ marginLeft: "5px" }}>
            {parseFloat(x.pci_together).toFixed(2)}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <b>Density: </b>{" "}
          <span>{parseFloat(x.density_together).toFixed(2)}</span>
        </div>
      </Box>
    </Paper>
  );
};
export default TooltipContent;
