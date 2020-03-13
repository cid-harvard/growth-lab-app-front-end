import { select } from 'd3-selection';
import { scaleOrdinal } from 'd3-scale';
import React, {useContext, useEffect, useRef} from 'react';
import styled from 'styled-components';
import { AppContext } from '../../App';
import createScatterPlot, {Datum as ScatterPlotDatum} from './scatterPlot';
import createBarChart, {Datum as BarChartDatum} from './barChart';
import SpiderChart, {
  Variable as SpiderVariables,
  Set as SpiderSet,
} from './SpiderChart';
import createRadarChart, {Datum as RadarChartDatum} from './radarChartUtil';


const Root = styled.div`
  height: 450px;
  width: 100%;

  svg {
    width: 100%;
    height: 100%;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  text-align: left;
  display: none;
  padding: 8px 12px;
  background: #fff;
  border-radius: 4px;
  color: #333;
  pointer-events: none;
  box-shadow: 0px 0px 3px -1px #b5b5b5;
  border: solid 1px gray;
  max-width: 300px;
  transform: translateY(-100%);
`;

export enum VizType {
  ScatterPlot = 'ScatterPlot',
  BarChart = 'BarChart',
  SpiderChart = 'SpiderChart',
  RadarChart = 'RadarChart',
}

interface BaseProps {
  id: string;
  vizType: VizType;
}

type Props = BaseProps & (
  {
    vizType: VizType.ScatterPlot;
    data: ScatterPlotDatum[];
    axisLabels?: {left?: string, bottom?: string};
  } |
  {
    vizType: VizType.BarChart;
    data: BarChartDatum[];
    overlayData?: BarChartDatum[];
    axisLabels?: {left?: string, bottom?: string};
  } |
  {
    vizType: VizType.SpiderChart;
    maxValue: number;
    variables: SpiderVariables[];
    sets: SpiderSet[];
    fill: string;
  } |
  {
    vizType: VizType.RadarChart;
    data: Array<RadarChartDatum[]>;
    color: {start: string, end: string};
    maxValue: number;
  }
);

const DataViz = (props: Props) => {
  const { id } = props;
  const sizingNodeRef = useRef<HTMLDivElement | null>(null);
  const svgNodeRef = useRef<any>(null);
  const tooltipNodeRef = useRef<any>(null);
  const { windowWidth } = useContext(AppContext);

  useEffect(() => {
    if (svgNodeRef && svgNodeRef.current && sizingNodeRef && sizingNodeRef.current &&
        tooltipNodeRef && tooltipNodeRef.current) {
      const sizingNode = sizingNodeRef.current;
      const svg = select(svgNodeRef.current);
      const tooltip = select(tooltipNodeRef.current);
      if (props.vizType === VizType.ScatterPlot) {
        createScatterPlot({
          svg, tooltip, data: props.data, size: {
            width: sizingNode.clientWidth, height: sizingNode.clientHeight,
          },
          axisLabels: props.axisLabels,
        });
      } else if (props.vizType === VizType.BarChart) {
        createBarChart({
          svg, tooltip, data: props.data, size: {
            width: sizingNode.clientWidth, height: sizingNode.clientHeight,
          },
          axisLabels: props.axisLabels,
          overlayData: props.overlayData,
        });
      } else if (props.vizType === VizType.RadarChart) {
        createRadarChart.draw({
          svg, tooltip, data: props.data, options: {
            width: sizingNode.clientWidth,
            height: sizingNode.clientHeight,
            color: scaleOrdinal().range([props.color.start, props.color.end]),
            maxValue: props.maxValue,
          }
        });
      }
    }
  }, [svgNodeRef, sizingNodeRef, windowWidth, props]);

  let vizOutput: React.ReactElement<any>;
  if (props.vizType === VizType.SpiderChart) {
    const StyleContainer = styled.div`
      svg {
        path {
          fill: ${props.fill};
          stroke: ${props.fill};
          ~ circle {
            fill: ${props.fill};
            stroke: ${props.fill};
          }
        }
      }
    `;
    vizOutput = (
      <SpiderChart
        maxValue={props.maxValue}
        variables={props.variables}
        sets={props.sets}
        StyleContainer={StyleContainer}
      />
    );
  } else {
    vizOutput = (
      <svg ref={svgNodeRef} key={id + windowWidth + 'svg'} />
    );
  }

  return (
    <Root ref={sizingNodeRef}>
      {vizOutput}
      <Tooltip ref={tooltipNodeRef} key={id + windowWidth + 'tooltip'} />
    </Root>
  );

};

export default DataViz;
