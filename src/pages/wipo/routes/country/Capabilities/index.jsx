import { Box, Divider, Grid } from "@mui/material";
import { Outlet, useLoaderData, useOutletContext } from "react-router-dom";
import TableGraphButtons from "../../../components/controls/TableGraphButtons";
import StatsOverview from "../../../components/StatsOverview";
import { drawerWidth } from "../../../components/SideBar";

const Capabilities = () => {
  const data = useLoaderData();
  const stats = useOutletContext();
  return (
    <Box
      p={2}
      sx={{
        display: "flex",
        flexDirection: "column",
        width: {
          xs: "100%",
          sm: "100%",
          md: `calc(100% - ${drawerWidth}px)`,
        },
        height: "100vh",
      }}
    >
      <StatsOverview stats={stats} />
      <Divider m={2} />
      <Box my={2} sx={{ display: "flex", flexFlow: "row wrap" }}>
        <TableGraphButtons />
      </Box>

      <Outlet context={data} />
    </Box>
  );
};
export default Capabilities;
