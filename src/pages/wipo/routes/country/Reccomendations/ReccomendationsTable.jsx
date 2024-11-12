import { useOutletContext } from "react-router-dom";
import Table from "../../../components/Table";

const tableConfig = {
  sector_name: { title: "Sector" },
  expected_value: {
    title: "Expected Value",
    tooltip: "Number of expected patents (based on academic publications)",
  },
  value: { title: "Actual Value", tooltip: "Number of patents" },
  difference: {
    title: "Difference",
    tooltip:
      "Difference between expected patents based on academic publications and actual number of patents",
  },
};
const ReccomendationsTable = () => {
  const { data } = useOutletContext();

  const tableData = data
    .map((d) => {
      const expected_value = parseFloat(d.expected_value).toFixed(1);
      const value = parseFloat(d.value).toFixed(0);
      return {
        ...d,
        expected_value,
        value,
        difference: (value - expected_value).toFixed(0),
      };
    })
    .sort((d1, d2) => d2.value - d1.value);
  return <Table data={tableData} tableConfig={tableConfig} />;
};
export default ReccomendationsTable;
