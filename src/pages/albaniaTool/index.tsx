import React from 'react';
import { Header, Content, Footer } from '../../styling/Grid';
import { TwoColumnContainer } from '../../styling/styleUtils';
import StickySideNav from '../../components/navigation/StickySideNav';
import DataViz, {VizType} from '../../components/dataViz';
import TextBlock from '../../components/text/TextBlock';
import { Datum as ScatterPlotDatum } from '../../components/dataViz/scatterPlot';

const scatterPlotData: ScatterPlotDatum[] = [
  {
    label: 'Boston',
    x: 7,
    y: 4,
    tooltipContent: 'Tooltip Content',
    fill: 'red',
  },
  {
    label: 'Cambridge',
    x: 5,
    y: 8,
    tooltipContent: 'Tooltip Content about Cambridge MA where we work right now test long content length',
    radius: 10,
  },
  {
    label: 'Somerville',
    x: 2,
    y: 11,
    tooltipContent: 'Tooltip Content',
    fill: 'blue',
    radius: 5,
  },
  {
    label: 'Acton',
    x: 6,
    y: 3,
    tooltipContent: 'Tooltip Content',
  },
  {
    label: 'Stow',
    x: 10,
    y: 4,
    tooltipContent: 'Tooltip Content',
    radius: 6,
  },
];

const AlbaniaTool = () => {
  return (
    <>
      <Header>
        <h1>AlbaniaTool</h1>
      </Header>
      <Content>
        <TwoColumnContainer>
          <DataViz
            id={'albania-scatterplot'}
            vizType={VizType.ScatterPlot}
            data={scatterPlotData}
          />
          <TextBlock
            children={'Albania Scatter Plot Text Content'}
          />
        </TwoColumnContainer>
      </Content>
      <StickySideNav />
      <Footer>
        Footer
      </Footer>
    </>
  );
};

export default AlbaniaTool;