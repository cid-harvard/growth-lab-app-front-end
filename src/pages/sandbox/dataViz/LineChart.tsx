import React from 'react';
import { Content } from '../../../styling/Grid';
import {
  TwoColumnSection,
  SectionHeader,
  Code,
} from '../../../styling/styleUtils';
import TextBlock from '../../../components/text/TextBlock';
import DataViz, {VizType} from '../../../components/dataViz';
import {Datum} from '../../../components/dataViz/lineChart';

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
    label: 'Evergreen Forest Growth',
    color: 'forestgreen',
    width: 3,
    tooltipContent: 'Number of trees overtime',
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
    label: 'Salmon Hatchery',
    color: 'darksalmon',
    width: 3,
    tooltipContent: 'Number of salmon overtime',
  },
];

const dataAsString = `const data: Datum[] = [
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
    color: 'forestgreen',
    width: 2,
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
    color: 'darksalmon',
    width: 2,
  },
];
`;
const codeAsString = `<DataViz
  id={'sandbox-line-chart'}
  vizType={VizType.LineChart}
  data={data}
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
            maxX: 2020,
          }}
        />
        <TextBlock>
          <Code>
            {dataAsString}
          </Code>
          <Code>
            {codeAsString}
          </Code>
        </TextBlock>
      </TwoColumnSection>
    </Content>
  );
};

export default LineChart;
