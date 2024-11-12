import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import NavItem from "./controls/NavItem";
import CountryInput from "./controls/CountryInput";
import CapabilitiesExplanation from "./explanations/CapabilitiesExplanation";
import StrengthsExplanation from "./explanations/StrengthsExplanation";
import RemunerationExplanation from "./explanations/RemunerationExplanation";
import ReccomendationsExplanation from "./explanations/ReccomendationsExplanation";
import { useLocation } from "react-router-dom";

export const drawerWidth = 328;

const Explanation = ({ page, stats }) => {
  const explanations = {
    capabilities: <CapabilitiesExplanation stats={stats} />,
    strengths: <StrengthsExplanation stats={stats} />,
    remuneration: <RemunerationExplanation stats={stats} />,
    reccomendations: <ReccomendationsExplanation stats={stats} />,
  };
  return explanations[page];
};

function ResponsiveDrawer({
  mobileOpen,
  handleDrawerClose,
  handleDrawerTransitionEnd,
  parentRef,
  stats,
}) {
  const location = useLocation();
  const page = location.pathname.split("/")[4];

  const drawer = (
    <List sx={{ height: "100%" }}>
      <ListItem>
        <CountryInput />
      </ListItem>
      <NavItem text="What is your country good at?" route="strengths" />
      <NavItem
        text="How rewarding are your country's capabilities?"
        route="remuneration"
      />
      <NavItem
        text="Where can your country find promising capabilities?"
        route="capabilities"
      />
      <NavItem
        text="What are the missing links in the innovation dimension?"
        route="reccomendations"
      />
      <Explanation page={page} stats={stats} />
    </List>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { md: drawerWidth },
        position: "relative",
        flex: 1,
      }}
      aria-label="Country information pages"
    >
      <Drawer
        container={parentRef?.current}
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerClose}
        onTransitionEnd={handleDrawerTransitionEnd}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: mobileOpen
            ? { xs: "inline", sm: "inline", md: "none" }
            : "none",
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            height: "100%",
            backgroundColor: "#F1F0EA",
          },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "none", md: "inline" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            backgroundColor: "#F1F0EA",
          },
          "& .MuiPaper-root": {
            position: "relative",
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}

export default ResponsiveDrawer;
