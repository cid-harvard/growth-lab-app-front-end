import { Modal, Box, Typography, IconButton, Divider } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { GG_GLOSSARY_ENTRIES } from "../utils/terms";

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
  overflow: "hidden",
};

interface GlossaryModalProps {
  open: boolean;
  onClose: () => void;
}

const GlossaryModal = ({ open, onClose }: GlossaryModalProps) => {
  const entries = GG_GLOSSARY_ENTRIES.filter((t) => t.addToGlossary)
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title));
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
            variant="h2"
            component="h2"
            sx={{
              fontWeight: 600,
            }}
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
          {entries.map((term, index) => (
            <Box key={term.key} sx={{ mb: 3 }}>
              <Typography
                variant="h3"
                component="h3"
                sx={(theme) => ({
                  fontWeight: theme.typography.fontWeightMedium,
                  mb: 1.5,
                  color: theme.palette.text.primary,
                  fontSize: theme.typography.h3.fontSize,
                })}
              >
                {term.title}
              </Typography>
              <Typography
                sx={{
                  fontSize: 16,
                  lineHeight: 1.5,

                  textAlign: "justify",
                }}
              >
                {term.description}
              </Typography>
              {index < entries.length - 1 && (
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
