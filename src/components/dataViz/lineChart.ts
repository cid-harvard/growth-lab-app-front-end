import * as d3 from 'd3';

interface Coords {
  x: number;
  y: number;
}

export enum LabelAnchor {
  Left = 'start',
  Middle = 'middle',
  Right = 'end',
}

export enum LabelPosition {
  Top = 'top',
  Center = 'center',
  Bottom = 'bottom',
}

export interface Datum {
  coords: Coords[];
  animationDuration: number;
  animationStartPercentAsDecimal?: number;
  label?: string;
  labelColor?: string;
  showLabelLine?: boolean;
  labelPosition?: LabelPosition;
  labelAnchor?: LabelAnchor;
  color?: string;
  width?: number;
  tooltipContent?: string;
  totalLength?: number;
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
  const valueline = d3.line()
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

  g.selectAll('.label-lines')
      .data(data)
      .enter()
        .append('line')
        .attr('transform', 'translate(' + margin.left + ', 0)')
        .style('stroke-dasharray', '3 1')
        .attr('stroke', ({labelColor}) => labelColor ? labelColor : 'gray')
        .attr('y1', ({coords}) => y(coords[coords.length - 1].y))
        .attr('x1', ({coords}) => x(coords[coords.length - 1].x))
        .attr('y2', height)
        .attr('x2', ({coords}) => x(coords[coords.length - 1].x))
        .text(({label}) => label ? label : '')
        .attr('opacity', '0')
        .transition() // Call Transition Method
        .delay(d => d.animationDuration ) // Set Duration timing (ms)
        .duration(d => d.animationDuration ) // Set Duration timing (ms)
        .ease(d3.easeLinear) // Set Easing option
        .attr('opacity', d => d.showLabelLine ? '1' : '0');

  // Add the valueline path.
  const paths = g.selectAll('.paths')
      .data(data)
      .enter()
        .append('path')
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', ({color}) => color ? color : 'gray')
        .attr('stroke-width', (line) => line.width ? line.width : 1.5)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('d', d => valueline(d.coords as any as [[number, number]]))
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

  // Set Properties of Dash Array and Dash Offset and initiate Transition
  paths.each(function(d) {
      d.totalLength = this.getTotalLength();
    })
    .attr('stroke-dasharray', d => d.totalLength ? d.totalLength : 0)
    .attr('stroke-dashoffset', d => {
      const multiplier = d.animationStartPercentAsDecimal !== undefined ? d.animationStartPercentAsDecimal : 1;
      return d.totalLength ? d.totalLength * multiplier : 0;
    })
    .transition() // Call Transition Method
    .duration(d => d.animationDuration) // Set Duration timing (ms)
    .ease(d3.easeLinear) // Set Easing option
    .attr('stroke-dashoffset', 0); // Set final value of dash-offset for transition

  // Add the labels
  g.selectAll('.labels')
      .data(data)
      .enter()
        .append('text')
        .attr('transform', d => {
          if (d.labelPosition === LabelPosition.Top) {
            return `translate(${margin.left + 8} -8)`;
          } else if (d.labelPosition === LabelPosition.Bottom) {
            return `translate(${margin.left + 8} 10)`;
          } else if (d.labelPosition === LabelPosition.Center) {
            return `translate(${margin.left + 8} 2)`;
          } else {
            return `translate(${margin.left + 8} 2)`;
          }
        })
        .attr('text-anchor', d => d.labelAnchor ? d.labelAnchor : LabelAnchor.Left)
        .attr('class', 'line-label')
        .attr('fill', ({labelColor}) => labelColor ? labelColor : 'gray')
        .attr('font-size', '0.7rem')
        .attr('y', ({coords}) => y(coords[coords.length - 1].y))
        .attr('x', ({coords}) => x(coords[coords.length - 1].x))
        .style('font-family', "'Source Sans Pro',sans-serif")
        .text(({label}) => label ? label : '')
        .attr('opacity', '0')
        .transition() // Call Transition Method
        .delay(d => d.animationDuration ) // Set Duration timing (ms)
        .duration(d => d.animationDuration ) // Set Duration timing (ms)
        .ease(d3.easeLinear) // Set Easing option
        .attr('opacity', '1');

  // Add the x Axis
  g.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + height + ')')
      .call(d3.axisBottom(x));

  // Add the y Axis
  g.append('g')
      .call(d3.axisLeft(y).tickFormat(formatNumber))
      .attr('transform', 'translate(' + margin.left + ', 0)');

  // gridlines in x axis function
  // const makeGridlinesX: any = () => d3.axisBottom(x).ticks(10);

  // gridlines in y axis function
  const makeGridlinesY: any = () => d3.axisLeft(y).ticks(10);

  // add the X gridlines
  // g.append('g')
  //     .attr('class', 'grid')
  //     .attr('transform', 'translate(' + margin.left + ',' + height + ')')
  //     .style('opacity', '0.25')
  //     .style('stroke-dasharray', '3 1')
  //     .call(makeGridlinesX()
  //         .tickSize(-height)
  //         .tickFormat(''),
  //     );

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

