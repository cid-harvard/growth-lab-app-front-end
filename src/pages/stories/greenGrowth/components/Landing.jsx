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
import { useUrlParams } from "../hooks/useUrlParams";
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
            gutterBottom
            sx={{ color: "white", fontWeight: "bold" }}
          >
            GREENPLEXITY
          </Typography>

          <Typography
            variant="body1"
            align="left"
            paragraph
            sx={{ color: "white", mb: 4, fontSize: "20px" }}
          >
            The world's transition to a lower-carbon economy will radically
            transform global production. Decarbonization presents a defining
            opportunity for economic growth, by creating new industries,
            markets, and paths to prosperity.
          </Typography>

          <Typography
            variant="body1"
            align="left"
            paragraph
            sx={{ color: "white", mb: 4, fontSize: "20px" }}
          >
            Greenplexity helps policymakers craft strategies to enter green
            value chains that are driving the energy transition, like critical
            minerals, solar panels, and electric vehicles. By analyzing local
            productive capabilities, this tool identifies opportunities to
            create winning strategies for green growth: to generate prosperity
            by supplying what the world needs to decarbonize.
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
              sx={{ color: "white", mt: 2, fontSize: "24px", fontWeight: 600 }}
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
          sx={{ color: "white", mt: 4, fontSize: "18px" }}
        >
          Greenplexity is a public good, financed in part by the Government of
          Azerbaijan.
        </Typography>
      </GradientBackground>
    </div>
  );
};

export default Landing;
