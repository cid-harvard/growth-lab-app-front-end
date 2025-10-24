import { useMemo } from "react";
import { Box, Button, Container, Typography, Fab } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/system";
import { useYearSelection, useCountrySelection } from "../hooks/useUrlParams";
import { useCountryName } from "../queries/useCountryName";
import { useGreenGrowthData } from "../hooks/useGreenGrowthData";
import { useStrategicPosition } from "../hooks/useStrategicPosition";
import IndustryIcon from "../../../../assets/Industry-icon.svg";
import RankingsPlotIcon from "../../../../assets/greenGrowth/Greenplexity-rankings-plot.svg";
import ArrowIcon from "../../../../assets/greenGrowth/Greenplexity-arrow.svg";
import {
  calculateClusterScores,
  calculateAttractiveness,
} from "../utils/rankings";

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
  padding: "40px 16px 0px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  color: "#333333",
}));

// Main content section (kept white); figures area below will have its own light background
const ContentSection = styled(Box)(() => ({
  background: "#ffffff",
  width: "100%",
  padding: "0px 0px 0px",
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

  // Get data used by charts
  const { countryData, clustersData } = useGreenGrowthData(
    Number.parseInt(String(selectedCountry)),
    selectedYear,
  );

  // Fetch all countries metrics to compute Green Complexity Ranking (current and 5 years prior)
  const yearsWindow = 5;
  const { allCountriesMetrics } = useGreenGrowthData(null, selectedYear, true);
  const { allCountriesMetrics: prevAllCountriesMetrics } = useGreenGrowthData(
    null,
    selectedYear - yearsWindow,
    true,
  );

  // Strategic approach from existing hook
  const strategic = useStrategicPosition(
    Number.parseInt(String(selectedCountry)),
    selectedYear,
  );

  // Compute top clusters exactly like ProductRadar.jsx default selection
  const topClusters = useMemo((): { id: number; name: string }[] => {
    if (!countryData?.clusterData || !clustersData?.gpClusterList) return [];

    const clusterNameById = new Map(
      clustersData.gpClusterList.map(
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
      const attractiveness = calculateAttractiveness(
        Number.parseFloat(String(clusterItem.cog)),
        Number.parseFloat(String(clusterItem.pci)),
      );
      const density = Number.parseFloat(String(clusterItem.density));
      return {
        clusterId: Number(clusterItem.clusterId),
        attractiveness,
        density,
      };
    });

    // Use shared ranking function to calculate scores and sort
    const sorted = calculateClusterScores(withPositions);

    return sorted
      .slice(0, 2)
      .map((c) => {
        const name = clusterNameById.get(c.clusterId);
        return name ? { id: c.clusterId, name } : null;
      })
      .filter((v): v is { id: number; name: string } => Boolean(v));
  }, [countryData, clustersData]);

  // Compute Green Complexity rank and change over time
  const ranking = useMemo(() => {
    const countryId = Number.parseInt(String(selectedCountry));
    type SimpleMetric = { countryId: number; xResid: number };
    const isSimpleMetric = (d: unknown): d is SimpleMetric => {
      if (typeof d !== "object" || d === null) return false;
      const obj = d as { countryId?: unknown; xResid?: unknown };
      return (
        typeof obj.countryId === "number" && typeof obj.xResid === "number"
      );
    };

    const nowArr: SimpleMetric[] = Array.isArray(allCountriesMetrics)
      ? (allCountriesMetrics as unknown[]).filter(isSimpleMetric)
      : [];
    const prevArr: SimpleMetric[] = Array.isArray(prevAllCountriesMetrics)
      ? (prevAllCountriesMetrics as unknown[]).filter(isSimpleMetric)
      : [];

    const total = nowArr.length;

    const currentSorted = [...nowArr].sort((a, b) => b.xResid - a.xResid);
    const prevSorted = [...prevArr].sort((a, b) => b.xResid - a.xResid);

    const currentIndex = currentSorted.findIndex(
      (d) => d.countryId === countryId,
    );
    const prevIndex = prevSorted.findIndex((d) => d.countryId === countryId);

    const rankNow = currentIndex >= 0 ? currentIndex + 1 : null;
    const rankPrev = prevIndex >= 0 ? prevIndex + 1 : null;

    const delta =
      rankNow !== null && rankPrev !== null ? rankPrev - rankNow : null; // positive = improved

    const ordinal = (n: number | null) => {
      if (n === null) return "-";
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
    };

    return { rankNow, rankPrev, delta, total, ordinal };
  }, [allCountriesMetrics, prevAllCountriesMetrics, selectedCountry]);

  return (
    <PageBackground>
      {/* Title Section with White Background */}
      <TitleSection>
        <Container maxWidth="lg" sx={{ mb: 0 }}>
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
                  `/greenplexity/products${params.toString() ? `?${params.toString()}` : ""}`,
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
              <ArrowUpwardIcon sx={{ fontSize: 36 }} />
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
              fontSize: "1.375rem",
              lineHeight: 1.6,
              color: "black",
              maxWidth: "800px",
              mx: "auto",
              fontWeight: 600,
            }}
          >
            The energy transition offers {countryName} a defining opportunity
            for growth. {countryName} must act quickly to create a winning
            strategy for green growth, or risk being left behind.
          </Typography>
        </Container>
      </TitleSection>

      {/* Main Content Section */}
      <ContentSection>
        <Container maxWidth="lg">
          {/* Figures area wrapper with light blue background (spec-like) */}
          <Box
            sx={{
              background: "rgba(92, 126, 145, 0.1)",
              borderRadius: 0,
              px: { xs: 2, md: 4 },
              py: { xs: 4, md: 6 },
              display: "flex",
              flexDirection: "column",
              gap: 10,
              mb: 6,
              maxWidth: "1400px",
              mx: "auto",
            }}
          >
            {/* Green Growth Approach - Left title, Right content */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
                gap: 4,
                alignItems: "start",
              }}
            >
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 400,
                  textTransform: "uppercase",
                }}
              >
                Green Growth Approach
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <BookmarkIcon
                    sx={{
                      color: strategic?.color || "#127DB9",
                      fontSize: 28,
                    }}
                  />
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: strategic?.color || "#127DB9",
                      fontSize: "1.75rem",
                      lineHeight: 1.2,
                      textTransform: "uppercase",
                    }}
                  >
                    {strategic?.label || "Light Touch Approach"}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    color: "#333333",
                    lineHeight: 1.6,
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    marginLeft: 4,
                  }}
                >
                  {strategic?.description ||
                    "Ample space to diversify calls for leveraging existing successes to enter more complex production"}
                </Typography>
              </Box>
            </Box>

            {/* High Potential Clusters - Left title, Right content */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
                gap: 4,
                alignItems: "start",
              }}
            >
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 400,
                  textTransform: "uppercase",
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
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "auto auto" },
                    gap: { xs: 3, sm: 6 },
                    alignItems: "start",
                  }}
                >
                  {topClusters.map((c) => (
                    <Box
                      key={c.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Box
                          component="img"
                          src={IndustryIcon}
                          alt="Industry icon"
                          sx={{ height: "50px" }}
                        />
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: "#333333",
                          fontSize: "1.375rem",
                          textTransform: "uppercase",
                        }}
                      >
                        {c.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Green Complexity Ranking - Left title, Right content */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
                gap: 4,
                alignItems: "start",
              }}
            >
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 400,
                  textTransform: "uppercase",
                }}
              >
                Green Complexity Ranking
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "auto auto" },
                  gap: { xs: 3, sm: 6 },
                  alignItems: "start",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box
                    component="img"
                    src={RankingsPlotIcon}
                    alt="Rankings chart"
                    sx={{ height: "44px", width: "51px", flexShrink: 0 }}
                  />
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: "#333333",
                        fontSize: "1.75rem",
                        lineHeight: 1.2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ranking.rankNow !== null
                        ? ranking.ordinal(ranking.rankNow)
                        : "-"}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: "#333333",
                        fontSize: "1.125rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ranking.total
                        ? `Out of ${ranking.total} Countries`
                        : "Data unavailable"}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  {ranking.delta === null ? (
                    <Box
                      sx={{ width: "31px", height: "43px", flexShrink: 0 }}
                    />
                  ) : ranking.delta === 0 ? (
                    <Box
                      sx={{
                        width: "31px",
                        height: "43px",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "2.5rem",
                          fontWeight: 700,
                          color: "#333333",
                          lineHeight: 1,
                        }}
                      >
                        =
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      component="img"
                      src={ArrowIcon}
                      alt="Ranking change"
                      sx={{
                        height: "43px",
                        width: "31px",
                        flexShrink: 0,
                        transform:
                          ranking.delta > 0 ? "rotate(0deg)" : "rotate(180deg)",
                      }}
                    />
                  )}
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: "#333333",
                        fontSize: "1.75rem",
                        lineHeight: 1.2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ranking.delta !== null && ranking.delta !== 0
                        ? `${Math.abs(ranking.delta)} position${Math.abs(ranking.delta) === 1 ? "" : "s"}`
                        : ranking.delta === 0
                          ? "No change"
                          : "-"}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: "#333333",
                        fontSize: "1.125rem",
                      }}
                    >
                      {(() => {
                        const years = yearsWindow;
                        if (ranking.delta === null)
                          return `Change over ${years} years unavailable`;
                        if (ranking.delta > 0)
                          return `${countryName}'s ranking has improved ${Math.abs(ranking.delta)} position${Math.abs(ranking.delta) === 1 ? "" : "s"} in ${years} years.`;
                        if (ranking.delta < 0)
                          return `${countryName}'s ranking has worsened ${Math.abs(ranking.delta)} position${Math.abs(ranking.delta) === 1 ? "" : "s"} in ${years} years.`;
                        return `No change in ${years} years`;
                      })()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
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
              mb: 8,
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
              Explore Further with Atlas
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
            <ActionButton
              onClick={() =>
                window.open(
                  "https://growthlab.hks.harvard.edu/subscribe",
                  "_blank",
                )
              }
            >
              Subscribe for Updates
            </ActionButton>
          </Box>
        </Container>
      </ContentSection>
    </PageBackground>
  );
};

export default SummaryPage;
