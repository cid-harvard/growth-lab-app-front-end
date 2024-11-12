import { Outlet, useLoaderData, useLocation } from "react-router-dom";
import ResponsiveDrawer from "../../components/SideBar";
import { useRef, useState } from "react";
import TopBar from "../../components/TopBar";
import { useTheme } from "@emotion/react";
import { useMediaQuery } from "@mui/material";

const Country = () => {
  let { state } = useLocation();
  const stats = useLoaderData();
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.between("xs", "md"));

  const [mobileOpen, setMobileOpen] = useState(
    !!state?.sidebar && isMobileView,
  );

  const parentRef = useRef();
  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen((o) => !o);
  };
  return (
    <>
      <div>
        <TopBar handleDrawerToggle={handleDrawerToggle} />
      </div>
      <div ref={parentRef} style={{ display: "flex", height: "auto" }}>
        <ResponsiveDrawer
          handleDrawerClose={handleDrawerClose}
          mobileOpen={mobileOpen}
          parentRef={parentRef}
          stats={stats}
        />
        <Outlet context={stats} />
      </div>
    </>
  );
};
export default Country;
