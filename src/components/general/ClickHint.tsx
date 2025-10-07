import type React from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import PointerIcon from "../../assets/pointer.svg";
import { CLICK_HINT_DEFAULTS } from "./clickHintDefaults";

interface ClickHintProps {
  text: string;
  x?: number;
  y?: number;
  transform?: string;
  fontSize?: {
    mobile: string;
    desktop: string;
  };
  fontWeight?: string | number;
  color?: string;
  iconHeight?: number;
  iconSpacing?: number;
}

const ClickHint: React.FC<ClickHintProps> = ({
  text,
  x = 0,
  y = 0,
  transform = "",
  fontSize = {
    mobile: String(CLICK_HINT_DEFAULTS.fontSize.mobile),
    desktop: String(CLICK_HINT_DEFAULTS.fontSize.desktop),
  },
  fontWeight = CLICK_HINT_DEFAULTS.fontWeight,
  color = CLICK_HINT_DEFAULTS.color,
  iconHeight = CLICK_HINT_DEFAULTS.iconHeight,
  iconSpacing = CLICK_HINT_DEFAULTS.iconSpacing,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <g transform={`translate(${x}, ${y}) ${transform}`} data-export-hide="true">
      <image href={PointerIcon} height={iconHeight} />
      <text
        x={iconSpacing}
        y={CLICK_HINT_DEFAULTS.textYOffset}
        fontSize={isMobile ? fontSize.mobile : fontSize.desktop}
        fontWeight={fontWeight}
        fill={color}
      >
        {text}
      </text>
    </g>
  );
};

export default ClickHint;
