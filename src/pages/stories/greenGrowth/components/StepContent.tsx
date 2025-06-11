import React from "react";
import { Typography, Paper } from "@mui/material";
import { Routes } from "../../../../metadata";
import { useCountryName } from "../queries/useCountryName";

interface StepContentProps {
  stepRoute: string;
}

const StepContent: React.FC<StepContentProps> = ({ stepRoute }) => {
  const countryName = useCountryName();

  const getStepContent = (route: string) => {
    switch (route) {
      case Routes.GreenGrowthOverview:
        return {
          title: "Green Value Chains and Their Components",
          content:
            "Green value chains include a range of products from critical minerals to final goods. These products require distinct productive capabilities. Each circle represents an input for a green value chain that is critical for the energy transition.",
          source: "Source: Growth Lab research",
        };

      case Routes.GreenGrowthAdvantage:
        return {
          title: "Comparative Advantage Across Green Value Chains",
          content: `Here is ${countryName}'s competitiveness across different green value chains. Countries with a revealed comparative advantage (RCA) greater than 1 are more competitive in that product than the global average.`,
          source: "Source: Growth Lab research",
        };

      case Routes.GreenGrowthMinerals:
        return {
          title: "Critical Mineral Opportunities Across Value Chains",
          content:
            "Critical minerals power the energy transition, since they form important inputs to many different energy technologies. Minerals are circled here with black borders. For the world to decarbonize, mineral producers will need to quickly scale-up production, which represents an important green growth opportunity for many countries. This requires mineral deposits and good mining policy.",
          source: "Source: Growth Lab research",
        };

      case Routes.GreenGrowthCompetitiveness:
        return {
          title: "Competitiveness in Green Value Chains",
          content: `This shows ${countryName}'s actual presence (colored bar) in each green value chain versus the level if ${countryName} had average competitiveness in all value chain components (black line), revealing ${countryName}'s areas of strength and concentration.`,
          source: "Source: Growth Lab research",
        };

      default:
        return {
          title: "Green Growth Exploration",
          content:
            "Explore the data and discover opportunities for green growth.",
          source: "Source: Growth Lab research",
        };
    }
  };

  const stepData = getStepContent(stepRoute);

  return (
    <Paper
      elevation={2}
      sx={{
        position: "fixed",
        bottom: 24,
        left: 24,
        right: 24,
        zIndex: 200,
        p: 3,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderRadius: 2,
        maxWidth: "500px",
        margin: "0 auto",
        "@media (min-width: 1200px)": {
          left: "340px", // Account for sidebar
          maxWidth: "400px",
          margin: 0,
        },
        "@media (max-width: 600px)": {
          bottom: 12,
          left: 12,
          right: 12,
          p: 2,
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          mb: 2,
          fontSize: "18px",
          lineHeight: 1.3,
        }}
      >
        {stepData.title}
      </Typography>

      <Typography
        sx={{
          fontSize: "14px",
          lineHeight: 1.5,
          color: "#333",
          mb: 2,
        }}
      >
        {stepData.content}
      </Typography>

      <Typography
        sx={{
          fontSize: "12px",
          color: "#666",
          fontStyle: "italic",
        }}
      >
        {stepData.source}
      </Typography>
    </Paper>
  );
};

export default StepContent;
