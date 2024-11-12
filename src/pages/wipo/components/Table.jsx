import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useMemo } from "react";
import LightTooltip from "./LightTooltip";

const Table = ({ data, tableConfig }) => {
  "use no memo";
  const columns = useMemo(
    () =>
      Object.keys(data[0])
        .filter((d) => Object.keys(tableConfig).includes(d))
        .map((d) => ({
          accessorKey: d,
          header: tableConfig[d].title,

          Header: ({ column }) => (
            <LightTooltip
              title={tableConfig[column.columnDef.accessorKey].tooltip}
            >
              <span
                style={{
                  textDecoration: tableConfig[column.columnDef.accessorKey]
                    .tooltip
                    ? "underline dotted"
                    : "none",
                }}
              >
                {" "}
                {column.columnDef.header}
              </span>
            </LightTooltip>
          ),
        })),
    [data, tableConfig],
  );

  const table = useMaterialReactTable({
    columns,
    data,
    enableGlobalFilterModes: true,
    enableStickyHeader: true,
    enablePagination: true,
    muiTableBodyProps: {
      sx: {
        '& tr:not([data-selected="true"]):not([data-pinned="true"]):hover > td':
          {
            backgroundColor: "#f9d9aa",
          },
        '& tr:not([data-selected="true"]):not([data-pinned="true"]):hover > td::after':
          {
            backgroundColor: "initial",
          },
      },
    },
  });
  return <MaterialReactTable enableStickyHeader={true} table={table} />;
};
export default Table;
