import { RANKING_COLORS } from "../../../utils/colors";

export const YAxisAnnotation = () => {
  const svgHeight = 400;
  const colorMargin = 40;
  const colorTotalSize = svgHeight - colorMargin * 2;
  const colorInitialTop = colorMargin;
  const colorWidth = 10;
  const arrowToColorMargin = 32;
  const arrowLeft = 55;
  const colorLeft = arrowLeft + arrowToColorMargin;
  const arrowInitialTop = colorInitialTop;
  const arrowSpacing = colorTotalSize / 8;

  // Match exact spacing from overtime viz ColorLegend
  const arrowUpTop = arrowInitialTop + arrowSpacing;
  const arrowUpBottom = arrowInitialTop + arrowSpacing * 3;
  const arrowDownBottom = arrowInitialTop + arrowSpacing * 5;
  const arrowDownTop = arrowUpBottom + arrowSpacing * 4;

  const STROKE_COLOR = "rgb(76, 76, 76)";

  return (
    <div
      aria-hidden
      style={{
        width: 120,
        minWidth: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        marginTop: 68,
      }}
    >
      <svg
        width="100"
        height={svgHeight}
        style={{ overflow: "visible" }}
        role="img"
        aria-label="Complexity ranking scale"
      >
        <title>Complexity ranking scale</title>
        <defs>
          <linearGradient
            id="tableColorGradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            {[...RANKING_COLORS].reverse().map((color, i, arr) => {
              const offset = `${(i / (arr.length - 1)) * 100}%`;
              return (
                <stop
                  key={`gradient-stop-${i}-${color}`}
                  offset={offset}
                  stopColor={color}
                />
              );
            })}
          </linearGradient>
          <marker
            id="tableArrowhead"
            markerWidth="4"
            markerHeight="4"
            orient="auto"
            refY="2"
          >
            <path d="M0,0 L4,2 0,4" fill={STROKE_COLOR} stroke="none" />
          </marker>
        </defs>

        {/* Color bar */}
        <rect
          x={colorLeft}
          y={colorInitialTop}
          width={colorWidth}
          height={colorTotalSize}
          fill="url(#tableColorGradient)"
        />

        {/* Up arrow */}
        <line
          x1={arrowLeft + 20}
          y1={arrowUpBottom}
          x2={arrowLeft + 20}
          y2={arrowUpTop}
          stroke={STROKE_COLOR}
          strokeWidth="2"
          markerEnd="url(#tableArrowhead)"
        />

        {/* Up arrow text */}
        <g
          transform={`translate(${arrowLeft}, ${(arrowUpTop + arrowUpBottom) / 2}) rotate(-90)`}
        >
          <text
            x={0}
            y={0}
            textAnchor="middle"
            style={{
              fill: STROKE_COLOR,
              fontSize: "13px",
              textTransform: "uppercase",
              fontFamily: '"Source Sans Pro", "Arial", sans-serif',
            }}
          >
            <tspan x={0} dy={-8}>
              High Greenplexity
            </tspan>
            <tspan x={0} dy={15}>
              Higher Ranking
            </tspan>
          </text>
        </g>

        {/* Down arrow */}
        <line
          x1={arrowLeft + 20}
          y1={arrowDownBottom}
          x2={arrowLeft + 20}
          y2={arrowDownTop}
          stroke={STROKE_COLOR}
          strokeWidth="2"
          markerEnd="url(#tableArrowhead)"
        />

        {/* Down arrow text */}
        <g
          transform={`translate(${arrowLeft}, ${(arrowDownTop + arrowDownBottom) / 2}) rotate(-90)`}
        >
          <text
            x={0}
            y={0}
            textAnchor="middle"
            style={{
              fill: STROKE_COLOR,
              fontSize: "13px",
              textTransform: "uppercase",
              fontFamily: '"Source Sans Pro", "Arial", sans-serif',
            }}
          >
            <tspan x={0} dy={-8}>
              Low Greenplexity
            </tspan>
            <tspan x={0} dy={15}>
              Lower Ranking
            </tspan>
          </text>
        </g>
      </svg>
    </div>
  );
};
