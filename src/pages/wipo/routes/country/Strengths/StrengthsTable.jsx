import { useOutletContext } from "react-router-dom";
import Table from "../../../components/Table.jsx";
const tableConfig = {
  sector_name: { title: "Innovation Dimension" },
  inno_type: { title: "Innovation Type" },
  mcp: { title: "Innovation Capabilities" },
};

const StrengthsTable = () => {
  const { data = [] } = useOutletContext();
  const tableData = data.sort((d1, d2) => parseInt(d2.mcp) - parseInt(d1.mcp));
  return <Table data={tableData} tableConfig={tableConfig} />;
};

export default StrengthsTable;
