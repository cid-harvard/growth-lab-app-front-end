import { useOutletContext } from "react-router-dom";
import {
  densityDescription,
  innovationCapabilityComplexity,
} from "../../../assets/descriptions";
import Table from "../../../components/Table";

const tableConfig = {
  field_name: { title: "Innovation Dimension" },
  inno_type: { title: "Innovation Type" },
  pci_together: {
    title: "Innovation Capability Complexity",
    tooltip: innovationCapabilityComplexity,
  },
  density_together: { title: "Density", tooltip: densityDescription },
};

const CapabilitiesTable = () => {
  const data = useOutletContext();
  const tableData = data
    .sort((d1, d2) => parseFloat(d2.pci_together) - parseFloat(d1.pci_together))
    .sort(
      (d1, d2) =>
        parseFloat(d2.density_together) - parseFloat(d1.density_together),
    );
  return <Table data={tableData} tableConfig={tableConfig} />;
};

export default CapabilitiesTable;
