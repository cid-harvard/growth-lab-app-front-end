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

const countryToColor = (country: SourceCountries) => {
  if (country) {
    return 'red';
  } else {
    return 'blue';
  }
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
});

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
