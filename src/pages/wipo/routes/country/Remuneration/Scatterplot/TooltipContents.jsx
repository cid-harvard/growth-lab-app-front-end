import { Box, Paper } from "@mui/material";

const TooltipContents = ({ payload: [{ payload: x } = {}] = [] }) => {
  if (!x) {
    return null;
  }
  return (
    <Paper sx={{ display: "flex", flexDirection: "column" }}>
      <Box p={2}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <b>Country:</b>
          <span style={{ marginLeft: "5px" }}>{x.unit_name}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <b>Average Ubiquity:</b>
          <span style={{ marginLeft: "5px" }}>
            {parseFloat(x.avg_ubiquity).toFixed(2)}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <b>Diversity:</b>
          <span style={{ marginLeft: "5px" }}>
            {parseFloat(x.diversity).toFixed(2)}
          </span>
        </div>
      </Box>
    </Paper>
  );
};

export default TooltipContents;
