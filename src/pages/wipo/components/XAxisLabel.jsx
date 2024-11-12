import LightTooltip from "./LightTooltip";

const XAxisLabel = ({
  offset,
  value,
  tooltipValue = "",
  viewBox: { x, y, width },
}) => {
  return (
    <foreignObject
      y={y + offset}
      x={width / 2 + x}
      width="1"
      height="29px"
      style={{ overflow: "visible", whiteSpace: "nowrap", lineHeight: 1 }}
    >
      <LightTooltip title={tooltipValue}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            fontWeight: "600",
            borderBottom: "2px dotted #000",
            display: "inline-block",
            transform: "translateX(-50%)",
          }}
        >
          {value}
        </div>
      </LightTooltip>
    </foreignObject>
  );
};
export default XAxisLabel;
