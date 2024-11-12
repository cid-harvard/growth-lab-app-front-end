import { Box, Paper } from "@mui/material";

const TooltipContents = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper>
        <Box p={2}>
          <div className="label">{`${label}`}</div>
          {payload.map((entry, index) => (
            <div
              style={{ display: "flex", justifyContent: "space-between" }}
              key={`item-${index}`}
            >
              <span style={{ fontWeight: "bold" }}>{entry.name}:</span>{" "}
              <span style={{ paddingLeft: 5 }}>{parseInt(entry.value)}</span>
            </div>
          ))}
        </Box>
      </Paper>
    );
  }

  return null;
};

export default TooltipContents;
