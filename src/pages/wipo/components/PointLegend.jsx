import { Box, Grid } from "@mui/material";

export const PointLegend = ({ groups, nameFormatter = (d) => d }) => {
  return (
    <Box>
      <Grid container justifyContent="center">
        {Object.values(groups).map((group) => (
          <Grid pl={3} key={group.name} item sx={{ display: "flex" }}>
            <svg height={22} width={22}>
              <circle cx={11} cy={11} r={5} fill={group.color} />
            </svg>
            <div>{nameFormatter(group.name)}</div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
