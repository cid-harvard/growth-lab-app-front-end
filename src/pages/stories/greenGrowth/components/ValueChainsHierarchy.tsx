import React from "react";
import { Box } from "@mui/material";
import { AnimatedValueChainIntro } from "./introduction";
import { useCountrySelection, useYearSelection } from "../hooks/useUrlParams";

const ValueChainsHierarchy = () => {
  const selectedCountry = useCountrySelection();
  const selectedYear = useYearSelection();

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 1,
      }}
    >
      {/* Animated Introduction */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 1400,
          height: 1000,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <AnimatedValueChainIntro
          selectedCountry={selectedCountry}
          selectedYear={parseInt(selectedYear)}
        />
      </Box>
    </Box>
  );
};

export default ValueChainsHierarchy;
