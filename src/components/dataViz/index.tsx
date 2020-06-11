import { select } from 'd3-selection';
import { scaleOrdinal } from 'd3-scale';
import { ExtendedFeature } from 'd3';
import React, {useContext, useEffect, useRef} from 'react';
import styled from 'styled-components/macro';
import { AppContext } from '../../App';
import createScatterPlot, {Datum as ScatterPlotDatum} from './scatterPlot';
import createBarChart, {Datum as BarChartDatum} from './barChart';
import createClusterBarChart, {Datum as ClusterBarChartDatum} from './clusterBarChart';
import createRadarChart, {Datum as RadarChartDatum} from './radarChart';
import createGeoMap, {GeoJsonCustomProperties} from './geoMap';
import creatLineChart, {Datum as LineChartDatum} from './lineChart';
import {
  baseColor,
  secondaryFont,
  tertiaryColor,
} from '../../styling/styleUtils';
import {darken} from 'polished';
import downloadImage, { FileFormat } from './downloadImage';
import { CSVLink } from 'react-csv';
import DownloadSVGURL from './assets/download.svg';
import DataSVGURL from './assets/data.svg';
import {triggerGoogleAnalyticsEvent} from '../../routing/tracking';

const Root = styled.div`
  width: 100%;
  margin: auto;
`;

const SizingElm = styled.div`
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
  z-index: 1000;
`;

const DownloadButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const downloadButtonStyles = `
  background-color: #ecf0f2;
  font-family: ${secondaryFont};
  padding: 0.5rem 0.75rem;
  font-size: 0.6875rem;
  color: ${baseColor};
  display: flex;
  align-items: center;
  margin: 0;

  &:hover {
    background-color: ${darken(0.04, '#ecf0f2')};
  }
`;

const DownloadImageButton = styled.button`
  ${downloadButtonStyles};
`;
const DownloadDataButton = styled(CSVLink)`
  ${downloadButtonStyles};
  text-decoration: none;
`;

const SvgIcon = styled.img`
  width: 0.9rem;
  margin-right: 0.3rem;
`;

const ErrorMessage = styled.p`
  width: 100%;
  min-height: 400px;
  background-color: ${tertiaryColor};
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export enum VizType {
  ScatterPlot = 'ScatterPlot',
  BarChart = 'BarChart',
  ClusterBarChart = 'ClusterBarChart',
  RadarChart = 'RadarChart',
  GeoMap = 'GeoMap',
  LineChart = 'LineChart',
  Error = 'Error',
}

interface BaseProps {
  id: string;
  vizType: VizType;
  jsonToDownload?: object[];
  enablePNGDownload?: boolean;
  enableSVGDownload?: boolean;
  chartTitle?: string;
}

type Props = BaseProps & (
  {
    vizType: VizType.Error;
    message: string;
  } | {
    vizType: VizType.ScatterPlot;
    data: ScatterPlotDatum[];
    axisLabels?: {left?: string, bottom?: string};
    axisMinMax?: {
      minX?: number,
      maxX?: number,
      minY?: number,
      maxY?: number,
    };
    showAverageLines?: boolean;
    averageLineText?: {left?: string, bottom?: string};
    quadrantLabels?: {I?: string, II?: string, III?: string, IV?: string};
  } |
  {
    vizType: VizType.BarChart;
    data: BarChartDatum[][];
    axisLabels?: {left?: string, bottom?: string};
  } |
  {
    vizType: VizType.ClusterBarChart;
    data: ClusterBarChartDatum[];
    axisLabels?: {left?: string, bottom?: string};
  } |
  {
    vizType: VizType.RadarChart;
    data: RadarChartDatum[][];
    color: {start: string, end: string};
    maxValue: number;
  } |
  {
    vizType: VizType.GeoMap;
    data: ExtendedFeature<any, GeoJsonCustomProperties>;
    minColor: string;
    maxColor: string;
  }|
  {
    vizType: VizType.LineChart;
    data: LineChartDatum[];
  }
);

const DataViz = (props: Props) => {
  const { id, enablePNGDownload, enableSVGDownload, jsonToDownload } = props;
  const sizingNodeRef = useRef<HTMLDivElement | null>(null);
  const svgNodeRef = useRef<any>(null);
  const tooltipNodeRef = useRef<any>(null);
  const { windowWidth } = useContext(AppContext);

  useEffect(() => {
    let svgNode: HTMLDivElement | null = null;
    if (svgNodeRef && svgNodeRef.current && sizingNodeRef && sizingNodeRef.current &&
        tooltipNodeRef && tooltipNodeRef.current) {
      const sizingNode = sizingNodeRef.current;
      svgNode = svgNodeRef.current;
      const svg = select(svgNode);
      const tooltip = select(tooltipNodeRef.current);
      if (props.vizType === VizType.ScatterPlot) {
        createScatterPlot({
          svg, tooltip, data: props.data, size: {
            width: sizingNode.clientWidth, height: sizingNode.clientHeight,
          },
          axisLabels: props.axisLabels,
          axisMinMax: props.axisMinMax,
          showAverageLines: props.showAverageLines,
          averageLineText: props.averageLineText,
          quadrantLabels: props.quadrantLabels,
        });
      } else if (props.vizType === VizType.BarChart) {
        createBarChart({
          svg, tooltip, data: props.data, size: {
            width: sizingNode.clientWidth, height: sizingNode.clientHeight,
          },
          axisLabels: props.axisLabels,
        });
      } else if (props.vizType === VizType.RadarChart) {
        let width: number;
        let height: number;
        if (sizingNode.clientWidth > sizingNode.clientHeight) {
          width = sizingNode.clientHeight;
          height = sizingNode.clientHeight;
        } else {
          width = sizingNode.clientWidth;
          height = sizingNode.clientWidth;
        }
        createRadarChart({
          svg, tooltip, data: props.data, options: {
            width, height,
            color: scaleOrdinal().range([props.color.start, props.color.end]),
            maxValue: props.maxValue,
          },
        });
      } else if (props.vizType === VizType.GeoMap) {
        createGeoMap({
          svg, tooltip, data: props.data, size: {
            width: sizingNode.clientWidth, height: sizingNode.clientHeight,
          }, minColor: props.minColor, maxColor: props.maxColor,
        });
      } else if (props.vizType === VizType.ClusterBarChart) {
        createClusterBarChart({
          svg, tooltip, data: props.data, size: {
            width: sizingNode.clientWidth, height: sizingNode.clientHeight,
          },
          axisLabels: props.axisLabels,
        });
      } else if (props.vizType === VizType.LineChart) {
        creatLineChart({
          svg, tooltip, data: props.data, size: {
            width: sizingNode.clientWidth, height: sizingNode.clientHeight,
          },
        });
      }
    }
    return () => {
      if (svgNode) {
        svgNode.innerHTML = '';
      }
    };
  }, [svgNodeRef, sizingNodeRef, windowWidth, props]);

  const handleDownloadImage = (fileFormat: FileFormat) => {
    const svgNode = svgNodeRef ? svgNodeRef.current : null;
    const sizingNode = sizingNodeRef ? sizingNodeRef.current : null;
    const highResMultiplier = 3;
    let width: number | undefined;
    let height: number | undefined;
    if (props.vizType === VizType.RadarChart && sizingNode) {
      if (sizingNode.clientWidth > sizingNode.clientHeight) {
        width = sizingNode.clientHeight * highResMultiplier;
        height = sizingNode.clientHeight * highResMultiplier;
      } else {
        width = sizingNode.clientWidth * highResMultiplier;
        height = sizingNode.clientWidth * highResMultiplier;
      }
    } else {
      width = sizingNode && sizingNode.clientWidth ? sizingNode.clientWidth * highResMultiplier : undefined;
      height = sizingNode && sizingNode.clientHeight ? sizingNode.clientHeight * highResMultiplier : undefined;
    }
    const title = props.chartTitle ? props.chartTitle : 'chart';
    downloadImage({svg: svgNode, width, height, title, fileFormat});
    triggerGoogleAnalyticsEvent(id, 'download-' + fileFormat, title);
  };

  const downloadPNGButton = enablePNGDownload !== true ? null : (
    <>
      <DownloadImageButton
        onClick={() => handleDownloadImage(FileFormat.PNG)}
      >
        <SvgIcon src={DownloadSVGURL} alt={'Download PNG'} />
        Download PNG
      </DownloadImageButton>
    </>
  );
  const downloadSVGButton = enableSVGDownload !== true ? null : (
    <>
      <DownloadImageButton
        onClick={() => handleDownloadImage(FileFormat.SVG)}
      >
        <SvgIcon src={DownloadSVGURL} alt={'Download SVG'} />
        Download SVG
      </DownloadImageButton>
    </>
  );
  let downloadDataButton: React.ReactElement<any> | null;
  if (jsonToDownload !== undefined) {
    const filename = props.chartTitle ? props.chartTitle + '.csv' : 'data.csv';
    const onClick = () => {
      triggerGoogleAnalyticsEvent(id, 'download-csv', props.chartTitle);
    };
    downloadDataButton = (
      <DownloadDataButton
        data={jsonToDownload}
        filename={filename}
        onClick={onClick}
      >
        <SvgIcon src={DataSVGURL} alt={'Download Data'} />
        Download Data
      </DownloadDataButton>
    );
  } else {
    downloadDataButton = null;
  }

  const downloadButtons = downloadPNGButton !== null || downloadSVGButton !== null || downloadDataButton !== null ? (
    <DownloadButtonsContainer style={{marginTop: props.vizType !== VizType.RadarChart ? '1rem' : undefined}}>
      {downloadPNGButton}
      {downloadSVGButton}
      {downloadDataButton}
    </DownloadButtonsContainer>
  ) : null;

  if (props.vizType === VizType.Error) {
    return (
      <Root>
        <ErrorMessage>
          {props.message}
        </ErrorMessage>
      </Root>
    );
  } else {
    return (
      <Root>
        <SizingElm ref={sizingNodeRef}>
          <svg ref={svgNodeRef} key={id + windowWidth + 'svg'} />
        </SizingElm>
        {downloadButtons}
        <Tooltip ref={tooltipNodeRef} key={id + windowWidth + 'tooltip'} />
      </Root>
    );
  }
};

export default DataViz;
