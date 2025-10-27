import React from "react";

export interface StackedBarsChartProps {
  year: string | number;
  countryId: string | number;
  mode?: "presence" | "comparison";
}

declare const StackedBarsChart: React.FC<StackedBarsChartProps>;

export default StackedBarsChart;
