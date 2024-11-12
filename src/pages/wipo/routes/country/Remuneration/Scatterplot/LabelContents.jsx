const LabelContents = ({ value, x, y }) => {
  if (!value.length) {
    return null;
  }
  return (
    <text
      style={{ pointerEvents: "none" }}
      x={x}
      y={y}
      stroke="white"
      strokeWidth="2"
      paintOrder="stroke"
    >
      {value}
    </text>
  );
};

export default LabelContents;
