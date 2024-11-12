import { scaleThreshold } from "d3-scale";

const thresholds = [
  -3.2189, -1.34486, -0.9396, -0.5408, -0.2043, 0.1029, 0.3698, 0.6236, 0.86004,
  1.23044, 3.5054,
];

const colors = [
  "#e39f60",
  "#e7ad78",
  "#ebbc8f",
  "#f0caa8",
  "#f4d9bf",
  "#f8e7d7",
  "#c0e4e1",
  "#9ad3cf",
  "#74c3bd",
  "#4db2ab",
  "#28a299",
  "#029287",
];

const complexityColorScale = scaleThreshold().domain(thresholds).range(colors);

export default complexityColorScale;
