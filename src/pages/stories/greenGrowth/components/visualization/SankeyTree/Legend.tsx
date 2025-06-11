import React from "react";
import { RCA_LEGEND_ITEMS } from "../../../utils/colors";

interface LegendProps {
  countrySelection: number | null;
}

export default function Legend({ countrySelection }: LegendProps) {
  if (!countrySelection) return null;

  return (
    <div style={{ marginTop: "20px", fontSize: "14px" }}>
      <h3>RCA Legend:</h3>
      <div style={{ display: "flex", gap: "20px" }}>
        {RCA_LEGEND_ITEMS.map((item, index) => (
          <div
            key={index}
            style={{ display: "flex", alignItems: "center", gap: "5px" }}
          >
            <div
              style={{
                width: "15px",
                height: "15px",
                backgroundColor: item.color,
              }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
