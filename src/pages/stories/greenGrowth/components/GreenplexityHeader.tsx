import { Box, Container, Typography } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import GrowthLabLogoPNG from "../../../../assets/GL_logo_white.png";

type GreenplexityHeaderProps = {
  position?: "fixed" | "absolute" | "static";
  heightPx?: number;
  maxWidth?: "sm" | "md" | "lg" | "xl" | false;
};

const GreenplexityHeader = (props: GreenplexityHeaderProps) => {
  const { position = "fixed", heightPx = 60, maxWidth = "lg" } = props;
  const location = useLocation();
  const isRanking = /\/greenplexity\/rankings\b/.test(location.pathname);

  return (
    <Box
      sx={{
        position,
        left: 0,
        top: 0,
        width: "100%",
        height: `${heightPx}px`,
        background:
          "linear-gradient(135deg, #0a78b8 0%, rgba(39, 204, 193, .8) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Container
        maxWidth={maxWidth}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        {/* Left: GL icon */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <RouterLink to="/" style={{ display: "flex", alignItems: "center" }}>
            <img
              src={GrowthLabLogoPNG}
              alt="Growth Lab"
              style={{ height: 36, cursor: "pointer" }}
            />
          </RouterLink>
        </Box>

        {/* Right: Nav items */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Box sx={{ position: "relative" }}>
            <Typography
              component={RouterLink}
              to="/greenplexity"
              sx={{
                color: "white",
                textDecoration: "none",
                fontSize: 20,
                fontWeight: 500,
                paddingBottom: "6px",
                display: "inline-block",
              }}
            >
              Green Profiles
            </Typography>
            {!isRanking && (
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: "3px",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  borderRadius: 1,
                }}
              />
            )}
          </Box>
          <Box sx={{ position: "relative" }}>
            <Typography
              component={RouterLink}
              to="/greenplexity/rankings"
              sx={{
                color: "white",
                textDecoration: "none",
                fontSize: 20,
                fontWeight: 500,
                paddingBottom: "6px",
                display: "inline-block",
              }}
            >
              Green Index
            </Typography>
            {isRanking && (
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: "3px",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  borderRadius: 1,
                }}
              />
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default GreenplexityHeader;
