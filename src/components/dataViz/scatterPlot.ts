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
  showAverageLines?: boolean;
  averageLineText?: {left?: string, bottom?: string};
  quadrantLabels?: {I?: string, II?: string, III?: string, IV?: string};
}

export default (input: Input) => {
  const {
    svg, tooltip, data, size, axisLabels, axisMinMax, showAverageLines,
    averageLineText, quadrantLabels,
  } = input;

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
  const maxX = rawMaxX ? Math.ceil(rawMaxX * maxScaleBuffer) : 0;
  const minY = rawMinY ? Math.floor(rawMinY * minScaleBuffer) : 0;
  const maxY = rawMaxY ? Math.ceil(rawMaxY * maxScaleBuffer) : 0;



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

  if (showAverageLines) {
    container.append('line')
      .attr('x1',xScale(minX))
      .attr('x2',xScale(maxX))
      .attr('y1',yScale(maxY / 2) + 0.5)
      .attr('y2',yScale(maxY / 2) + 0.5)
      .attr('stroke-width', '1px')
      .style('pointer-events', 'none')
      .attr('stroke', '#9e9e9e');
    container.append('line')
      .attr('x1',xScale(maxX / 2) + 0.5)
      .attr('x2',xScale(maxX / 2) + 0.5)
      .attr('y1',yScale(minY))
      .attr('y2',yScale(maxY))
      .attr('stroke-width', '1px')
      .style('pointer-events', 'none')
      .attr('stroke', '#9e9e9e');
  }

  if (averageLineText) {
    if (averageLineText.left) {
      container.append('text')
        .attr('x',xScale(minX) + 4)
        .attr('y',yScale(maxY / 2) + 12)
        .style('opacity', 0.8)
        .style('font-family', "'Source Sans Pro',sans-serif")
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .text(averageLineText.left);
    }
    if (averageLineText.bottom) {
      container.append('text')
        .attr('x',xScale(maxX / 2) + 4)
        .attr('y',yScale(minY) - 6)
        .style('opacity', 0.8)
        .style('font-family', "'Source Sans Pro',sans-serif")
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .text(averageLineText.bottom);

    }
  }

  const appendQuadrantLabel = (xVal: number, yVal: number, textParts: string[], textAnchor: string) => {
    const label = container.append('text')
        .style('text-anchor', textAnchor)
        .style('opacity', 0.8)
        .style('font-family', "'Source Sans Pro',sans-serif")
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('dominant-baseline', 'bottom')
        .attr('x', xVal)
        .attr('y', yVal);

      label.selectAll('tspan')
        .data(textParts)
        .enter()
        .append('tspan')
        .text(d => {
          const text = d;
          return text !== undefined ? text : '';
        })
        .attr('x', xVal)
        .attr('dx', 0)
        .attr('dy', (_d, i) => i !== 0 ? 15 : 0);

  };

  if (quadrantLabels !== undefined) {
    if (quadrantLabels.I !== undefined) {
      const xVal = width - 4;
      const yVal = yScale(maxY) + 12;
      const textParts = (quadrantLabels.I as string).split('\n');
      appendQuadrantLabel(xVal, yVal, textParts, 'end');
    }
    if (quadrantLabels.II !== undefined) {
      const xVal = xScale(minX) + 4;
      const yVal = yScale(maxY) + 12;
      const textParts = (quadrantLabels.II as string).split('\n');
      appendQuadrantLabel(xVal, yVal, textParts, 'start');
    }
    if (quadrantLabels.III !== undefined) {
      const textParts = (quadrantLabels.III as string).split('\n');
      const xVal = xScale(minX) + 4;
      const yVal = yScale(minY) - ((textParts.length - 1) * 15) - 6;
      appendQuadrantLabel(xVal, yVal, textParts, 'start');
    }
    if (quadrantLabels.IV !== undefined) {
      const textParts = (quadrantLabels.IV as string).split('\n');
      const xVal = width - 4;
      const yVal = yScale(minY) - ((textParts.length - 1) * 15) - 6;
      appendQuadrantLabel(xVal, yVal, textParts, 'end');
    }
  }

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
      .style('cursor', ({onClick}) => onClick ? 'pointer' : 'default')
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
      })
      .on('click', ({onClick}) => onClick ? onClick() : undefined);

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
