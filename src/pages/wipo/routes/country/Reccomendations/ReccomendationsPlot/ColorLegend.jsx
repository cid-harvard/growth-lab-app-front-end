import complexityColorScale from "./complexityColorScale";

const ColorLegend = () => {
  const gradientId = "colorGradient";

  const colors = complexityColorScale.range();

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <span>High Complexity</span>

      <svg width="44" height="320">
        <defs>
          <linearGradient id={gradientId} gradientTransform="rotate(90)">
            <stop offset="0%" stopColor={colors[0]} />
            <stop
              offset="50%"
              stopColor={colors[Math.floor(colors.length / 2)]}
            />
            <stop offset="100%" stopColor={colors[colors.length - 1]} />
          </linearGradient>
        </defs>
        <rect
          x="16"
          y="0"
          width="12"
          height="320"
          fill={`url(#${gradientId})`}
        />
      </svg>

      <span>Low Complexity</span>
    </div>
  );
};

export default ColorLegend;
