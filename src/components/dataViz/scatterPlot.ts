import * as d3 from 'd3';

export interface Datum {
  label: string;
  x: number;
  y: number;
  fill?: string;
  radius?: number;
  tooltipContent?: string;
  tooltipContentOnly?: boolean;
  onClick?: () => void;
  highlighted?: boolean;
}

interface Dimensions {
  width: number;
  height: number;
}

interface Input {
  svg: d3.Selection<any, unknown, null, undefined>;
  tooltip: d3.Selection<any, unknown, null, undefined>;
  data: Datum[];
  size: Dimensions;
  axisLabels?: {left?: string, bottom?: string};
  axisMinMax?: {
    minX?: number,
    maxX?: number,
    minY?: number,
    maxY?: number,
  };
}

export default (input: Input) => {
  const { svg, tooltip, data, size, axisLabels, axisMinMax } = input;

  const margin = {top: 30, right: 30, bottom: 60, left: 60};
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.bottom - margin.top;

  // append the svg object to the body of the page
  svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

  const container = svg
    .append('g')
      .attr('transform',
            'translate(' + margin.left + ',' + margin.top + ')');

  const allXValues = data.map(({x}) => x);
  const allYValues = data.map(({y}) => y);

  const rawMinX = axisMinMax && axisMinMax.minX !== undefined ? axisMinMax.minX : d3.min(allXValues);
  const rawMaxX = axisMinMax && axisMinMax.maxX !== undefined ? axisMinMax.maxX : d3.max(allXValues);
  const rawMinY = axisMinMax && axisMinMax.minY !== undefined ? axisMinMax.minY : d3.min(allYValues);
  const rawMaxY = axisMinMax && axisMinMax.maxY !== undefined ? axisMinMax.maxY : d3.max(allYValues);

  const minScaleBuffer = axisMinMax ? 1 : 0.9;
  const maxScaleBuffer = axisMinMax ? 1 : 1.1;

  const minX = rawMinX ? Math.floor(rawMinX * minScaleBuffer) : 0;
  const maxX = rawMaxX ? Math.floor(rawMaxX * maxScaleBuffer) : 0;
  const minY = rawMinY ? Math.floor(rawMinY * minScaleBuffer) : 0;
  const maxY = rawMaxY ? Math.floor(rawMaxY * maxScaleBuffer) : 0;



  // Add X axis
  const xScale = d3.scaleLinear()
    .domain([minX, maxX])
    .range([ 0, width ]);

  container.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(xScale));

  // Add Y axis
  const yScale = d3.scaleLinear()
    .domain([minY, maxY])
    .range([ height, 0]);
  container.append('g')
    .call(d3.axisLeft(yScale));

  // gridlines in x axis function
  const makeGridlinesX: any = () => d3.axisBottom(xScale).ticks(10);

  // gridlines in y axis function
  const makeGridlinesY: any = () => d3.axisLeft(yScale).ticks(10);

  // add the X gridlines
  container.append('g')
      .attr('class', 'grid')
      .attr('transform', 'translate(0,' + height + ')')
      .style('opacity', '0.25')
      .style('stroke-dasharray', '3 1')
      .call(makeGridlinesX()
          .tickSize(-height)
          .tickFormat(''),
      );

  // add the Y gridlines
  container.append('g')
      .attr('class', 'grid')
      .style('opacity', '0.25')
      .style('stroke-dasharray', '3 1')
      .call(makeGridlinesY()
          .tickSize(-width)
          .tickFormat(''),
      );

  // Add dots
  container.append('g')
    .selectAll('dot')
    .data(data)
    .enter()
    .append('circle')
      .attr('cx', ({x}) => xScale(x))
      .attr('cy', ({y}) => yScale(y))
      .attr('r', ({radius}) => radius ? radius : 4)
      .style('fill', ({fill}) => fill ? fill : '#69b3a2')
      .on('mousemove', ({label, tooltipContent, tooltipContentOnly}) => {
        if (tooltipContentOnly && tooltipContent && tooltipContent.length) {
          tooltip.html(tooltipContent);
        } else {
          const content = tooltipContent === undefined || tooltipContent.length === 0
            ? '' : `:<br />${tooltipContent}`;
          tooltip.html(`<strong>${label}</strong>${content}`);

        }
        tooltip
          .style('display', 'block')
          .style('left', (d3.event.pageX + 4) + 'px')
          .style('top', (d3.event.pageY - 4) + 'px');
        })
      .on('mouseout', () => {
        tooltip
            .style('display', 'none');
      });

  const highlighted = data.find(d => d.highlighted);
  if (highlighted) {
    // Add highlighted dot background
    container.append('g')
      .selectAll('dot')
      .data([highlighted])
      .enter()
      .append('circle')
        .attr('cx', ({x}) => xScale(x))
        .attr('cy', ({y}) => yScale(y))
        .attr('r', 16)
        .style('fill', ({fill}) => fill ? fill : '#69b3a2')
        .style('opacity', '0.4')
        .style('pointer-events', 'none');
    // Add highlighted dot over to top
    container.append('g')
      .selectAll('dot')
      .data([highlighted])
      .enter()
      .append('circle')
        .attr('cx', ({x}) => xScale(x))
        .attr('cy', ({y}) => yScale(y))
        .attr('r', ({radius}) => radius ? radius : 4)
        .style('fill', ({fill}) => fill ? fill : '#69b3a2')
        .style('pointer-events', 'none');
  }


  // append X axis label
  svg
    .append('text')
    .attr('transform', `translate(${width / 2 + margin.left}, ${height + margin.bottom + (margin.top / 2)})`)
      .style('text-anchor', 'middle')
      .style('font-family', "'Source Sans Pro',sans-serif")
      .text(axisLabels && axisLabels.bottom ? axisLabels.bottom : '');

  // append Y axis label
  svg
    .append('text')
    .attr('transform', 'rotate(-90)')
      .attr('y', margin.right / 2)
      .attr('x', 0 - (height / 2 + margin.top))
      .attr('dy', '0.75em')
      .style('text-anchor', 'middle')
      .style('font-family', "'Source Sans Pro',sans-serif")
      .text(axisLabels && axisLabels.left ? axisLabels.left : '');

};
