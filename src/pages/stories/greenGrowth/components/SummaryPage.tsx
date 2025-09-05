import { useMemo, useState } from "react";
import { Box, Button, Container, Typography, Modal, Fab } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/system";
import { useYearSelection, useCountrySelection } from "../hooks/useUrlParams";
import { useCountryName } from "../queries/useCountryName";
import { useGreenGrowthData } from "../hooks/useGreenGrowthData";
import { useStrategicPosition } from "../hooks/useStrategicPosition";
import { Widget } from "@typeform/embed-react";
import IndustryIcon from "../../../../assets/Industry-icon.svg";

// White background for entire page
const PageBackground = styled(Box)(() => ({
  background: "#ffffff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "0",
  boxSizing: "border-box",
  minHeight: "100%",
  width: "100%",
}));

// Title section with white background
const TitleSection = styled(Box)(() => ({
  background: "#ffffff",
  width: "100%",
  padding: "40px 16px 60px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  color: "#333333",
}));

// Main content section with white background
const ContentSection = styled(Box)(() => ({
  background: "#ffffff",
  width: "100%",
  padding: "40px 16px 60px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  color: "#333333",
}));

const ActionButton = styled(Button)(() => ({
  backgroundColor: "#2E97BF",
  color: "white",
  padding: "12px 24px",
  minWidth: 220,
  fontSize: 26,
  fontWeight: 600,
  textTransform: "none",
  borderRadius: "4px",
  "&:hover": { backgroundColor: "#4A90E2" },
}));

// (Scoring logic now implemented inline in topClusters to mirror ProductRadar.jsx)

const SummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const selectedCountry = useCountrySelection();
  const selectedYear = Number.parseInt(useYearSelection());
  const countryName = useCountryName();
  const [contactOpen, setContactOpen] = useState(false);

  // Get data used by charts
  const { countryData, clustersData } = useGreenGrowthData(
    Number.parseInt(String(selectedCountry)),
    selectedYear,
  );

  // Strategic approach from existing hook
  const strategic = useStrategicPosition(
    Number.parseInt(String(selectedCountry)),
    selectedYear,
  );

  // Compute top clusters exactly like ProductRadar.jsx default selection
  const topClusters = useMemo((): { id: number; name: string }[] => {
    if (!countryData?.clusterData || !clustersData?.ggClusterList) return [];

    const clusterNameById = new Map(
      clustersData.ggClusterList.map(
        (c: { clusterId: number; clusterName: string }) => [
          c.clusterId,
          c.clusterName,
        ],
      ),
    );

    // Filter clusters with RCA < 1 (not currently specialized)
    const filtered = countryData.clusterData.filter(
      (item) => Number.parseFloat(String(item.rca)) < 1,
    );

    if (filtered.length === 0) return [];

    // Calculate attractiveness and density
    const withPositions = filtered.map((clusterItem) => {
      const attractiveness =
        0.6 * Number.parseFloat(String(clusterItem.cog)) +
        0.4 * Number.parseFloat(String(clusterItem.pci));
      const density = Number.parseFloat(String(clusterItem.rca));
      return {
        clusterId: Number(clusterItem.clusterId),
        attractiveness,
        density,
      };
    });

    // Normalize values to 0-1 range
    const aVals = withPositions.map((c) => c.attractiveness);
    const dVals = withPositions.map((c) => c.density);
    const minA = Math.min(...aVals);
    const maxA = Math.max(...aVals);
    const minD = Math.min(...dVals);
    const maxD = Math.max(...dVals);

    const scored = withPositions.map((c) => {
      const normalizedAttractiveness =
        aVals.length > 1 ? (c.attractiveness - minA) / (maxA - minA) : 0.5;
      const normalizedDensity =
        dVals.length > 1 ? (c.density - minD) / (maxD - minD) : 0.5;
      const distanceFromTopRight = Math.sqrt(
        Math.pow(1 - normalizedDensity, 2) +
          Math.pow(1 - normalizedAttractiveness, 2),
      );
      const geometricMean = Math.sqrt(
        normalizedAttractiveness * normalizedDensity,
      );
      const topRightScore = 1 - distanceFromTopRight + geometricMean * 0.1;
      return {
        ...c,
        normalizedAttractiveness,
        normalizedDensity,
        geometricMean,
        topRightScore,
      };
    });

    // Sort by score, tie-breaker by geometric mean (same as ProductRadar.jsx)
    const sorted = scored.sort((a, b) => {
      if (Math.abs(a.topRightScore - b.topRightScore) > 0.01) {
        return b.topRightScore - a.topRightScore;
      }
      return b.geometricMean - a.geometricMean;
    });

    return sorted
      .slice(0, 2)
      .map((c) => {
        const name = clusterNameById.get(c.clusterId);
        return name ? { id: c.clusterId, name } : null;
      })
      .filter((v): v is { id: number; name: string } => Boolean(v));
  }, [countryData, clustersData]);

  return (
    <PageBackground>
      {/* Title Section with White Background */}
      <TitleSection>
        <Container maxWidth="md">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              mb: 4,
            }}
          >
            <Fab
              color="primary"
              size="medium"
              aria-label="Back to dimensions"
              onClick={() => {
                const params = new URLSearchParams();
                if (selectedCountry)
                  params.set("country", String(selectedCountry));
                if (!Number.isNaN(selectedYear))
                  params.set("year", String(selectedYear));
                navigate(
                  `/greenplexity/dimensions${params.toString() ? `?${params.toString()}` : ""}`,
                );
              }}
              sx={{
                position: "absolute",
                left: 0,
                boxShadow: 3,
                backgroundColor: "white",
                color: "black",
              }}
            >
              <ArrowUpwardIcon />
            </Fab>
            <Typography
              variant="h4"
              align="center"
              sx={{
                fontWeight: 600,
                textTransform: "uppercase",
                color: "#127DB9",
                letterSpacing: "0.5px",
                fontSize: 28,
              }}
            >
              {countryName} in Summary
            </Typography>
          </Box>

          <Typography
            align="center"
            paragraph
            sx={{
              mb: 0,
              fontSize: "22px",
              lineHeight: 1.6,
              color: "black",
              maxWidth: "800px",
              mx: "auto",
              fontWeight: 600,
            }}
          >
            The energy transition offers {countryName} defining opportunity for
            growth. {countryName} must act quickly to create a winning strategy
            for green growth, or risk being left behind.
          </Typography>
        </Container>
      </TitleSection>

      {/* Main Content Section */}
      <ContentSection>
        <Container maxWidth="md">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              mb: 8,
              maxWidth: "1000px",
              mx: "auto",
            }}
          >
            {/* Green Growth Approach - Left title, Right content */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 600,

                  minWidth: "200px",
                  flexShrink: 0,
                }}
              >
                Green Growth Approach
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  flex: 1,
                }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    alignSelf: "flex-start",
                  }}
                >
                  <BookmarkIcon
                    sx={{
                      color: strategic?.color || "#127DB9",
                      fontSize: 30,
                    }}
                  />
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: strategic?.color || "#127DB9",
                      fontSize: "28px",
                      lineHeight: 1.2,
                      mb: 0,
                      pb: 0,
                    }}
                  >
                    {strategic?.label || "Harness Nearby Opportunities"}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    color: "#333333",
                    lineHeight: 1.6,
                    maxWidth: "600px",
                    fontSize: "18px",
                    fontWeight: 600,
                    ml: 5,
                    mt: 0,
                    pt: 0,
                  }}
                >
                  {strategic?.description ||
                    "Ample space to diversify calls for leveraging existing successes to enter more complex production."}
                </Typography>
              </Box>
            </Box>

            {/* High Potential Clusters - Left title, Right content */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 600,

                  minWidth: "200px",
                  flexShrink: 0,
                  lineHeight: 1.3,
                }}
              >
                High Potential Clusters
                <br />
                for Green Growth
              </Typography>
              {topClusters.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    flex: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",

                      height: 45,
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      component="img"
                      src={IndustryIcon}
                      alt="Industry icon"
                      sx={{ height: "60px" }}
                    />
                  </Box>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                  >
                    {topClusters.map((c) => (
                      <Typography
                        key={c.id}
                        sx={{
                          fontWeight: 700,
                          color: "#333333",
                          fontSize: "18px",
                        }}
                      >
                        {c.name}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          {/* Actions row with bottom margin for footer space */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
              justifyItems: "center",
              mb: 8, // Increased bottom margin to provide space before footer
            }}
          >
            <ActionButton
              onClick={() => {
                window.location.href = "/greenplexity";
              }}
            >
              Search a New Country
            </ActionButton>
            <ActionButton
              onClick={() => {
                const countryId = String(selectedCountry || "").replace(
                  /\D/g,
                  "",
                );
                const base = "https://atlas.hks.harvard.edu/explore/treemap";
                const url = countryId
                  ? `${base}?exporter=country-${countryId}`
                  : base;
                window.open(url, "_blank", "noopener,noreferrer");
              }}
            >
              Explore further with Atlas
            </ActionButton>
            <ActionButton
              onClick={() =>
                window.open(
                  "https://growthlab.hks.harvard.edu/green-growth",
                  "_blank",
                )
              }
            >
              Green Growth Research
            </ActionButton>
            <ActionButton onClick={() => setContactOpen(true)}>
              Get in Touch
            </ActionButton>
          </Box>
        </Container>
      </ContentSection>

      {/* Contact modal placeholder (Typeform used elsewhere) */}
      <Modal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        aria-labelledby="contact-modal"
      >
        <Box
          sx={{
            width: "80%",
            height: "80%",
            bgcolor: "background.paper",
            m: "auto",
            mt: "5%",
            outline: "none",
          }}
        >
          <Widget id="pl5LJPFr" style={{ height: "100%" }} />
        </Box>
      </Modal>
    </PageBackground>
  );
};

export default SummaryPage;
