import { Box, Container, Typography, Button } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link } from "react-router-dom";
import { countries } from "../../components/utils";

const HomePage = () => {
  const countryAbreviations = Object.keys(countries);
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#425F79",
          opacity: 0.7,
          zIndex: 1,
        }}
      />

      <Box
        component="video"
        autoPlay
        muted
        loop
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      >
        <source
          src={`${process.env.PUBLIC_URL}/WIPO-background.mp4`}
          type="video/mp4"
        />
      </Box>
      <Container
        maxWidth="md"
        sx={{
          textAlign: "center",
          paddingRight: "1rem",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          height: "100%",
          position: "relative",
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: "32px",
            marginBottom: "32px",
            flexWrap: "wrap",
          }}
          m={2}
        >
          <img
            src={`${process.env.PUBLIC_URL}/wipo.svg`}
            alt="WIPO Logo"
            style={{
              maxHeight: "188px",
              filter: "brightness(0) invert(1)",
              flexShrink: 1,
              flexGrow: 1,
              minWidth: "10px",
              maxWidth: "200px",
              width: "100%",
            }}
          />
        </Box>
        <Typography
          style={{ fontSize: "2rem", lineHeight: "1.5" }}
          gutterBottom
        >
          The Innovation Complexity Navigator leverages complexity and
          relatedness indicators to help innovation ecosystems identify and
          evaluate their innovation capabilities. It provides a comprehensive
          view of current strengths and a strategical assessment of potential
          advancements.
        </Typography>
        <Button
          variant="outlined"
          sx={{
            mt: 4,
            mb: 2,
            color: "white",
            borderColor: "white",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            fontSize: "28px",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderColor: "white",
            },
          }}
          endIcon={<ArrowForwardIcon />}
          component={Link}
          to={`/wipo/country/${
            countryAbreviations[
              Math.floor(Math.random() * countryAbreviations.length)
            ]
          }/strengths`}
          state={{ sidebar: true }}
          size={"large"}
        >
          Explore the Tool
        </Button>
      </Container>
      <img
        src="/GL_logo_white.png"
        alt="Growth Lab Logo"
        style={{
          maxHeight: "75px",
          maxWidth: "180px",
          position: "absolute",
          bottom: "10px",
          right: "10px",

          zIndex: 3,
        }}
      />
    </Box>
  );
};

export default HomePage;
