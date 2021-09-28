import React from 'react';
import {
  TwoColumnSection,
  SectionHeaderSecondary,
} from '../../../styling/styleUtils';
import TextBlock from '../../../components/text/TextBlock';
import {colorScheme} from '../Utils';
import DataViz, {
  VizType,
  Legend,
} from 'react-fast-charts';

export enum Region {
  World = 'World',
  Namibia = 'Namibia',
}

export enum EmploymentGroup {
  women = 'Women',
  youth = 'Youth',
  lowSkilled = 'Low-Skilled',
}

export interface BarDatum {
  employmentGroup: EmploymentGroup;
  percent: number;
  region: Region;
}

interface Props {
  barData: BarDatum[];
}

const GroupsOfInterest = ({barData}: Props) => {
  const data = barData.map(d => {
    return {
      x: d.employmentGroup,
      y: d.percent,
      fill: d.region === Region.World ? colorScheme.data : colorScheme.dataSecondary,
      groupName: d.region,
      tooltipContent: `${d.percent.toFixed(2)}% Employment`,
    };
  });
  return (
    <>
      <SectionHeaderSecondary color={colorScheme.quaternary}>Employment of groups of interest</SectionHeaderSecondary>
      <TwoColumnSection>
        <DataViz
          id={'namibia-employment-of-groups-of-interest'}
          vizType={VizType.ClusterBarChart}
          data={data}
          axisLabels={{left: '% of Employment', bottom: 'Group'}}
        />
        <TextBlock>
          <div>
            <p>The graph on the left illustrates the share of workers, based on data from the US, of the three groups of interest for Namibia: women, youth (15-24 years old), and low-skilled workers (those with below tertiary level of education). Products that employ higher shares of these groups are more likley to be attractive in Namibia given the composition and demographics of its labor market.</p>
          </div>
          <Legend
            legendList={[
              {
                label: Region.World,
                fill: colorScheme.data,
                stroke: undefined,
              },
              // {
              //   label: Region.Namibia,
              //   fill: colorScheme.dataSecondary,
              //   stroke: undefined,
              // },
            ]}
          />
        </TextBlock>
      </TwoColumnSection>
    </>
  );
};

export default GroupsOfInterest;
