import React, {useState} from 'react';
import QueryTableBuilder, {CallbackData} from '../../../components/tools/QueryTableBuilder';
import noop from 'lodash/noop';
import { colorScheme } from '../Utils';
import PasswordProtectedComponent from '../../../components/text/PasswordProtectedComponent';
import {
  FDIMarketConnection,
  FDIMarketOvertimeDestination,
} from '../../../graphql/graphQLTypes';
import transformFDITop10List from '../transformers/transformFDITop10List';
import {
  Column as DynamicTableColumn,
} from '../../../components/text/DynamicTable';
import { TreeNode } from 'react-dropdown-tree-select';
import sortBy from 'lodash/sortBy';

interface Props {
  fdiMarketsEdges: FDIMarketConnection['edges'];
}

export default (props: Props) => {
  const {
    fdiMarketsEdges,
  } = props;
  const [fdiPasswordValue, setFdiPasswordValue] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<string | undefined>(undefined);
  const [filterCity, setFilterCity] = useState<string | undefined>(undefined);

  const columns: DynamicTableColumn[] = [
    {label: 'Company', key: 'company'},
    {label: 'Source Country', key: 'country'},
    {label: 'Source City', key: 'city'},
  ];

  const countryData: TreeNode[] = [];
  const cityData: TreeNode[] = [];
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

  let content: React.ReactElement<any>;
  if (fdiPasswordValue === process.env.REACT_APP_ALBANIA_FDI_PASSWORD) {
    const filteredEdgeData: FDIMarketConnection['edges'] = [];
    fdiMarketsEdges.forEach(edge => {
      if (edge && edge.node && edge.node.sourceCountry && edge.node.sourceCity) {
        if (
          (filterCountry === undefined || filterCountry === edge.node.sourceCountry) &&
          (filterCity === undefined || filterCity === edge.node.sourceCity)
          ) {
          filteredEdgeData.push(edge);
        }
      }
    });
    const topPreviewData = transformFDITop10List({
      fdiMarketsEdges: filteredEdgeData, destination: FDIMarketOvertimeDestination.Balkans,
      showZeroValues: true,
    });
    content = (
      <QueryTableBuilder
        primaryColor={colorScheme.primary}
        onQueryDownloadClick={noop}
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
      />
    );
  } else {
    content = (
      <QueryTableBuilder
        primaryColor={colorScheme.primary}
        onQueryDownloadClick={noop}
        onUpdateClick={noop}
        selectFields={[
          {
            id: 'country',
            label: 'Source Country',
            data: [sortedCountries[0]],
            required: true,
          },
          {
            id: 'city',
            label: 'Source City',
            data: [sortedCities[0]],
            dependentOn: 'country',
          },
        ]}
        itemName={'companies'}
        columns={columns}
        tableData={[]}
        queryLength={0}
        disabled={true}
      />
    );
  }
  return (
    <PasswordProtectedComponent
      title={'This section is password protected. Please enter your password to access FDI data.'}
      buttonColor={colorScheme.primary}
      onPasswordSubmit={setFdiPasswordValue}
    >
      {content}
    </PasswordProtectedComponent>
  );
};