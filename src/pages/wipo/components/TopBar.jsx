import { AppBar, Box, IconButton, Toolbar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";

const TopBar = ({ handleDrawerToggle }) => {
  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>
        <Link to="/">
          <Box
            component="img"
            sx={{
              height: 28,
              filter: "invert(1)",
            }}
            alt="WIPO Lab logo"
            src={`${process.env.PUBLIC_URL}/WIPO_Logo.svg`}
          />
        </Link>
      </Toolbar>
    </AppBar>
  );
};
export default TopBar;
