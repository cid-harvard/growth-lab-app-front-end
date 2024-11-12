import LightTooltip from "./LightTooltip";

const YAxisLabel = ({
  offset,
  viewBox: { height, width, y },
  value,
  angle,
  tooltipValue = "",
}) => {
  return (
    <g transform={`rotate(${angle},${width},${height / 2})`}>
      <LightTooltip title={tooltipValue} placement="right">
        <foreignObject
          y={height / 2 - offset}
          x={width / 2}
          width="100"
          height="30" // Adjust based on text size
          style={{ overflow: "visible", whiteSpace: "nowrap" }}
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              fontWeight: "600",
              borderBottom: "2px dotted #000",
              display: "inline-block",
              transform: "translateX(-25%)",
            }}
          >
            {value}
          </div>
        </foreignObject>
      </LightTooltip>
    </g>
  );
};
export default YAxisLabel;
