import * as d3 from 'd3';

interface Coords {
  x: number;
  y: number;
}

export interface Datum {
  coords: Coords[];
  label?: string;
  color?: string;
  width?: number;
  tooltipContent?: string;
}

interface Dimensions {
  width: number;
  height: number;
}

const ranges = [
  { divider: 1e18 , suffix: 'E' },
  { divider: 1e15 , suffix: 'P' },
  { divider: 1e12 , suffix: 'T' },
  { divider: 1e9 , suffix: 'B' },
  { divider: 1e6 , suffix: 'M' },
  { divider: 1e3 , suffix: 'k' },
];

const formatNumber = (n: number) => {
  for (const range of ranges) {
    if (n >= range.divider) {
      return (n / range.divider).toString() + range.suffix + ' ft';
    }
  }
  return n.toString();
};

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
  const {
    svg, data, size, axisLabels, tooltip, axisMinMax,
  } = input;

  const margin = {top: 30, right: 30, bottom: 30, left: 35};
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.bottom - margin.top;

  // set the ranges
  const x = d3.scaleLinear().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  // define the line
  const valueline: any = d3.line()
    .x(function(d: any) { return x(d.x); })
    .y(function(d: any) { return y(d.y); });

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  svg
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  const g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const allXValues: number[] = [];
  const allYValues: number[] = [];
  data.forEach(line => line.coords.forEach((coord) => {
    allXValues.push(coord.x);
    allYValues.push(coord.y);
  }));

  const rawMinX = axisMinMax && axisMinMax.minX !== undefined ? axisMinMax.minX : d3.min(allXValues);
  const rawMaxX = axisMinMax && axisMinMax.maxX !== undefined ? axisMinMax.maxX : d3.max(allXValues);
  const rawMinY = axisMinMax && axisMinMax.minY !== undefined ? axisMinMax.minY : d3.min(allYValues);
  const rawMaxY = axisMinMax && axisMinMax.maxY !== undefined ? axisMinMax.maxY : d3.max(allYValues);

  const minX = rawMinX ? Math.floor(rawMinX) : 0;
  const maxX = rawMaxX ? Math.ceil(rawMaxX) : 0;
  const minY = rawMinY ? Math.floor(rawMinY) : 0;
  const maxY = rawMaxY ? Math.ceil(rawMaxY) : 0;

  // Scale the range of the data
  x.domain([minX, maxX]);
  y.domain([minY, maxY]);

  // Add the valueline path.
  g.selectAll('.paths')
      .data(data)
      .enter()
        .append('path')
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', ({color}) => color ? color : 'gray')
        .attr('stroke-width', (line) => line.width ? line.width : 1.5)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('d', d => valueline(d.coords))
        .attr('transform', 'translate(' + margin.left + ', 0)')
        .on('mousemove', ({tooltipContent}) => {
          if (tooltipContent && tooltipContent.length) {
            tooltip.html(tooltipContent);
            tooltip
              .style('display', 'block')
              .style('left', (d3.event.pageX + 4) + 'px')
              .style('top', (d3.event.pageY - 4) + 'px');
          }
        })
        .on('mouseout', () => {
          tooltip
              .style('display', 'none');
        });

  // Add the labels
  g.selectAll('.labels')
      .data(data)
      .enter()
        .append('text')
        .attr('transform', 'translate(40 2)')
        .attr('class', 'line-label')
        .attr('fill', ({color}) => color ? color : 'gray')
        .attr('font-size', '0.7rem')
        .attr('y', ({coords}) => y(coords[coords.length - 1].y))
        .attr('x', ({coords}) => x(coords[coords.length - 1].x))
        .style('font-family', "'Source Sans Pro',sans-serif")
        .text(({label}) => label ? label : '');

  // Add the x Axis
  g.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + height + ')')
      .call(d3.axisBottom(x));

  // Add the y Axis
  g.append('g')
      .call(d3.axisLeft(y).tickFormat(formatNumber))
      .attr('transform', 'translate(' + margin.left + ', 0)');

  // gridlines in x axis function
  const makeGridlinesX: any = () => d3.axisBottom(x).ticks(10);

  // gridlines in y axis function
  const makeGridlinesY: any = () => d3.axisLeft(y).ticks(10);

  // add the X gridlines
  g.append('g')
      .attr('class', 'grid')
      .attr('transform', 'translate(' + margin.left + ',' + height + ')')
      .style('opacity', '0.25')
      .style('stroke-dasharray', '3 1')
      .call(makeGridlinesX()
          .tickSize(-height)
          .tickFormat(''),
      );

  // add the Y gridlines
  g.append('g')
      .attr('class', 'grid')
      .attr('transform', 'translate(' + margin.left + ', 0)')
      .style('opacity', '0.25')
      .style('stroke-dasharray', '3 1')
      .call(makeGridlinesY()
          .tickSize(-width)
          .tickFormat(''),
      );

  // append X axis label
  svg
    .append('text')
    .attr('transform', `translate(${width / 2 + margin.left}, ${height + margin.bottom + margin.top})`)
      .style('text-anchor', 'middle')
      .style('font-family', "'Source Sans Pro',sans-serif")
      .text(axisLabels && axisLabels.bottom ? axisLabels.bottom : '');

  // append Y axis label
  svg
    .append('text')
    .attr('transform', 'rotate(-90)')
      .attr('y', 0)
      .attr('x', 0 - (height / 2 + margin.top))
      .attr('dy', '0.75em')
      .style('text-anchor', 'middle')
      .style('font-family', "'Source Sans Pro',sans-serif")
      .text(axisLabels && axisLabels.left ? axisLabels.left : '');

  g.style('transform', 'scale(0.95) translateY(' + margin.top + 'px)')
   .style('transform-origin', 'center');

};

