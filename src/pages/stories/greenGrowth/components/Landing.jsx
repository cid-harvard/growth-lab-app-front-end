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
import { useRecoilState } from "recoil";
import { countrySelectionState } from "./Story";
import { useQuery } from "@apollo/client";
import { GET_COUNTRIES } from "../queries/countries";

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
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("/img/overlay.png")',
    backgroundRepeat: "repeat",
    opacity: 0.5,
    pointerEvents: "none",
  },
}));

const Logo = styled("img")({
  height: "60px",
  marginBottom: "20px",
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
  const { data, loading, error } = useQuery(GET_COUNTRIES);
  const [countrySelection, setCountrySelection] = useRecoilState(
    countrySelectionState,
  );

  const countries = data?.ggLocationCountryList || [];

  return (
    <GradientBackground>
      <Container maxWidth="md">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Logo src="/img/GL_logo_white.png" alt="Growth Lab" />
          <Box component="img" src="/path/to/second-logo.png" alt="2nd logo" />
        </Box>

        <Typography
          variant="h3"
          component="h1"
          align="center"
          gutterBottom
          sx={{ color: "white", fontWeight: "bold" }}
        >
          GREEN GROWTH INTELLIGENCE
        </Typography>

        <Typography
          variant="body1"
          align="center"
          paragraph
          sx={{ color: "white", mb: 4 }}
        >
          The world's transition to a lower-carbon economy will radically
          transform global production. Decarbonization presents a defining
          opportunity for economic growth, by creating new industries, markets,
          and paths for economic prosperity. The redesign of the global energy
          system has resulted in the relocation of economic opportunity to those
          places that can enter green value chains of the technologies that are
          driving the energy transition, like critical minerals, solar panels,
          and electric vehicles.
        </Typography>

        <Typography
          variant="body1"
          align="center"
          paragraph
          sx={{ color: "white", mb: 4 }}
        >
          [Name of tool] aims to identify opportunities to create winning
          strategies for green growth: to accelerate the world's decarbonization
          while creating new paths to economic prosperity. By understanding what
          a place's capabilities are today, [Name of tool] maps localized
          opportunities to enter green value chains to chart new paths to
          prosperity for those who act.
        </Typography>

        <Autocomplete
          fullWidth
          options={countries}
          getOptionLabel={(option) => option.nameEn}
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
          }}
        />

        <Box display="flex" flexDirection="column" alignItems="center">
          <ExploreButton
            variant="contained"
            color="primary"
            onClick={onExplore}
          >
            <KeyboardArrowDownIcon fontSize="large" />
          </ExploreButton>
          <Typography variant="caption" sx={{ color: "white", mt: 1 }}>
            EXPLORE
          </Typography>
        </Box>
      </Container>
    </GradientBackground>
  );
};

export default Landing;
