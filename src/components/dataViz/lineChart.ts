import * as d3 from 'd3';

interface Coords {
  x: number;
  y: number;
}

export interface Datum {
  coords: Coords[];
  color?: string;
  width?: number;
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
}

export default (input: Input) => {
  const { svg, data, size } = input;

  const margin = {top: 30, right: 30, bottom: 30, left: 30};
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
  const [rawMinX, rawMaxX] = d3.extent(allXValues);
  const minX = rawMinX !== undefined ? rawMinX : 0;
  const maxX = rawMaxX !== undefined ? rawMaxX : 0;
  const [rawMinY, rawMaxY] = d3.extent(allYValues);
  const minY = rawMinY !== undefined ? rawMinY : 0;
  const maxY = rawMaxY !== undefined ? rawMaxY : 0;

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
        .attr('transform', 'translate(' + margin.left + ', 0)');

  // Add the x Axis
  g.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + height + ')')
      .call(d3.axisBottom(x));

  // Add the y Axis
  g.append('g')
      .call(d3.axisLeft(y).tickFormat(formatNumber))
      .attr('transform', 'translate(' + margin.left + ', 0)');

  g.style('transform', 'scale(0.95) translateY(' + margin.top + 'px)')
   .style('transform-origin', 'center');
};

