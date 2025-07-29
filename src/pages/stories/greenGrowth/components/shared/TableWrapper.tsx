import React from "react";
import { Box, Button, useTheme, useMediaQuery } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { TableChart as TableIcon } from "@mui/icons-material";
import DataTable, { DataTableType } from "./DataTable";

interface TableWrapperProps {
  children: React.ReactNode;
  defaultDataType: DataTableType;
  selectedProducts?: any[];
}

const TableWrapper: React.FC<TableWrapperProps> = ({
  children,
  defaultDataType,
  selectedProducts,
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
    return (
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            p: 1,
            borderBottom: 1,
            borderColor: "grey.200",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            onClick={handleToggleView}
            sx={{ minWidth: isMobile ? "auto" : "120px" }}
          >
            Back to Chart
          </Button>
        </Box>
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
      <Box
        sx={{
          position: "absolute",
          top: isMobile ? 8 : 16,
          right: isMobile ? 8 : 16,
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          size={isMobile ? "small" : "medium"}
          onClick={handleToggleView}
          startIcon={<TableIcon />}
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            color: "primary.main",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 1)",
            },
            fontSize: isMobile ? "0.75rem" : "0.875rem",
            minWidth: isMobile ? "auto" : "120px",
          }}
        >
          {isMobile ? "" : "Table"}
        </Button>
      </Box>
    </Box>
  );
};

export default TableWrapper;
