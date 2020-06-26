import React from 'react';
import DataViz, {VizType} from '../../../components/dataViz';
import {Datum} from '../../../components/dataViz/clusterChart';
import styled from 'styled-components/macro';
import raw from 'raw.macro';
import sortBy from 'lodash/sortBy';

const cellSize = 90; // in px

const Root = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: auto repeat(7, ${cellSize}px);
`;

const Cell = styled.div`
  padding: 0.5rem;
  display: flex;
  align-items: center;
  font-size: 0.85rem;
`;

const Title = styled(Cell)`
  border-bottom: solid 1px #666;
  align-items: flex-end;
  text-align: center;
`;

enum DestinationCountries {
  Romania = 'Romania',
  NorthMacedonia = 'North Macedonia',
  Serbia = 'Serbia',
  Croatia = 'Croatia',
  Montenegro = 'Montenegro',
  Albania = 'Albania',
}

enum Industries {
  Communications = 'Communications',
  MetalsAndMining = 'Metals & Mining',
  OilAndGasAndCoal = 'Oil & Gas & Coal',
  RenewableEnergy = 'Renewable Energy',
  AutomobilesAndTransportation = 'Automobiles & Transportation',
  Pharmaceuticals = 'Pharmaceuticals',
  FoodAndAgriculture = 'Food & Agriculture',
}

enum SourceCountries {
  China = 'China',
  Germany = 'Germany',
  Bulgaria = 'Bulgaria',
  Other = 'Other',
  Turkey = 'Turkey',
  Japan = 'Japan',
  UnitedKingdom = 'United Kingdom',
  NorthMacedonia = 'North Macedonia',
  UnitedStates = 'United States',
  Italy = 'Italy',
  Norway = 'Norway',
  France = 'France',
  Slovenia = 'Slovenia',
  Spain = 'Spain',
  India = 'India',
  Serbia = 'Serbia',
  Switzerland = 'Switzerland',
  UAE = 'UAE',
  Kazakhstan = 'Kazakhstan',
  Romania = 'Romania',
  Tunisia = 'Tunisia',
  Ethiopia = 'Ethiopia',
  Iceland = 'Iceland',
}

export const countries = [
  { fill: '#59a14f', country: 'Germany' },
  { fill: '#4e79a7', country: 'United States' },
  { fill: '#86bcb6', country: 'Italy' },
  { fill: '#8cd17d', country: 'France' },
  { fill: '#e15759', country: 'United Kingdom' },
  { fill: '#a0cbe8', country: 'China' },
  { fill: '#f28e2b', country: 'Japan' },
  { fill: '#79706e', country: 'Turkey' },
  { fill: '#ff9d9a', country: 'Spain' },
  { fill: '#b6992d', country: 'Switzerland' },
  { fill: '#ffc3c2', country: 'Bulgaria' },
  { fill: '#ed999a', country: 'Ethiopia' },
  { fill: '#c3ac9e', country: 'Iceland' },
  { fill: '#ffbe7d', country: 'India' },
  { fill: '#9ac694', country: 'Kazakhstan' },
  { fill: '#f7ba7e', country: 'North Macedonia' },
  { fill: '#f1ce63', country: 'Norway' },
  { fill: '#bab0ac', country: 'Other' },
  { fill: '#e5c9de', country: 'Romania' },
  { fill: '#fabfd2', country: 'Serbia' },
  { fill: '#d3c17f', country: 'Slovenia' },
  { fill: '#d7b5a6', country: 'Tunisia' },
  { fill: '#499894', country: 'UAE' },
];

const countryToColor = (country: SourceCountries) => {
  const target = countries.find(c => c.country === country);
  if (target && target.fill) {
    return target.fill;
  } else {
    return '#FDEBD0';
  }
  // if (country === SourceCountries.China) { return '#EC7063'; }
  // else if (country === SourceCountries.Germany) { return '#9B59B6'; }
  // else if (country === SourceCountries.Bulgaria) { return '#5499C7'; }
  // else if (country === SourceCountries.Other) { return '#1ABC9C'; }
  // else if (country === SourceCountries.Turkey) { return '#16A085'; }
  // else if (country === SourceCountries.Japan) { return '#229954'; }
  // else if (country === SourceCountries.UnitedKingdom) { return '#D4AC0D'; }
  // else if (country === SourceCountries.NorthMacedonia) { return '#F39C12'; }
  // else if (country === SourceCountries.UnitedStates) { return '#E67E22'; }
  // else if (country === SourceCountries.Italy) { return '#D35400'; }
  // else if (country === SourceCountries.Norway) { return '#5D6D7E'; }
  // else if (country === SourceCountries.France) { return '#7B241C'; }
  // else if (country === SourceCountries.Slovenia) { return '#512E5F'; }
  // else if (country === SourceCountries.Spain) { return '#154360'; }
  // else if (country === SourceCountries.India) { return '#117864'; }
  // else if (country === SourceCountries.Serbia) { return '#196F3D'; }
  // else if (country === SourceCountries.Switzerland) { return '#E59866'; }
  // else if (country === SourceCountries.UAE) { return '#C39BD3'; }
  // else if (country === SourceCountries.Kazakhstan) { return '#A2D9CE'; }
  // else if (country === SourceCountries.Romania) { return '#784212'; }
  // else if (country === SourceCountries.Tunisia) { return '#2ECC71'; }
  // else if (country === SourceCountries.Ethiopia) { return '#F1948A'; }
  // else if (country === SourceCountries.Iceland) { return '#784212'; }
  // else { return '#FDEBD0'; }
};

interface RawDatum {
  destination_country: DestinationCountries;
  industries: Industries;
  parent_company: string;
  source_country: SourceCountries;
  percent_of_total_count_of_capital_investment: number;
}

const rawData: RawDatum[] = JSON.parse(raw('./data/investments_vs_regional_peers_data.json'));

interface ConfigDatum {
  industry: Industries;
  destinations: {
    country: DestinationCountries;
    data: Datum[];
  }[];
}

const configData: ConfigDatum[] = [];
const allRomaniaValues: number[] = [];

rawData.forEach(d => {
  const {
    destination_country, industries, parent_company, source_country,
    percent_of_total_count_of_capital_investment,
  } = d;
  const newDatum = {
    name: parent_company,
    label: parent_company,
    value: percent_of_total_count_of_capital_investment,
    fill: countryToColor(source_country),
    tooltipContent: `<strong>${source_country}</strong>`,
  };
  const targetIndustryIndex = configData.findIndex(({industry}) => industry === industries);
  if (targetIndustryIndex !== -1) {
    const targetCountryIndex =
      configData[targetIndustryIndex].destinations.findIndex(({country}) => country === destination_country);
    if (targetCountryIndex !== -1) {
      configData[targetIndustryIndex].destinations[targetCountryIndex].data.push(newDatum);
    } else {
      configData[targetIndustryIndex].destinations.push({
        country: destination_country,
        data: [newDatum],
      });
    }
  } else {
    configData.push({
      industry: industries,
      destinations: [{
        country: destination_country,
        data: [newDatum],
      }],
    });
  }
  if (destination_country === DestinationCountries.Romania && industries === Industries.AutomobilesAndTransportation) {
    allRomaniaValues.push(newDatum.value);
  }
});

const max = allRomaniaValues.reduce((a, b) => a + b, 0);

const ClusterChart = () => {
  const rows = sortBy(configData, ['industry']).map(({industry, destinations}) => {
    const columns = sortBy(destinations, (({country}) => {
      if (country === DestinationCountries.Albania) {
        return 0;
      } else if (country === DestinationCountries.Montenegro) {
        return 1;
      } else if (country === DestinationCountries.NorthMacedonia) {
        return 2;
      } else if (country === DestinationCountries.Croatia) {
        return 3;
      } else if (country === DestinationCountries.Serbia) {
        return 4;
      } else if (country === DestinationCountries.Romania) {
        return 5;
      } else {
        return 6;
      }
    })).map(({data, country}) => {
      return (
        <Cell key={country + industry}>
          <DataViz
            height={cellSize}
            id={'albania-story-cluster-chart-' + industry + country}
            vizType={VizType.ClusterChart}
            data={data}
            hideLabels={true}
            circleSpacing={0}
            max={max}
          />
        </Cell>
      );
    });
    return (
      <React.Fragment key={industry}>
        <Cell>{industry}</Cell>
        {columns}
      </React.Fragment>
    );
  });

  return (
    <Root>
      <Title>Industries</Title>
      <Title>Albania</Title>
      <Title>Montenegro</Title>
      <Title>North Macedonia</Title>
      <Title>Croatia</Title>
      <Title>Serbia</Title>
      <Title>Romania</Title>
      {rows}
    </Root>
  );
};

export default ClusterChart;
