import React from "react";
import {
  Box,
  Typography,
  Container,
  Button,
  Autocomplete,
  TextField,
} from "@mui/material";
import { styled } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useUrlParams, useYearSelection } from "../hooks/useUrlParams";
import { useGreenGrowthData } from "../hooks/useGreenGrowthData";
import { useQuery } from "@apollo/client";
import { GET_COUNTRIES } from "../queries/shared";
import GrowthLabLogoPNG from "../../../../assets/GL_logo_white.png";
import { triggerGoogleAnalyticsEvent } from "../../../../routing/tracking";

const GradientBackground = styled(Box)(({ theme }) => ({
  background:
    "linear-gradient( 135deg,#0a78b8 0%, rgba(39, 204, 193, .8) 100%);",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(4),
  boxSizing: "border-box",
  overflow: "auto",
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
    height: "100%",
  },
}));

const Logo = styled("img")({
  height: "60px",
});

const ExploreButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  borderRadius: "50%",
  width: "60px",
  height: "60px",
  minWidth: "unset",
  backgroundColor: "white",
  "&:hover": {
    backgroundColor: "#f0f0f0",
  },
  "& .MuiSvgIcon-root": {
    color: "#0a78b8",
  },
}));

const Landing = ({ onExplore }) => {
  const { data } = useQuery(GET_COUNTRIES);
  const { countrySelection, setCountrySelection } = useUrlParams();
  const selectedYear = useYearSelection();

  // Preload all component queries when a country is selected
  // This will cache the data in Apollo Client for faster navigation
  useGreenGrowthData(
    countrySelection,
    parseInt(selectedYear),
    true, // fetchAllCountriesMetrics = true to preload all country data
  );

  const countries = data?.ggLocationCountryList || [];

  return (
    <div>
      <GradientBackground>
        <Container maxWidth="md">
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb={4}
          >
            <Logo src={GrowthLabLogoPNG} alt="Growth Lab" />
          </Box>

          <Typography
            variant="h3"
            component="h1"
            align="center"
            sx={{
              margin: "0px 0px 0.35em",
              fontFamily: '"Source Sans Pro", "Source Sans", sans-serif',
              fontSize: "3rem",
              lineHeight: 1.167,
              textAlign: "center",
              color: "white",
              fontWeight: 700,
            }}
          >
            Greenplexity
          </Typography>

          <Typography
            variant="h4"
            component="h2"
            align="center"
            sx={{
              color: "white",
              fontWeight: 400,
              fontSize: "1.75rem",
              lineHeight: 1.3,
              margin: "0px 0px 3rem",
              maxWidth: "800px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            How can your country grow by helping the world decarbonize?
          </Typography>

          <Typography
            variant="body1"
            align="left"
            sx={{
              margin: "0px 0px 32px",
              fontFamily: '"Source Sans Pro", "Source Sans", sans-serif',
              fontWeight: 400,
              lineHeight: 1.5,
              textAlign: "left",
              color: "white",
              fontSize: "20px",
            }}
          >
            The global transition to a low-carbon economy is transforming what
            the world produces—and who prospers.
          </Typography>

          <Typography
            variant="body1"
            align="left"
            sx={{
              margin: "0px 0px 32px",
              fontFamily: '"Source Sans Pro", "Source Sans", sans-serif',
              fontWeight: 400,
              lineHeight: 1.5,
              textAlign: "left",
              color: "white",
              fontSize: "20px",
            }}
          >
            Greenplexity reveals where your country can lead inside the green
            value chains powering the energy transition, to drive new paths to
            prosperity. By mapping local capabilities against the needs of green
            technologies, Greenplexity uncovers actionable strategies for green
            growth—by supplying what the world needs to decarbonize.
          </Typography>

          <Box display="flex" justifyContent="center" width="100%">
            <Autocomplete
              fullWidth
              options={countries}
              getOptionLabel={(option) => option.nameEn}
              disableClearable
              blurOnSelect
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Search for a country"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <SearchIcon sx={{ color: "white", mr: 1 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              value={
                countries.find(
                  (country) => country.countryId === countrySelection,
                ) || null
              }
              onChange={(event, newValue) => {
                setCountrySelection(newValue ? newValue.countryId : null);
              }}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "white" },
                },
                "& .MuiInputLabel-root": { color: "white" },
                "& .MuiAutocomplete-popupIndicator": { color: "white" },
                "& .MuiAutocomplete-clearIndicator": { color: "white" },
                maxWidth: "400px",
              }}
            />
          </Box>

          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography
              sx={(theme) => ({
                color: "white",
                mt: 2,
                fontSize: theme.typography.h4.fontSize,
                fontWeight: theme.typography.h4.fontWeight,
                letterSpacing: theme.typography.caption.letterSpacing,
              })}
            >
              EXPLORE
            </Typography>
            <ExploreButton
              variant="contained"
              color="primary"
              onClick={() => {
                onExplore();
                triggerGoogleAnalyticsEvent(
                  "GREENPLEXITY",
                  "click-button",
                  "Explore",
                );
              }}
              sx={{ mt: 0 }}
            >
              <KeyboardArrowDownIcon fontSize="large" />
            </ExploreButton>
          </Box>
        </Container>
        <Typography
          variant="body1"
          align="center"
          sx={(theme) => ({
            color: "white",
            mt: 4,
            fontSize: theme.typography.subtitle1.fontSize,
            lineHeight: theme.typography.body1.lineHeight,
          })}
        >
          Greenplexity is a public good, financed in part by the Government of
          Azerbaijan.
        </Typography>
      </GradientBackground>
    </div>
  );
};

export default Landing;
