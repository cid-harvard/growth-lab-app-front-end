import React from "react";
import { Modal, Box, Typography, IconButton, Divider } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: "600px" },
  maxWidth: "95vw",
  maxHeight: "90vh",
  bgcolor: "background.paper",
  border: "none",
  borderRadius: "8px",
  boxShadow: 24,
  p: 4,
  outline: "none",
  overflow: "auto",
};

interface GlossaryModalProps {
  open: boolean;
  onClose: () => void;
}

const glossaryTerms = [
  {
    title: "Economic Importance",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco",
  },
  {
    title: "Competitiveness",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco",
  },
  {
    title: "Cluster",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco",
  },
  {
    title: "Green Value Chain",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco",
  },
  {
    title: "Strategic Position",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco",
  },
  {
    title: "Complexity Index",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco",
  },
];

const GlossaryModal: React.FC<GlossaryModalProps> = ({ open, onClose }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        {/* Header with close button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={(theme) => ({
              fontWeight: 600,
              color: theme.palette.text.secondary,
            })}
          >
            Glossary
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "grey.500",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Glossary Terms */}
        <Box sx={{ maxHeight: "calc(90vh - 120px)", overflow: "auto" }}>
          {glossaryTerms.map((term, index) => (
            <Box key={term.title} sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                component="h3"
                sx={(theme) => ({
                  fontWeight: theme.typography.fontWeightMedium,
                  mb: 1.5,
                  color: theme.palette.text.primary,
                  fontSize: theme.typography.h6.fontSize,
                })}
              >
                {term.title}
              </Typography>
              <Typography
                sx={(theme) => ({
                  fontSize: theme.typography.body2.fontSize,
                  lineHeight: theme.typography.body2.lineHeight,
                  color: theme.palette.text.secondary,
                  textAlign: "justify",
                })}
              >
                {term.content}
              </Typography>
              {index < glossaryTerms.length - 1 && (
                <Divider
                  sx={(theme) => ({
                    mt: 2.5,
                    backgroundColor: theme.palette.divider,
                  })}
                />
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Modal>
  );
};

export default GlossaryModal;
