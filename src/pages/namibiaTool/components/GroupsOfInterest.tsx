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
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
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
