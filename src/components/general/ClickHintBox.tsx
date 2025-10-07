import type React from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import PointerIcon from "../../assets/pointer.svg";
import { CLICK_HINT_DEFAULTS } from "./clickHintDefaults";

interface ClickHintBoxProps {
  text: string;
  fontSize?: {
    mobile: string;
    desktop: string;
  };
  fontWeight?: string | number;
  iconHeight?: string;
  iconMarginRight?: string;
  sx?: object;
}

const ClickHintBox: React.FC<ClickHintBoxProps> = ({
  text,
  fontSize = {
    mobile: `${CLICK_HINT_DEFAULTS.fontSize.mobile}px`,
    desktop: `${CLICK_HINT_DEFAULTS.fontSize.desktop}px`,
  },
  fontWeight = CLICK_HINT_DEFAULTS.fontWeight,
  iconHeight = `${CLICK_HINT_DEFAULTS.iconHeight}px`,
  iconMarginRight = `${CLICK_HINT_DEFAULTS.iconMarginRight}px`,
  sx = {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", ...sx }}
      data-export-hide="true"
    >
      <img
        src={PointerIcon}
        alt="Click pointer icon"
        style={{
          width: "auto",
          height: iconHeight,
          marginRight: iconMarginRight,
        }}
      />
      <Typography
        variant="body2"
        sx={{
          fontSize: isMobile ? fontSize.mobile : fontSize.desktop,
          fontWeight: fontWeight,
          color: CLICK_HINT_DEFAULTS.color,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

export default ClickHintBox;
