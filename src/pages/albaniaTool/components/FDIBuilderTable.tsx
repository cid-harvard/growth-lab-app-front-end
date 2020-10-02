import React, {useState} from 'react';
import QueryTableBuilder, {CallbackData} from '../../../components/tools/QueryTableBuilder';
import { colorScheme } from '../Utils';
import {
  FDIMarketConnection,
  FDIMarketOvertimeDestination,
} from '../graphql/graphQLTypes';
import transformFDITop10List from '../transformers/transformFDITop10List';
import {
  Column as DynamicTableColumn,
} from '../../../components/text/DynamicTable';
import { TreeNode } from 'react-dropdown-tree-select';
import sortBy from 'lodash/sortBy';
import {PatternBlock} from '../../../styling/styleUtils';

interface Props {
  fdiMarketsEdges: FDIMarketConnection['edges'];
  industryName: string;
}

export default (props: Props) => {
  const {
    fdiMarketsEdges, industryName,
  } = props;
  const [filterCountry, setFilterCountry] = useState<string | undefined>(undefined);
  const [filterCity, setFilterCity] = useState<string | undefined>(undefined);

  const columns: DynamicTableColumn[] = [
    {label: 'Company', key: 'company'},
    {label: 'Source Country', key: 'country'},
    {label: 'Source City', key: 'city'},
  ];

  const countryData: TreeNode[] = [];
  const cityData: TreeNode[] = [{label: 'Not Specified', value: 'Not Specified', parentValue: null}];
  fdiMarketsEdges.forEach(edge => {
    if (edge && edge.node && edge.node.sourceCountry && edge.node.sourceCity) {
      const sourceCountry = edge.node.sourceCountry;
      const sourceCity = edge.node.sourceCity;
      if (countryData.find(({value}) => value === sourceCountry) === undefined) {
        countryData.push({label: sourceCountry, value: sourceCountry});
      }
      if (cityData.find(({value}) => value === sourceCity) === undefined) {
        cityData.push({label: sourceCity, value: sourceCity, parentValue: sourceCountry});
      }
    }
  });
  const allCountries = 'All Countries';
  const allCities = 'All Cities';
  const sortedCountries = sortBy(countryData, ['label']);
  const sortedCities = sortBy(cityData, ['label']);
  sortedCountries.unshift({label: allCountries, value: allCountries});
  sortedCities.unshift({label: allCities, value: allCities, parentValue: null});

  const filterData = (data: CallbackData) => {
    const countryFilterColumn = data.selectedFields.find(({id}) => id === 'country');
    if (countryFilterColumn) {
      if (countryFilterColumn.value === allCountries) {
        setFilterCountry(undefined);
      } else {
        setFilterCountry(countryFilterColumn.value);
      }
    }
    const cityFilterColumn = data.selectedFields.find(({id}) => id === 'city');
    if (cityFilterColumn) {
      if (cityFilterColumn.value === allCities) {
        setFilterCity(undefined);
      } else {
        setFilterCity(cityFilterColumn.value);
      }
    }
  };

  const filteredEdgeData: FDIMarketConnection['edges'] = [];
  const flattendDataForCSV: object[] = [];
  fdiMarketsEdges.forEach(edge => {
    if (edge && edge.node && edge.node.sourceCountry && edge.node.sourceCity) {
      if (
        (filterCountry === undefined || filterCountry === edge.node.sourceCountry) &&
        (filterCity === undefined || filterCity === edge.node.sourceCity)
        ) {
        filteredEdgeData.push(edge);
        const {
          parentCompany, sourceCountry, sourceCity,
          capexBalkans, capexEurope, capexWorld,
          projectsBalkans, projectsEurope, projectsWorld,
          avgCapex, avgJobs,
        } = edge.node;
        flattendDataForCSV.push({
          'Parent Company': parentCompany,
          'Source Country': sourceCountry,
          'Source City': sourceCity,
          'Capex Balkans': capexBalkans,
          'Capex Europe': capexEurope,
          'Capex World': capexWorld,
          'Projects Balkans': projectsBalkans,
          'Projects Europe': projectsEurope,
          'Projects World': projectsWorld,
          'Average Capex': avgCapex,
          'Average Jobs': avgJobs,
        });
      }
    }
  });
  const topPreviewData = transformFDITop10List({
    fdiMarketsEdges: filteredEdgeData, destination: FDIMarketOvertimeDestination.Balkans,
    showZeroValues: true,
  });
  let filename = `Company List for ${industryName}`;
  if (filterCountry !== undefined) {
    filename = `${filename} - ${filterCountry}`;
  }
  if (filterCity !== undefined) {
    filename = `${filename} - ${filterCity}`;
  }
  filename = filename + '.csv';
  return (
    <PatternBlock>
      <QueryTableBuilder
        primaryColor={colorScheme.primary}
        onUpdateClick={filterData}
        selectFields={[
          {
            id: 'country',
            label: 'Source Country',
            data: sortedCountries,
            required: true,
          },
          {
            id: 'city',
            label: 'Source City',
            data: sortedCities,
            dependentOn: 'country',
          },
        ]}
        itemName={'companies'}
        columns={columns}
        queryLength={filteredEdgeData.length}
        tableData={topPreviewData}
        queryToDownload={flattendDataForCSV}
        filename={filename}
      />
      <p style={{textAlign: 'center', fontSize: '0.8rem'}}>
        <em>
          Source: fDi Markets Library, a service from The Financial Times Limited (2019). All Rights Reserved.
        </em>
      </p>
    </PatternBlock>
  );
};