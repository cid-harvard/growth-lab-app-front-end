import React from "react";
import { Box } from "@mui/material";
import { AnimatedValueChainIntro } from "./introduction";

const ValueChainsHierarchy = () => {
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
          width={1300}
          height={800}
          selectedCountry={1}
          selectedYear={2021}
        />
      </Box>
    </Box>
  );
};

export default ValueChainsHierarchy;
