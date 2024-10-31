import React from "react";
import { Box, Typography, Container, Button } from "@mui/material";
import { styled } from "@mui/system";

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
}));

const TakeoffPage = () => {
  return (
    <GradientBackground>
      <Container maxWidth="md" sx={{ mb: 6 }}>
        <Typography
          variant="h5"
          align="center"
          paragraph
          sx={{ color: "white", mb: 6, mt: 8 }}
        >
          The energy transition offers countries a defining opportunity for
          growth. Countries must act quickly to carve out a place for themselves
          in emerging clean industries, or risk being left behind.
        </Typography>

        <Box display="flex" justifyContent="center">
          <RegisterButton variant="contained">
            Get in Touch to Learn More
          </RegisterButton>
        </Box>
      </Container>
    </GradientBackground>
  );
};

export default TakeoffPage;
