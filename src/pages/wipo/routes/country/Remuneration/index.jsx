import { Box, Divider } from "@mui/material";
import StatsOverview from "../../../components/StatsOverview";
import {
  Outlet,
  useLoaderData,
  useMatch,
  useOutletContext,
} from "react-router-dom";
import { useState } from "react";
import TableGraphButtons from "../../../components/controls/TableGraphButtons";
import InnovationCheckboxes from "../../../components/controls/InnovationCheckboxes";
import { drawerWidth } from "../../../components/SideBar";

const Remuneration = () => {
  const stats = useOutletContext();
  const tableView = useMatch("/country/:countryId/remuneration/table");
  const data = useLoaderData();
  const [visibleInnovations, setVisibleInnovations] = useState([
    "technology",
    "science",
    "trade",
  ]);
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
        minHeight: "100vh",
      }}
    >
      <StatsOverview stats={stats} />
      <Divider m={2} />
      <Box my={2} sx={{ display: "flex", flexFlow: "row wrap" }}>
        <TableGraphButtons />
        {!tableView && (
          <InnovationCheckboxes
            visibleInnovations={visibleInnovations}
            setVisibleInnovations={setVisibleInnovations}
          />
        )}
      </Box>
      <Outlet context={{ data, visibleInnovations }} />
    </Box>
  );
};

export default Remuneration;
