import { Box, Divider } from "@mui/material";
import {
  Outlet,
  useLoaderData,
  useMatch,
  useOutletContext,
} from "react-router-dom";
import StatsOverview from "../../../components/StatsOverview";
import TableGraphButtons from "../../../components/controls/TableGraphButtons";
import { useState } from "react";
import InnovationCheckboxes from "../../../components/controls/InnovationCheckboxes";
import { drawerWidth } from "../../../components/SideBar";

const Strengths = () => {
  const stats = useOutletContext();
  const data = useLoaderData();
  const tableView = useMatch("/country/:countryId/strengths/table");
  const uniqueInnoTypes = [...new Set(data.map((item) => item.inno_type))];
  const [visibleInnovations, setVisibleInnovations] = useState(uniqueInnoTypes);

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
        height: "auto",
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
      <Outlet context={{ data, visibleInnovations, setVisibleInnovations }} />
    </Box>
  );
};

export default Strengths;
