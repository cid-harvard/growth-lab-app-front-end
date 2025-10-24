import type React from "react";
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
import { generateProductsCSV } from "../utils/csvExport";
import { useImageCaptureContext } from "../hooks/useImageCaptureContext";
import { useLocation } from "react-router-dom";

const modalStyle = {
  position: "absolute",
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
  customImageHandler?: () => Promise<void>;
  customDataHandler?: () => void;
  imageAvailable?: boolean;
  descriptionText?: string;
}

const DownloadModal: React.FC<DownloadModalProps> = ({
  open,
  onClose,
  customImageHandler,
  customDataHandler,
  imageAvailable,
  descriptionText,
}) => {
  const selectedYear = useYearSelection();
  const selectedCountry = useCountrySelection();
  const countryName = useCountryName();
  const location = useLocation();

  // Check if we're in table view
  const isTableView = location.pathname.endsWith("/table");

  // Image capture functionality
  const { captureFunction, isImageAvailable } = useImageCaptureContext();

  // Use the shared data processing hook
  const { processedProductsData } = useProcessedTableData(
    selectedCountry,
    parseInt(selectedYear),
    false,
  );

  // Use custom handlers if provided, otherwise use default behavior
  const finalImageAvailable =
    imageAvailable !== undefined ? imageAvailable : isImageAvailable;

  // Generate default description text with country name
  const defaultDescriptionText = `Download a high-resolution image of the current visualization or data for ${countryName}.`;

  const handleDataDownload = () => {
    if (customDataHandler) {
      customDataHandler();
    } else {
      generateProductsCSV(processedProductsData, countryName, selectedYear);
    }
  };

  const handleImageDownload = async () => {
    if (customImageHandler) {
      try {
        await customImageHandler();
      } catch (error) {
        console.error("Error downloading image:", error);
      }
      return;
    }

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
        {/* Header with close button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            pr: 1,
            pt: 1,
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              color: "grey.500",
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

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
              backgroundColor: !finalImageAvailable ? "#F5F5F5" : "#E8F4FD",
              borderRadius: 2,
              padding: 4,
              cursor: !finalImageAvailable ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              opacity: !finalImageAvailable ? 0.5 : 1,
              "&:hover": {
                backgroundColor: !finalImageAvailable ? "#F5F5F5" : "#D1E9F6",
                transform: !finalImageAvailable ? "none" : "translateY(-2px)",
              },
            }}
            onClick={handleImageDownload}
          >
            <ImageIcon
              sx={{
                fontSize: 64,
                color: !finalImageAvailable ? "#999" : "#106496",
                mb: 2,
              }}
            />
            <Button
              variant="text"
              sx={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: !finalImageAvailable ? "#999" : "#106496",
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
                fontSize: "1.125rem",
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
          {descriptionText || defaultDescriptionText}
        </Typography>
      </Box>
    </Modal>
  );
};

export default DownloadModal;
