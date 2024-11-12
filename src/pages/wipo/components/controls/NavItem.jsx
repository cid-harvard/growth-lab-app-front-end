import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useMatch, Link, useLocation } from "react-router-dom";

const NavItem = ({ text, route }) => {
  const match = useMatch(`/wipo/country/:countryId/${route}/*`);
  const { pathname } = useLocation();

  const tableView = pathname.includes("/table");

  return (
    <ListItem disablePadding>
      <ListItemButton
        sx={{ minHeight: 0, minWidth: 0 }}
        selected={match}
        component={Link}
        to={tableView ? `${route}/table` : route}
      >
        <ListItemIcon alt="" sx={{ minWidth: "20px" }}>
          <svg style={{ height: "40px", width: "12px" }}>
            <rect
              opacity={match ? 1 : 0.3}
              height="100%"
              width="100%"
              fill="#D79823"
            />
          </svg>
        </ListItemIcon>
        <ListItemText
          sx={{ opacity: match ? 1 : 0.9, lineHeight: 1 }}
          primary={text}
        />
      </ListItemButton>
    </ListItem>
  );
};
export default NavItem;
