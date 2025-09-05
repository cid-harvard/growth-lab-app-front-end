import { memo } from "react";
import { formatter } from "./CirclePack";

const ExpectedOverlay = ({ overlay, bars, isMobile }) => {
  const actualValue = Array.from(bars.values())
    .filter((bar) => bar.parentId === overlay.parentId)
    .reduce((sum, bar) => sum + bar.exportValue, 0);

  return (
    <g key={`supply-chain-${overlay.parentId}`} className="parent-circle">
      <rect
        x={overlay.coords[0][0]}
        y={overlay.coords[0][1]}
        width={5}
        height={overlay.coords[1][1] - overlay.coords[0][1]}
        fill="black"
        fillOpacity={0.7}
      />

      <text
        x={isMobile ? 10 : 60}
        y={overlay.coords[0][1] - 8}
        fontSize={`clamp(13px, 1.5vw, 16px)`}
        textAnchor="start"
        fontWeight="600"
      >
        {overlay.name} Actual Value: {formatter.format(actualValue)} | World
        Average: {formatter.format(overlay.expectedTotal)}
      </text>
    </g>
  );
};

export default memo(ExpectedOverlay);
