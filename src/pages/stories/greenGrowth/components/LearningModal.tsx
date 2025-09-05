import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  AccountTree as AccountTreeIcon,
} from "@mui/icons-material";
import SankeyTree from "./visualization/SankeyTree/index";

interface LearningModalProps {
  open: boolean;
  onClose: () => void;
}

const LearningModal: React.FC<LearningModalProps> = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          width: "95vw",
          height: "95vh",
          maxWidth: "none",
          maxHeight: "none",
          margin: "2.5vh auto",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "divider",
          pr: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccountTreeIcon color="primary" />
          <Box>
            <Typography variant="h6" component="div">
              Value Chain Explorer
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Interactive exploration of relationships between value chains,
              clusters, and products
            </Typography>
          </Box>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          p: 0,
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: "100%",
          }}
        >
          <SankeyTree />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LearningModal;
