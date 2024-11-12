const RectangleShape = (props) => {
  const { cx, cy, width, height, fill } = props;
  return (
    <rect
      x={cx - width / 2}
      y={cy - height / 2 - 0.55}
      width={width}
      height={height}
      fill={fill}
    />
  );
};

export default RectangleShape;
