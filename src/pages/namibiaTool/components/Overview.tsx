import React from 'react';
import {
  TwoColumnSection,
  SectionHeader,
  SubSectionHeader,
} from '../../../styling/styleUtils';
import DataViz, {
  VizType,
  HowToReadDots,
  ScatterPlotDatum,
} from 'react-fast-charts';
import TextBlock from '../../../components/text/TextBlock';
import {
  colorScheme,
} from '../Utils';
import {rgba} from 'polished';
import {extent} from 'd3-array';
import {Factor} from '../graphql/graphQLTypes';

interface Props {
  industryName: string;
  data: ScatterPlotDatum[];
  jsonData: object[];
  factors: Factor;
}

const Overview = (props: Props) => {
  const {
    industryName, data, jsonData,
  } = props;

  const allFeasibility: number[] = [];
  const allAttractiveness: number[] = [];
  data.forEach(d => {
    allFeasibility.push(d.x);
    allAttractiveness.push(d.y);
  });

  const [minFeasibility, maxFeasibility] = extent(allFeasibility) as [number, number];
  const [minAttractiveness, maxAttractiveness] = extent(allAttractiveness) as [number, number];

  return (
    <>
    <div id={'overview'}>
      <SectionHeader>{'Overview'}</SectionHeader>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    </div>
    <TwoColumnSection>
      <DataViz
        id={'namibia-scatterplot'}
        vizType={VizType.ScatterPlot}
        data={data}
        axisLabels={{x: 'Feasibility', y: 'Attractiveness'}}
        axisMinMax={{
          minX: minFeasibility,
          maxX: maxFeasibility,
          minY: minAttractiveness,
          maxY: maxAttractiveness,
        }}
        enablePNGDownload={true}
        enableSVGDownload={true}
        chartTitle={'Overview - ' + industryName.substring(0,100)}
        jsonToDownload={jsonData}
      />
      <TextBlock>
        <SubSectionHeader color={colorScheme.quaternary}>How Strategic is the Industry?</SubSectionHeader>
        <div>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        </div>
        <HowToReadDots
          items={[
            {color: rgba(colorScheme.data, 0.5), label: 'Intensively present in Namibia'},
          ]}
          highlighted={{color: rgba(colorScheme.data, 0.5), label: industryName}}
        />
      </TextBlock>
    </TwoColumnSection>
    </>
  );
};

export default Overview;
