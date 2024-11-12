import { useOutletContext } from "react-router-dom";
import { incomeGroups } from "./utils";
import Table from "../../../components/Table";
import {
  ubiquityDescription,
  diversityDescription,
} from "../../../assets/descriptions";

const tableConfig = {
  unit_name: { title: "Country Name" },
  avg_ubiquity: { title: "Average Ubiquity", tooltip: ubiquityDescription },
  diversity: { title: "Diversity", tooltip: diversityDescription },
  inno_type: { title: "Innovation Type" },
  income_group: { title: "Income Group" },
};

const RemunerationTable = () => {
  const { data } = useOutletContext();
  const tableData = data.map(
    ({ unit_name, avg_ubiquity, diversity, inno_type, income_group }) => ({
      unit_name,
      income_group: `${incomeGroups[income_group].name} Income`,
      inno_type,
      avg_ubiquity: parseFloat(avg_ubiquity).toFixed(1),
      diversity,
    }),
  );
  return <Table data={tableData} tableConfig={tableConfig} />;
};

export default RemunerationTable;
