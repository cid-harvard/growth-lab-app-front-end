import React from "react";
import { ParentSize } from "@visx/responsive";
import { TableWrapper } from "../../shared";
import ClusterTreeInternal from "./ClusterTreeInternal";

// Main export component with ParentSize wrapper
export default function ClusterTree() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <TableWrapper defaultDataType="products">
        <ParentSize>
          {({ width, height }) => {
            if (width === 0 || height === 0) {
              return null;
            }
            return <ClusterTreeInternal width={width} height={height} />;
          }}
        </ParentSize>
      </TableWrapper>
    </div>
  );
}
