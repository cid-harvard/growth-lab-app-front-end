import { Box, Divider } from "@mui/material";
import {
  Outlet,
  useLoaderData,
  useMatch,
  useOutletContext,
} from "react-router-dom";
import StatsOverview from "../../../components/StatsOverview";
import { drawerWidth } from "../../../components/SideBar";
import TableGraphButtons from "../../../components/controls/TableGraphButtons";
import SortControl from "./SortControl";
import { useState } from "react";

const Reccomendations = () => {
  const tableView = useMatch("/country/:countryId/reccomendations/table");
  const stats = useOutletContext();
  const data = useLoaderData();
  const [sort, setSort] = useState("value");

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
        overflow: "auto",
      }}
    >
      <StatsOverview stats={stats} data={data} />
      <Divider m={2} />
      <Box my={2} sx={{ display: "flex", flexFlow: "row wrap" }}>
        <TableGraphButtons />
        {!tableView && <SortControl sort={sort} setSort={setSort} />}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          mt: 2,
          flexShrink: 1,
          minHeight: 0,
        }}
      >
        <Outlet context={{ data, sort }} />
      </Box>
    </Box>
  );
};

export default Reccomendations;
