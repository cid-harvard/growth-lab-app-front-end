import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Highlight as HighlightIcon,
  CropFree as CropFreeIcon,
  LegendToggle as LegendToggleIcon,
} from "@mui/icons-material";

interface SpaceVisualizationControlsProps {
  onDownload: () => void;
  selectedNodeIds: string;
  onSelectedNodeIdsChange: (ids: string) => void;
  onResetZoom: () => void;
  showLegend: boolean;
  onShowLegendChange: (show: boolean) => void;
}

export const SpaceVisualizationControls: React.FC<
  SpaceVisualizationControlsProps
> = ({
  onDownload,
  selectedNodeIds,
  onSelectedNodeIdsChange,
  onResetZoom,
  showLegend,
  onShowLegendChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempNodeIds, setTempNodeIds] = useState("");

  const handleModalOpen = () => {
    setTempNodeIds(selectedNodeIds);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSave = () => {
    onSelectedNodeIdsChange(tempNodeIds);
    setIsModalOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          position: "absolute",
          bottom: 10,
          right: 10,
          zIndex: 1000,
          display: "flex",
          gap: 1,
        }}
      >
        <Tooltip title="Set Custom Highlighting">
          <IconButton
            onClick={handleModalOpen}
            size="small"
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            <HighlightIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download Image">
          <IconButton
            onClick={onDownload}
            size="small"
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Show/Hide Legend">
          <IconButton
            onClick={() => onShowLegendChange(!showLegend)}
            size="small"
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            <LegendToggleIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset Zoom">
          <IconButton
            onClick={onResetZoom}
            size="small"
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            <CropFreeIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Dialog
        open={isModalOpen}
        onClose={handleModalClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Set Node Highlighting</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter node IDs to highlight (one per line or comma-separated)
          </Typography>
          <TextField
            multiline
            rows={6}
            fullWidth
            value={tempNodeIds}
            onChange={(e) => setTempNodeIds(e.target.value)}
            placeholder={`1234,
5678,
9012,
3456,`}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.23)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.87)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose}>Cancel</Button>
          <Button onClick={handleModalSave} variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
