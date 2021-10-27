import React from 'react';
import {
  TwoColumnSection,
  SectionHeaderSecondary,
  lightBorderColor,
} from '../../../styling/styleUtils';
import TextBlock from '../../../components/text/TextBlock';
import {
  colorScheme,
  ProductClass,
  useProductClass,
} from '../Utils';
import DataViz, {
  VizType,
  Legend,
} from 'react-fast-charts';

export enum Region {
  World = 'International Benchmark',
  Average = 'International Benchmark Average',
}

export enum EmploymentGroup {
  women = 'Women',
  youth = 'Youth',
  lowSkilled = 'Low-Skilled',
}

export interface BarDatum {
  employmentGroup: EmploymentGroup;
  percent: number;
}

interface Props {
  worldData: BarDatum[];
  averageData: BarDatum[];
}

const GroupsOfInterest = ({worldData, averageData}: Props) => {
  const data = [
    averageData.map(d => {
      const targetWorld = worldData.find(dd => dd.employmentGroup === d.employmentGroup);
      return {
        x: d.employmentGroup,
        y: d.percent,
        fill: lightBorderColor,
        tooltipContent: `
          <small>
            <strong>International Benchmark</strong>: ${targetWorld ? targetWorld.percent.toFixed(2) : 0}%<br />
            <strong>International Benchmark Average</strong>: ${d.percent.toFixed(2)}%<br />
          </small>
        `,
      };
    }),
    worldData.map(d => {
      const targetWorldAvg = averageData.find(dd => dd.employmentGroup === d.employmentGroup);
      return {
        x: d.employmentGroup,
        y: d.percent,
        fill: 'rgba(0, 0, 0, 0)',
        stroke: colorScheme.quaternary,
        tooltipContent: `
        <small>
          <strong>International Benchmark</strong>: ${d.percent.toFixed(2)}%<br />
          <strong>International Benchmark Average</strong>: ${targetWorldAvg ? targetWorldAvg.percent.toFixed(2) : 0}%<br />
        </small>
        `,
      };
    }),
  ];
  const productClass = useProductClass();
  const productOrIndustry = productClass === ProductClass.HS ? 'product' : 'industry';
  const productOrIndustryPlural = productClass === ProductClass.HS ? 'Products' : 'Industries';
  return (
    <>
      <SectionHeaderSecondary color={colorScheme.quaternary}>Employment of groups of interest</SectionHeaderSecondary>
      <TwoColumnSection>
        <DataViz
          id={'namibia-employment-of-groups-of-interest'}
          vizType={VizType.BarChart}
          data={data}
          axisLabels={{left: '% of Employment', bottom: 'Group'}}
        />
        <TextBlock>
          <div>
            <p>The graph on the left illustrates the share of workers, based on data from the US, of the three groups of interest for Namibia: women, youth (15-24 years old), and low-skilled workers (those with below tertiary level of education). The graph displays the share of workers employed in each category in the {productOrIndustry} chosen, based on the U.S. as an international benchmark. {productOrIndustryPlural} that employ higher shares of these groups are more likely to be attractive in Namibia given the composition and demographics of its labor market. For reference, the graph also shows the average share of workers employed in each category at an aggregate level.</p>
          </div>
          <Legend
            legendList={[
              {
                label: Region.World,
                fill: undefined,
                stroke: colorScheme.quaternary,
              },
              {
                label: Region.Average,
                fill: lightBorderColor,
                stroke: undefined,
              },
            ]}
          />
        </TextBlock>
      </TwoColumnSection>
    </>
  );
};

export default GroupsOfInterest;
