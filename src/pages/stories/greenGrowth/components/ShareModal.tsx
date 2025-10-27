import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
} from "@mui/material";
import {
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
  Link as LinkIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { ReactComponent as XIcon } from "../../../../assets/x.svg";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: "500px" },
  maxWidth: "95vw",
  bgcolor: "background.paper",
  border: "none",
  borderRadius: "8px",
  boxShadow: 24,
  p: 4,
  outline: "none",
};

const getShareWindowParams = (width: number, height: number) =>
  `menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=${height},width=${width}`;

const getShareFunctions = (url: string) => {
  return {
    shareFacebook: () => {
      const baseURL = "https://www.facebook.com/sharer.php";
      const shareURL = `${baseURL}?u=${encodeURIComponent(url)}`;
      window.open(shareURL, "", getShareWindowParams(360, 600));
    },

    shareTwitter: (text: string) => {
      const baseURL = "https://x.com/intent/tweet";
      const shareURL = `${baseURL}?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}&via=HarvardGrwthLab`;
      window.open(shareURL, "", getShareWindowParams(420, 550));
    },

    shareLinkedIn: (title: string, summary: string) => {
      const baseURL = "https://www.linkedin.com/shareArticle";
      const source = encodeURIComponent(url);
      const shareURL = `${baseURL}?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}&source=${encodeURIComponent(source)}`;
      window.open(shareURL, "", getShareWindowParams(570, 520));
    },

    shareEmail: (
      subjectCopy: string,
      bodyBeforeLineBreakCopy: string,
      bodyAfterLineBreakCopy: string,
    ) => {
      const subject = encodeURIComponent(subjectCopy);
      const bodyBeforeLineBreak = encodeURIComponent(bodyBeforeLineBreakCopy);
      const bodyAfterLineBreak = encodeURIComponent(bodyAfterLineBreakCopy);
      const href = `mailto:?subject=${subject}&body=${bodyBeforeLineBreak}%0D%0A%0D%0A${bodyAfterLineBreak}`;
      window.location.href = href;
    },
  };
};

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ open, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const shareFunctions = getShareFunctions(window.location.href);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const shareTitle = "Check out this data visualization from Greenplexity";
  const shareDescription =
    "Explore green value chains and strategic opportunities for sustainable economic growth";

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        {/* Close button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              position: "absolute",
              right: "0.5rem", // 8px in rem
              top: "0.5rem", // 8px in rem
              color: "grey.500",
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Direct Link Section */}
        <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
          Direct Link
        </Typography>
        <Box
          onClick={handleCopy}
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 3,
            cursor: "pointer",
            width: "100%",
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            value={window.location.href}
            size="small"
            sx={{
              cursor: "pointer",
              "& .MuiOutlinedInput-root": {
                paddingRight: 0,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ cursor: "pointer" }}>
                  <LinkIcon sx={{ color: "grey.600" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end" sx={{ cursor: "pointer" }}>
                  <Button
                    onClick={handleCopy}
                    variant="contained"
                    size="small"
                    sx={(theme) => ({
                      m: 0,
                      cursor: "pointer",
                      backgroundColor: theme.palette.text.secondary,
                      color: "white",
                      borderRadius: "0 4px 4px 0",
                      minWidth: "unset",
                      px: 2,
                      py: 1,
                      "&:hover": {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    })}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </InputAdornment>
              ),
              readOnly: true,
              sx: {
                cursor: "pointer",
                "& input": {
                  cursor: "pointer",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              },
            }}
          />
        </Box>

        {/* Social Media Sharing Section */}
        <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
          Social Media Sharing
        </Typography>
        <Box
          display="flex"
          justifyContent="space-around"
          sx={{
            maxWidth: "300px",
            mx: "auto",
          }}
        >
          <IconButton
            onClick={() => shareFunctions.shareTwitter(shareTitle)}
            sx={{
              color: "grey.600",
              "&:hover": { backgroundColor: "rgba(29, 161, 242, 0.1)" },
              "& svg": {
                width: "2rem",
                height: "2rem",
              },
            }}
          >
            <XIcon />
          </IconButton>
          <IconButton
            onClick={() =>
              shareFunctions.shareLinkedIn(shareTitle, shareDescription)
            }
            sx={{
              color: "grey.600",
              "&:hover": { backgroundColor: "rgba(0, 119, 181, 0.1)" },
            }}
          >
            <LinkedInIcon fontSize="large" />
          </IconButton>
          <IconButton
            onClick={shareFunctions.shareFacebook}
            sx={{
              color: "grey.600",
              "&:hover": { backgroundColor: "rgba(24, 119, 242, 0.1)" },
            }}
          >
            <FacebookIcon fontSize="large" />
          </IconButton>
          <IconButton
            onClick={() =>
              shareFunctions.shareEmail(
                "Greenplexity Visualization",
                shareTitle,
                window.location.href,
              )
            }
            sx={{
              color: "grey.600",
              "&:hover": { backgroundColor: "rgba(234, 67, 53, 0.1)" },
            }}
          >
            <EmailIcon fontSize="large" />
          </IconButton>
        </Box>
      </Box>
    </Modal>
  );
};

export default ShareModal;
