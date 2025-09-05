import React from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import DataTable, { DataTableType } from "./DataTable";

interface TableWrapperProps {
  children: React.ReactNode;
  defaultDataType: DataTableType;
  selectedProducts?: any[];
  showDisplaySwitch?: boolean; // deprecated: use DisplayAsSwitch inline in visualization if needed
}

const TableWrapper: React.FC<TableWrapperProps> = ({
  children,
  defaultDataType,
  selectedProducts,
  showDisplaySwitch = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isTableView = location.pathname.endsWith("/table");

  const handleToggleView = () => {
    if (isTableView) {
      // Navigate back to the visualization by removing "/table"
      const basePath = location.pathname.replace("/table", "");
      navigate(
        {
          pathname: basePath,
          search: location.search, // Preserve search parameters (country, year, etc.)
        },
        { replace: true },
      );
    } else {
      // Navigate to table view
      navigate(
        {
          pathname: `${location.pathname}/table`,
          search: location.search, // Preserve search parameters (country, year, etc.)
        },
        { replace: true },
      );
    }
  };

  if (isTableView) {
    // Let DataTable render its own controls; no separate header here
    return (
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <DataTable
            defaultDataType={defaultDataType}
            selectedProducts={selectedProducts}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", position: "relative" }}>
      {children}
      {showDisplaySwitch && (
        <Box
          sx={{
            position: "absolute",
            top: isMobile ? 8 : 16,
            left: isMobile ? 8 : 16,
            zIndex: 1000,
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: 1,
            p: isMobile ? 0.5 : 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{ fontSize: isMobile ? "12px" : "14px", color: "#000" }}
            >
              Display As
            </Typography>
            <ButtonGroup size={isMobile ? "small" : "medium"}>
              <Button
                aria-pressed={!isTableView}
                onClick={() => isTableView && handleToggleView()}
              >
                GRAPH
              </Button>
              <Button
                aria-pressed={isTableView}
                onClick={() => !isTableView && handleToggleView()}
              >
                TABLE
              </Button>
            </ButtonGroup>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TableWrapper;
