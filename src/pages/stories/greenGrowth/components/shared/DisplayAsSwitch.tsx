import React from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

interface DisplayAsSwitchProps {
  sx?: any;
}

const DisplayAsSwitch: React.FC<DisplayAsSwitchProps> = ({ sx }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isTableView = location.pathname.endsWith("/table");

  const goGraph = () => {
    if (isTableView) {
      const basePath = location.pathname.replace("/table", "");
      navigate(
        { pathname: basePath, search: location.search },
        { replace: true },
      );
    }
  };

  const goTable = () => {
    if (!isTableView) {
      navigate(
        { pathname: `${location.pathname}/table`, search: location.search },
        { replace: true },
      );
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, ...sx }}>
      <Typography sx={{ fontSize: isMobile ? "12px" : "14px", color: "#000" }}>
        Display As
      </Typography>
      <ButtonGroup size={isMobile ? "small" : "medium"}>
        <Button aria-pressed={!isTableView} onClick={goGraph}>
          GRAPH
        </Button>
        <Button aria-pressed={isTableView} onClick={goTable}>
          TABLE
        </Button>
      </ButtonGroup>
    </Box>
  );
};

export default DisplayAsSwitch;
