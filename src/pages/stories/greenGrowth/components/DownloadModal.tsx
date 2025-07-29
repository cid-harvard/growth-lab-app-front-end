import React from "react";
import { Modal, Box, Button, IconButton, Typography } from "@mui/material";
import {
  Close as CloseIcon,
  Image as ImageIcon,
  InsertDriveFile as DataIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useCountrySelection, useYearSelection } from "../hooks/useUrlParams";
import { useCountryName } from "../queries/useCountryName";
import { useProcessedTableData } from "../hooks/useProcessedTableData";
import { downloadBothCSVs } from "../utils/csvExport";
import { useImageCaptureContext } from "../hooks/useImageCaptureContext";
import { useLocation } from "react-router-dom";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: "600px" },
  height: "400px",
  bgcolor: "background.paper",
  border: "none",
  borderRadius: "8px",
  boxShadow: 24,
  outline: "none",
  display: "flex",
  flexDirection: "column",
};

interface DownloadModalProps {
  open: boolean;
  onClose: () => void;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ open, onClose }) => {
  const selectedYear = useYearSelection();
  const selectedCountry = useCountrySelection();
  const countryName = useCountryName();
  const location = useLocation();

  // Check if we're in table view
  const isTableView = location.pathname.endsWith("/table");

  // Image capture functionality
  const { captureFunction, isImageAvailable } = useImageCaptureContext();

  // Use the shared data processing hook
  const { processedProductsData, processedCountryData } = useProcessedTableData(
    selectedCountry,
    parseInt(selectedYear),
    true,
  );

  const handleDataDownload = () => {
    downloadBothCSVs(
      processedProductsData,
      processedCountryData,
      countryName,
      selectedYear,
    );
  };

  const handleImageDownload = async () => {
    if (isTableView) {
      console.log("Image download not available in table view");
      return;
    }

    if (!isImageAvailable || !captureFunction) {
      console.log("Image capture function not available");
      return;
    }

    try {
      await captureFunction();
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return (
    <Modal open={open} onClose={onClose} disablePortal={true}>
      <Box sx={modalStyle}>
        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "grey.500",
            zIndex: 1,
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Main content - Two large buttons */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            padding: 3,
            gap: 3,
          }}
        >
          {/* Download Image Button */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                isTableView || !isImageAvailable ? "#F5F5F5" : "#E8F4FD",
              borderRadius: 2,
              padding: 4,
              cursor:
                isTableView || !isImageAvailable ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              opacity: isTableView || !isImageAvailable ? 0.5 : 1,
              "&:hover": {
                backgroundColor:
                  isTableView || !isImageAvailable ? "#F5F5F5" : "#D1E9F6",
                transform:
                  isTableView || !isImageAvailable
                    ? "none"
                    : "translateY(-2px)",
              },
            }}
            onClick={handleImageDownload}
          >
            <ImageIcon
              sx={{
                fontSize: 64,
                color: isTableView || !isImageAvailable ? "#999" : "#106496",
                mb: 2,
              }}
            />
            <Button
              variant="text"
              sx={{
                fontSize: "18px",
                fontWeight: 600,
                color: isTableView || !isImageAvailable ? "#999" : "#106496",
                textTransform: "uppercase",
                letterSpacing: "1px",
                pointerEvents: "none",
              }}
            >
              <DownloadIcon />
              Download Image
            </Button>
          </Box>

          {/* Download Data Button */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#E8F4FD",
              borderRadius: 2,
              padding: 4,
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "#D1E9F6",
                transform: "translateY(-2px)",
              },
            }}
            onClick={handleDataDownload}
          >
            <DataIcon
              sx={{
                fontSize: 64,
                color: "#106496",
                mb: 2,
              }}
            />
            <Button
              variant="text"
              sx={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#106496",
                textTransform: "uppercase",
                letterSpacing: "1px",
                pointerEvents: "none",
              }}
            >
              <DownloadIcon />
              Download Data
            </Button>
          </Box>
        </Box>
        <Typography
          variant="h3"
          sx={{ textAlign: "center", m: 2, color: "black" }}
        >
          Download a high-resolution image of the current visualization or all
          available Greenplexity data.{" "}
        </Typography>
      </Box>
    </Modal>
  );
};

export default DownloadModal;
