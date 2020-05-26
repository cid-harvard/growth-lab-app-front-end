import {
  Datum as DynamicTableDatum,
  Column as DynamicTableColumn,
} from '../../../components/text/DynamicTable';
import {
  NationalityConnection,
  SchoolingConnection,
  OccupationConnection,
} from '../graphql/graphQLTypes';

interface Input {
  nationalityEdges: NationalityConnection['edges'];
  schoolingEdges: SchoolingConnection['edges'];
  occupationEdges: OccupationConnection['edges'];
}

export default (input: Input) => {
  const { nationalityEdges, schoolingEdges, occupationEdges } = input;
  /*****
    Transform data for Sector Demographics Table
                   AND Industry Wages Table
                   (both use same endpoint)
  ******/
  const sectorTableColumns: DynamicTableColumn[] = [
    {label: 'Nationality', key: 'nationality'},
    {label: 'Women', key: 'women'},
    {label: 'Men', key: 'men'},
  ];
  const sectorTableData: DynamicTableDatum[] = [];
  const wagesTableColumns: DynamicTableColumn[] = [
    {label: 'Nationality', key: 'nationality'},
    {label: 'Mean Wage (JD)', key: 'meanwage'},
    {label: 'Median Wage (JD)', key: 'medianwage'},
  ];
  const wagesTableData: DynamicTableDatum[] = [];
  nationalityEdges.forEach(datum => {
    if (datum !== null && datum.node !== null) {
      const { nationality, men, women, meanwage, medianwage } = datum.node;
      if (men !== null && women !== null) {
        sectorTableData.push({men, women, nationality});
      }
      if (meanwage !== null && medianwage !== null) {
        wagesTableData.push({nationality, meanwage, medianwage});
      }
    }
  });

  /*****
    Transform data for Schooling Distribution Table
  ******/
  const schoolTableColumns: DynamicTableColumn[] = [
    {label: 'Schooling', key: 'schooling'},
    {label: 'Women', key: 'women'},
    {label: 'Men', key: 'men'},
  ];
  const schoolTableData: DynamicTableDatum[] = [];
  schoolingEdges.forEach(datum => {
    if (datum !== null && datum.node !== null) {
      const { schooling, men, women } = datum.node;
      if (men !== null && women !== null) {
        schoolTableData.push({men, women, schooling});
      }
    }
  });

  /*****
    Transform data for Occupation Distribution Table
  ******/
  const occupationTableColumns: DynamicTableColumn[] = [
    {label: 'occupation', key: 'occupation'},
    {label: 'Women', key: 'women'},
    {label: 'Men', key: 'men'},
  ];
  const occupationTableData: DynamicTableDatum[] = [];
  occupationEdges.forEach(datum => {
    if (datum !== null && datum.node !== null) {
      const { occupation, men, women } = datum.node;
      if (men !== null && women !== null) {
        occupationTableData.push({men, women, occupation});
      }
    }
  });

  return {
    sectorTableColumns, sectorTableData,
    wagesTableColumns, wagesTableData,
    schoolTableColumns, schoolTableData,
    occupationTableColumns, occupationTableData,
  };

};