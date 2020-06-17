import * as d3 from 'd3';
import {formatNumber} from './Utils';

export interface Datum {
  [key: string]: number;
}

export interface Config {
  primaryKey: string;
  groups: {
    key: string;
    label: string;
    fill?: string;
  }[];
}

interface Dimensions {
  width: number;
  height: number;
}


interface Input {
  svg: d3.Selection<any, unknown, null, undefined>;
  tooltip: d3.Selection<any, unknown, null, undefined>;
  size: Dimensions;
  config: Config;
  data: Datum[];
  enableBrushZoom?: boolean;
}

export default (input: Input) => {
  const { svg, size, data, config, tooltip, enableBrushZoom } = input;

  const margin = {top: 30, right: 30, bottom: 30, left: 30};
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.bottom - margin.top;

  // append the svg object to the body of the page

  svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

  const g = svg.append('g')
              .attr('transform',
                'translate(' + margin.left + ',' + margin.top + ')');

  const keys = config.groups.map(({key}) => key);
  const color = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeSet2);
  const stackedData = d3.stack().keys(keys)(data);

    // set the ranges
  const xScale = d3.scaleLinear()
            .range([0, width]);
  const yScale = d3.scaleLinear()
            .range([height, 0]);

  const allYValues: number[] = [];
  stackedData.forEach(datum => {
    if (datum && datum.length) {
      datum.forEach(value => {
        allYValues.push(value[1]);
      });
    }
  });
  const allXValues: number[] = data.map(d => d[config.primaryKey]);

  const rawMinY = d3.min(allYValues);
  const rawMaxY = d3.max(allYValues);
  const rawMinX = d3.min(allXValues);
  const rawMaxX = d3.max(allXValues);

  const minY = rawMinY ? rawMinY : 0;
  const maxY = rawMaxY ? rawMaxY : 0;
  const minX = rawMinX ? rawMinX : 0;
  const maxX = rawMaxX ? rawMaxX : 0;

  // Scale the range of the data in the domains
  xScale.domain([minX, maxX]);
  yScale.domain([minY, maxY]);

  //////////
  // BRUSHING AND CHART //
  //////////

  svg.append('defs').append('svg:clipPath')
      .attr('id', 'clip')
      .append('svg:rect')
      .attr('width', width )
      .attr('height', height )
      .attr('x', 0)
      .attr('y', 0);

  // Add brushing
  const brush = d3.brushX()                 // Add the brush feature using the d3.brush function
      .extent( [ [0,0], [width,height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      .on('end', updateChart); // Each time the brush selection changes, trigger the 'updateChart' function

  // Create the scatter variable: where both the circles and the brush take place

  const areaChart = g.append('g')
    .attr('clip-path', 'url(#clip)');

  // Area generator
  const area = d3.area()
    .x((d: any) => xScale(d.data[config.primaryKey]))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]));

  // Show the areas
  areaChart
    .selectAll('mylayers')
    .data(stackedData)
    .enter()
    .append('path')
      .attr('class', function(d) { return 'myArea ' + d.key; })
      .style('fill', d => {
        const groupConfig = config.groups.find(group => group.key === d.key);
        if (groupConfig && groupConfig.fill) {
          return groupConfig.fill;
        } else {
          return color(d.key) as string;
        }
      })
      .attr('d', area as any)
      .on('mousemove', d => {
          const groupConfig = config.groups.find(group => group.key === d.key);
          if (groupConfig) {
            const fill = groupConfig.fill ? groupConfig.fill : color(d.key) as string;
            tooltip
              .style('position', 'fixed')
              .style('left', d3.event.clientX + 'px')
              .style('top', d3.event.clientY + 'px')
              .style('display', 'flex')
              .style('align-items', 'center')
              .html(`<div style="
                display: inline-block;
                background-color: ${fill};
                width: 12px;
                height: 12px;
                margin-right: 12px;
                flex-shrink: 0;
              "></div>` + groupConfig.label);
          }
        })
      .on('mouseout', () => tooltip.style('display', 'none'));

  if (enableBrushZoom) {
    // Add the brushing
    areaChart
      .append('g')
        .attr('class', 'brush')
        .call(brush);
  }

  const xAxis = g.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(xScale).ticks(5).tickFormat(y => y.toString()));
  g.append('g')
    .call(d3.axisLeft(yScale).tickFormat(formatNumber));

  let idleTimeout: number | null;
  function idled() { idleTimeout = null; }

  // A function that update the chart for given boundaries
  function updateChart() {

    const extent = d3.event.selection;

    // If no selection, back to initial coordinate. Otherwise, update X axis domain
    if(!extent){
      if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
      xScale.domain([minX, maxX]);
    }else{
      xScale.domain([ xScale.invert(extent[0]), xScale.invert(extent[1]) ]);
      areaChart.select('.brush').call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
    }

    // Update axis and area position
    xAxis.transition().duration(1000).call(d3.axisBottom(xScale).ticks(5).tickFormat(y => y.toString()));
    areaChart
      .selectAll('path')
      .transition().duration(1000)
      .attr('d', area);
    }

};
