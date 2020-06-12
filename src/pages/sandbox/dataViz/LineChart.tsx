import React from 'react';
import { Content } from '../../../styling/Grid';
import {
  TwoColumnSection,
  SectionHeader,
  Code,
} from '../../../styling/styleUtils';
import TextBlock from '../../../components/text/TextBlock';
import DataViz, {VizType} from '../../../components/dataViz';
import {Datum, LabelPosition, LabelAnchor, AnimationDirection} from '../../../components/dataViz/lineChart';

const data: Datum[] = [
  {
    coords: [
      {x: 2005, y: 5},
      {x: 2006, y: 6},
      {x: 2007, y: 8},
      {x: 2008, y: 6},
      {x: 2009, y: 5},
      {x: 2010, y: 9},
      {x: 2011, y: 8},
      {x: 2012, y: 7},
      {x: 2013, y: 6},
      {x: 2014, y: 5},
      {x: 2015, y: 5},
      {x: 2016, y: 8},
    ],
    animationDuration: 0,
    label: 'Evergreen Forest Growth',
    color: 'forestgreen',
    labelColor: 'purple',
    width: 3,
    tooltipContent: 'Number of trees overtime',
    labelPosition: LabelPosition.Top,
    labelAnchor: LabelAnchor.Middle,
  }, {
    coords: [
      {x: 2005, y: 2},
      {x: 2006, y: 4},
      {x: 2007, y: 5},
      {x: 2008, y: 3},
      {x: 2009, y: 6},
      {x: 2010, y: 5},
      {x: 2011, y: 4},
      {x: 2012, y: 3},
      {x: 2013, y: 3},
      {x: 2014, y: 4},
      {x: 2015, y: 6},
      {x: 2016, y: 7},
    ],
    animationDuration: 1000,
    label: 'Salmon Hatchery',
    color: 'darksalmon',
    labelColor: 'purple',
    width: 3,
    tooltipContent: 'Number of salmon overtime',
    labelPosition: LabelPosition.Center,
    labelAnchor: LabelAnchor.Left,
  }, {
    coords: [
      {x: 2005, y: 7},
      {x: 2006, y: 8},
      {x: 2007, y: 9},
      {x: 2008, y: 11},
      {x: 2009, y: 9},
      {x: 2010, y: 8},
      {x: 2011, y: 7},
      {x: 2012, y: 7},
      {x: 2013, y: 6},
      {x: 2014, y: 15},
      {x: 2015, y: 6},
      {x: 2016, y: 7},
    ],
    animationDuration: 500,
    animationStartPercentAsDecimal: 0.3,
    label: 'Salmon Hatchery',
    showLabelLine: true,
    labelDataIndex: 9,
    color: 'aqua',
    labelColor: 'purple',
    width: 3,
    tooltipContent: 'Number of salmon overtime',
    labelPosition: LabelPosition.Top,
    labelAnchor: LabelAnchor.Right,
    animationDirection: AnimationDirection.Backward,
  },
];

const codeAsString = `<DataViz
  id={'sandbox-line-chart'}
  vizType={VizType.LineChart}
  data={data}
  axisLabels={{left: 'Value', bottom: 'Year'}}
  axisMinMax={{
    minY: -10,
    maxY: 20,
    maxX: 2021,
  }}
/>
`;

const LineChart = () => {
  return (
    <Content>
      <TwoColumnSection>
        <SectionHeader>Line Chart</SectionHeader>
        <DataViz
          id={'sandbox-line-chart'}
          vizType={VizType.LineChart}
          data={data}
          axisLabels={{left: 'Value', bottom: 'Year'}}
          axisMinMax={{
            minY: -10,
            maxY: 20,
            maxX: 2021,
          }}
        />
        <TextBlock>
          <Code>
            {codeAsString}
          </Code>
        </TextBlock>
      </TwoColumnSection>
    </Content>
  );
};

export default LineChart;
