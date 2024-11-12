import { useParams } from "react-router-dom";

const Circle = ({
  visibleInnovations,
  cx,
  cy,
  fill,
  unit,
  highlightedCountry,
}) => {
  const { countryId } = useParams();
  return (
    <>
      {unit === highlightedCountry && (
        <circle
          cx={cx}
          cy={cy}
          r={visibleInnovations.length === 1 ? 12 : 8}
          fill={fill}
          opacity={0.5}
          stroke="white"
          strokeWidth="1"
          style={{ pointerEvents: "none" }}
        />
      )}
      <circle
        cx={cx}
        cy={cy}
        r={visibleInnovations.length === 1 ? 4.5 : 3}
        fill={fill}
        stroke={unit === countryId ? "black" : "none"}
        strokeWidth={1}
      />
    </>
  );
};
export default Circle;
