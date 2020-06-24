import * as d3 from 'd3';

export interface Datum {
  category: string;
  label: string;
  value: number;
  plotPoint: boolean;
  primaryPoint: boolean;
  fill?: string;
}

interface Dimensions {
  width: number;
  height: number;
}

interface Input {
  svg: d3.Selection<any, unknown, null, undefined>;
  data: Datum[];
  tooltip: d3.Selection<any, unknown, null, undefined>;
  size: Dimensions;
  labelFont?: string;
}

export default (input: Input) => {
  const { svg, data, size, labelFont} = input;

  const margin = {top: 30, right: 20, bottom: 30, left: 40};
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.bottom - margin.top;

  svg
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

const group = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
const sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
  .key((d: Datum) => d.category)
  .rollup((d: Datum[]) => {
    const q1 = d3.quantile(d.map(g => g.value).sort(d3.ascending),.25) as number;
    const median = d3.quantile(d.map(g => g.value).sort(d3.ascending),.5) as number;
    const q3 = d3.quantile(d.map(g => g.value).sort(d3.ascending),.75) as number;
    const interQuantileRange = q3 - q1;
    const allValues = d.map(({value}) => value);
    const [min, max] = d3.extent(allValues);
    return({q1, median, q3, interQuantileRange, min, max}) as any;
  })
  .entries(data);

  const allCategories: string[] = [];
  const allMinMaxValues: number[] = [];
  sumstat.forEach(({key, value}) => {
    allCategories.push(key);
    allMinMaxValues.push((value as any as {min: number}).min);
    allMinMaxValues.push((value as any as {max: number}).max);
  });

  // Show the X scale
  const x = d3.scaleBand()
    .range([ 0, width ])
    .domain(allCategories)
    .paddingInner(1)
    .paddingOuter(.5);

  group.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .style('font-family', labelFont ? labelFont : "'Source Sans Pro',sans-serif")
    .call(d3.axisBottom(x));

  const [minY, maxY] = d3.extent(allMinMaxValues) as [number, number];

  // Show the Y scale
  const y = d3.scaleLinear()
    .domain([minY * 1.15,maxY * 1.15])
    .range([height, 0]);

  group.append('g')
    .style('font-family', labelFont ? labelFont : "'Source Sans Pro',sans-serif")
    .call(d3.axisLeft(y));

  // Show the main vertical line
  group
    .selectAll('vertLines')
    .data(sumstat)
    .enter()
    .append('line')
      .attr('x1', d => x(d.key) as number)
      .attr('x2', d => x(d.key) as number)
      .attr('y1', d => y((d.value as any as {min: number}).min) as number)
      .attr('y2', d => y((d.value as any as {max: number}).max) as number)
      .attr('stroke', '#555')
      .style('width', 40);

  // rectangle for the main box
  const boxWidth = width / allCategories.length * 0.7;
  group
    .selectAll('boxes')
    .data(sumstat)
    .enter()
    .append('rect')
        .attr('x', d => (x(d.key) as number) - boxWidth / 2)
        .attr('y', d => y((d.value as any as {q3: number}).q3) as number)
        .attr('height', d => (y((d.value as any as {q1: number}).q1) - y((d.value as any as {q3: number}).q3)))
        .attr('width', boxWidth)
        .attr('stroke', '#555')
        .style('fill', '#EC7063')
        .style('opacity', '0.3');

  // Show the median
  group
    .selectAll('medianLines')
    .data(sumstat)
    .enter()
    .append('line')
      .attr('x1', d => (x(d.key) as number) - boxWidth / 2)
      .attr('x2', d => (x(d.key) as number) + boxWidth / 2)
      .attr('y1', d => y((d.value as any as {median: number}).median))
      .attr('y2', d => y((d.value as any as {median: number}).median))
      .style('width', 80)
      .style('stroke', '#555');

  group
    .selectAll('indPoints')
    .data(data.filter(d => d.plotPoint && !d.primaryPoint))
    .enter()
    .append('circle')
      .attr('cx', d => x(d.category) as number)
      .attr('cy', d => y(d.value) as number)
      .attr('r', 4)
      .style('fill', d => d.fill ? d.fill : '#2874A6');
  group
    .selectAll('primaryPoints')
    .data(data.filter(d => d.plotPoint && d.primaryPoint))
    .enter()
    .append('circle')
      .attr('cx', d => x(d.category) as number)
      .attr('cy', d => y(d.value) as number)
      .attr('r', 7)
      .style('fill', d => d.fill ? d.fill : 'red');

};
