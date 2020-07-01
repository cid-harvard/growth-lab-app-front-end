import * as d3 from 'd3';
import {formatNumber} from './Utils';

export interface Datum {
  x: string;
  y: number;
  fill?: string;
  stroke?: string;
  tooltipContent?: string;
  tooltipContentOnly?: boolean;
  onClick?: () => void;
}

interface Dimensions {
  width: number;
  height: number;
}

export enum LabelPlacement {
  left = 'left',
  right = 'right',
}

interface Input {
  svg: d3.Selection<any, unknown, null, undefined>;
  tooltip: d3.Selection<any, unknown, null, undefined>;
  data: Datum[][];
  size: Dimensions;
  axisLabels?: {left?: string, bottom?: string};
  axisMinMax?: {
    minY?: number,
    maxY?: number,
  };
  hideAxis?: {
    left?: boolean;
    bottom?: boolean;
  };
  averageLines?: {
    value: number,
    label?: string;
    labelPlacement?: LabelPlacement;
    strokeWidth?: number;
    strokeDasharray?: number;
    strokeColor?: string;
  }[];
  labelFont?: string;
}

export default (input: Input) => {
  const {
    svg, data, size, axisLabels, tooltip, axisMinMax, hideAxis,
    averageLines, labelFont,
  } = input;

  const margin = {
    top: 30, right: 30,
    bottom: axisLabels && axisLabels.bottom ? 60 : 30,
    left: 35};
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.bottom - margin.top;

    // set the ranges
  const xScale = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
  const yScale = d3.scaleLinear()
            .range([height, 0]);

  // append the svg object to the body of the page
  // append a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

  const container = svg
    .append('g')
      .attr('transform',
            'translate(' + margin.left + ',' + margin.top + ')');
  const allYValues: number[] = [];
  data.forEach(datum => datum.forEach(({y}) => allYValues.push(y)));

  const minScaleBuffer = 0.9;
  const maxScaleBuffer = 1.1;

  let minY: number;
  let maxY: number;

  if (axisMinMax !== undefined && axisMinMax.minY !== undefined) {
    minY = axisMinMax.minY;
  } else {
    const rawMinY = d3.min(allYValues);
    minY = rawMinY ? Math.floor(rawMinY * minScaleBuffer) : 0;
  }

  if (axisMinMax !== undefined && axisMinMax.maxY !== undefined) {
    maxY = axisMinMax.maxY;
  } else {
    const rawMaxY = d3.max(allYValues);
    maxY = rawMaxY ? Math.floor(rawMaxY * maxScaleBuffer) : 0;
  }

  // Scale the range of the data in the domains
  xScale.domain(data && data.length ? data[0].map(function(d) { return d.x; }) : [])
        .rangeRound([0, width])
        .paddingInner(0.2);
  yScale.domain([minY, maxY]);

  // append the rectangles for the bar chart
  data.forEach((dataset, i) => {
    container.selectAll('.bar-' + i)
        .data(dataset)
      .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', function(d) {
          const xVal = xScale(d.x);
          return xVal ? xVal : 0;
        })
        .attr('width', xScale.bandwidth())
        .attr('y', function(d) { return yScale(d.y); })
        .style('fill', ({fill}) => fill ? fill : '#69b3a2')
        .style('stroke', ({stroke}) => stroke ? stroke : 'none')
        .style('stroke-width', 3)
        .attr('height', function(d) { return height - yScale(d.y); })
        .on('mousemove', ({x, tooltipContent, tooltipContentOnly}) => {
          if (tooltipContentOnly && tooltipContent && tooltipContent.length) {
            tooltip.html(tooltipContent);
          } else {
            const content = tooltipContent === undefined || tooltipContent.length === 0
              ? '' : `:<br />${tooltipContent}`;
            tooltip.html(`<strong>${x}</strong>${content}`);
          }
          tooltip
            .style('display', 'block')
            .style('position', 'fixed')
            .style('left', d3.event.clientX + 'px')
            .style('top', d3.event.clientY + 'px');
          })
        .on('mouseout', () => {
          tooltip
              .style('display', 'none');
        });
  });

  // append X axis label
  if (!(hideAxis && hideAxis.bottom)) {
    // add the x Axis
    container.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .style('font-family', labelFont ? labelFont : "'Source Sans Pro',sans-serif")
        .call(d3.axisBottom(xScale));
    svg
      .append('text')
      .attr('transform', `translate(${width / 2 + margin.left}, ${height + margin.bottom + (margin.top / 2)})`)
        .style('font-family', labelFont ? labelFont : "'Source Sans Pro',sans-serif")
        .style('font-size', '0.8rem')
        .style('text-anchor', 'middle')
        .text(axisLabels && axisLabels.bottom ? axisLabels.bottom : '');
  }
  if (!(hideAxis && hideAxis.left)) {
      // add the y Axis
    container.append('g')
      .style('font-family', labelFont ? labelFont : "'Source Sans Pro',sans-serif")
      .call(d3.axisLeft(yScale).tickFormat(formatNumber));
    // append Y axis label
    svg
      .append('text')
        .attr('y', margin.top / 2)
        .attr('x', margin.right)
        .attr('dy', '0.75em')
        .style('font-size', '0.8rem')
        .style('font-family', labelFont ? labelFont : "'Source Sans Pro',sans-serif")
        .text(axisLabels && axisLabels.left ? axisLabels.left : '');
  }

  if (averageLines && averageLines.length) {
    averageLines.forEach(line => {
      svg
       .append('line')
      .attr('x1',margin.left)
      .attr('x2',size.width - margin.right)
      .attr('y1', yScale(line.value) + 0.5)
      .attr('y2', yScale(line.value) + 0.5)
      .attr('stroke-width', line.strokeWidth ? line.strokeWidth : '1px')
      .attr('stroke', line.strokeColor ? line.strokeColor : '#333')
      .attr('stroke-dasharray', line.strokeDasharray ? line.strokeDasharray : 0)
      .style('pointer-events', 'none');

      if (line.label) {

        svg.append('text')
          .attr('x', line.labelPlacement === LabelPlacement.right ? size.width - margin.right : margin.left + 8)
          .attr('y',yScale(line.value) - 4)
          .style('text-anchor', line.labelPlacement === LabelPlacement.right ? 'end' : 'start')
          .style('opacity', 0.8)
          .style('font-family', labelFont ? labelFont : "'Source Sans Pro',sans-serif")
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .text(line.label);
      }
    });
  }

};
