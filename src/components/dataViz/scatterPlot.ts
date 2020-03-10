import * as d3 from 'd3';

export interface Datum {
  label: string;
  x: number;
  y: number;
  fill?: string;
  radius?: number;
  tooltipContent?: string;
  onClick?: () => void;
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
}

export default (input: Input) => {
  const { svg, tooltip, data, size } = input;

  const margin = {top: 30, right: 30, bottom: 30, left: 30};
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.bottom - margin.top;

  // append the svg object to the body of the page
  svg
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

  const container = svg
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  const allXValues = data.map(({x}) => x);
  const allYValues = data.map(({y}) => y);

  const rawMinX = d3.min(allXValues);
  const rawMaxX = d3.max(allXValues);
  const rawMinY = d3.min(allYValues);
  const rawMaxY = d3.max(allYValues);

  const minScaleBuffer = 0.9;
  const maxScaleBuffer = 1.1;

  const minX = rawMinX ? Math.floor(rawMinX * minScaleBuffer) : 0;
  const maxX = rawMaxX ? Math.floor(rawMaxX * maxScaleBuffer) : 0;
  const minY = rawMinY ? Math.floor(rawMinY * minScaleBuffer) : 0;
  const maxY = rawMaxY ? Math.floor(rawMaxY * maxScaleBuffer) : 0;



  // Add X axis
  const xScale = d3.scaleLinear()
    .domain([minX, maxX])
    .range([ 0, width ]);

  container.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale));

  // Add Y axis
  const yScale = d3.scaleLinear()
    .domain([minY, maxY])
    .range([ height, 0]);
  container.append("g")
    .call(d3.axisLeft(yScale));

  // gridlines in x axis function
  const makeGridlinesX: any = () => d3.axisBottom(xScale).ticks(5);

  // gridlines in y axis function
  const makeGridlinesY: any = () => d3.axisLeft(yScale).ticks(5);

  // add the X gridlines
  container.append("g")      
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .style('opacity', '0.25')
      .style('stroke-dasharray', '3 1')
      .call(makeGridlinesX()
          .tickSize(-height)
          .tickFormat('')
      )

  // add the Y gridlines
  container.append("g")      
      .attr("class", "grid")
      .style('opacity', '0.25')
      .style('stroke-dasharray', '3 1')
      .call(makeGridlinesY()
          .tickSize(-width)
          .tickFormat('')
      )

  // Add dots
  container.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", ({x}) => xScale(x))
      .attr("cy", ({y}) => yScale(y))
      .attr("r", ({radius}) => radius ? radius : 4)
      .style("fill", ({fill}) => fill ? fill : "#69b3a2")
      .on('mousemove', ({label, tooltipContent}) => {
        const content = tooltipContent === undefined || tooltipContent.length === 0
          ? '' : `<br />${tooltipContent}`;
        tooltip
          .style('display', 'block');
        tooltip.html(`<strong>${label}:</strong>${content}`)
          .style('left', (d3.event.pageX + 4) + 'px')
          .style('top', (d3.event.pageY - 4) + 'px');
        })
      .on('mouseout', () => {
        tooltip
            .style('display', 'none');
      });

};
