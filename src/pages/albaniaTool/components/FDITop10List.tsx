import React, {useState} from 'react';
import InlineToggle from '../../../components/text/InlineToggle';
import {
  Light,
  HeaderWithLegend,
} from '../../../styling/styleUtils';
import { colorScheme } from '../Utils';
import TextBlock from '../../../components/text/TextBlock';
import { TreeNode } from 'react-dropdown-tree-select';
import Legend from '../../../components/dataViz/Legend';
import transformFDITop10List from '../transformers/transformFDITop10List';
import {
  FDIMarketConnection,
  FDIMarketOvertimeDestination,
} from '../../../graphql/graphQLTypes';

interface Props {
  fdiMarketsEdges: FDIMarketConnection['edges'];
}

export default (props: Props) => {
  const {
    fdiMarketsEdges,
  } = props;

  const [selectedCountry, setSelectedCountry] = useState<TreeNode>({ label: 'World', value: 'World' });
  let destination: FDIMarketOvertimeDestination;
  let legendColor: string;
  let the = 'the';
  if (selectedCountry.value === 'World') {
    legendColor = colorScheme.primary;
    destination = FDIMarketOvertimeDestination.RestOfWorld;
  } else if (selectedCountry.value === 'Europe') {
    legendColor = colorScheme.quaternary;
    destination = FDIMarketOvertimeDestination.RestOfEurope;
    the = '';
  } else if (selectedCountry.value === 'Balkans') {
    legendColor = colorScheme.header;
    destination = FDIMarketOvertimeDestination.Balkans;
  } else {
    legendColor = colorScheme.primary;
    destination = FDIMarketOvertimeDestination.Balkans;
  }

  const fdiTop10List = transformFDITop10List({fdiMarketsEdges, destination});
  const listItems = fdiTop10List.length === 0 ? (
    <p>There are no results for this industry in {the} <strong>{selectedCountry.value}</strong></p>
  ) : fdiTop10List.map(({company, country, city}) => (
    <li key={company + country + city}>{company}, <Light>{country}</Light></li>
  ));
  return (
    <TextBlock>
      <HeaderWithLegend legendColor={legendColor}>
        <div>
          Top Global FDI in <InlineToggle
              data={[
                { label: 'World', value: 'World' },
                { label: 'Europe', value: 'Europe' },
                { label: 'Balkans', value: 'Balkans' },
              ]}
              colorClassName={'albania-color-scheme'}
              onChange={setSelectedCountry}
            />
        </div>
      </HeaderWithLegend>
      <ol>{listItems}</ol>
      <Legend
        legendList={[
          {label: 'World', fill: colorScheme.primary, stroke: undefined},
          {label: 'Europe', fill: colorScheme.quaternary, stroke: undefined},
          {label: 'Balkans', fill: colorScheme.header, stroke: undefined},
        ]}
      />
    </TextBlock>
  );
};