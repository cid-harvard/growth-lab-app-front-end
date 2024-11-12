import React, { useState } from "react";
import { Box, Typography, Container, Button, Modal } from "@mui/material";
import { styled } from "@mui/system";
import { triggerGoogleAnalyticsEvent } from "../../../../routing/tracking";
import { Widget } from "@typeform/embed-react";
import { useCountryName } from "../queries/useCountryName";

const GradientBackground = styled(Box)(({ theme }) => ({
  background:
    "linear-gradient( 135deg,#0a78b8 0%, rgba(39, 204, 193, .8) 100%);",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(4),
  boxSizing: "border-box",
  overflow: "auto",
  minHeight: "100%",
  width: "100%",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("/overlay.png")',
    backgroundRepeat: "repeat",
    opacity: 0.5,
    pointerEvents: "none",
  },
}));

const RegisterButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  backgroundColor: "white",
  color: "#0a78b8",
  padding: "10px 30px",
  "&:hover": {
    backgroundColor: "#f0f0f0",
  },
  maxWidth: "500px",
  fontSize: "26px",
}));

const TakeoffPage = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const countryName = useCountryName();

  return (
    <GradientBackground>
      <Container maxWidth="md" sx={{ mb: 6 }}>
        <Typography
          variant="h5"
          align="center"
          paragraph
          sx={{ color: "white", mb: 6, mt: 8 }}
        >
          The energy transition offers {countryName} a defining opportunity for
          growth. {countryName} must act quickly to create a winning strategy
          for green growth, or risk being left behind.
        </Typography>

        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={2}
        >
          <RegisterButton
            onClick={() => {
              triggerGoogleAnalyticsEvent(
                "GREENPLEXITY",
                "click-button",
                "Green Growth Research",
              );
              handleOpen();
            }}
            variant="contained"
          >
            Get in Touch to Learn More
          </RegisterButton>
          <RegisterButton
            variant="contained"
            component="a"
            href="https://growthlab.hks.harvard.edu/policy-area/green-growth"
            target="_blank"
            rel="noopener noreferrer"
          >
            Green Growth Research
          </RegisterButton>
        </Box>
      </Container>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="typeform-modal"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "80%",
            height: "80%",
            bgcolor: "none",
            boxShadow: 24,
            outline: "none",
            overflow: "hidden",
          }}
        >
          <Widget
            id="pl5LJPFr"
            style={{ height: "100%" }}
            onSubmit={() => {
              triggerGoogleAnalyticsEvent(
                "GREENPLEXITY",
                "submit-form",
                "Green Growth Research",
              );
            }}
          />
        </Box>
      </Modal>
    </GradientBackground>
  );
};

export default TakeoffPage;
