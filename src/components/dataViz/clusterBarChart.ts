import * as d3 from 'd3';

export interface Datum {
  groupName: string;
  x: string;
  y: number;
  fill?: string;
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
  axisLabels?: {left?: string, bottom?: string};
}

export default (input: Input) => {
  const { svg, size, axisLabels, data, tooltip } = input;

  const margin = {
    top: 30, right: 30,
    bottom: axisLabels && axisLabels.bottom ? 60 : 30,
    left: 30};
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.bottom - margin.top;

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const x = d3.scaleBand().rangeRound([0, width])
    .padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);

  const g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const yMax = d3.max(data, function(d) {
    return d.y;
  });
  const yMaxDomain = yMax ? yMax : 0;
  x.domain(data.map(function(d) {
    return d.x;
  }));
  y.domain([0, yMaxDomain]);

  const x1 = d3.scaleBand()
    .rangeRound([0, x.bandwidth()])
    .padding(0.05)
    .domain(data.map(function(d) {
      return d.groupName;
    }));

  color.domain(data.map(function(d) {
    return d.groupName;
  }));

  const groups = g.selectAll(null)
    .data(data)
    .enter()
    .append('g')
    .attr('transform', function(d) {
      return 'translate(' + x(d.x) + ',0)';
    });

  groups.selectAll(null)
    .data(function(d) {
      return [d];
    })
    .enter()
    .append('rect')
    .attr('x', function(d) {
      const xVal = x1(d.groupName);
      return xVal ? xVal : 0;
    })
    .attr('y', function(d) {
      return y(d.y);
    })
    .attr('width', x1.bandwidth())
    .attr('height', function(d) {
      return height - y(d.y);
    })
    .attr('fill', d => d.fill ? d.fill : color(d.groupName))
    .on('mousemove', ({groupName, x: valueName, tooltipContent}) => {
      const content = tooltipContent === undefined || tooltipContent.length === 0
        ? '' : `:<br />${tooltipContent}`;
      tooltip
        .style('display', 'block');
      tooltip.html(`<strong>${groupName}, ${valueName}</strong>${content}`)
        .style('left', (d3.event.pageX + 4) + 'px')
        .style('top', (d3.event.pageY - 4) + 'px');
      })
    .on('mouseout', () => {
      tooltip
          .style('display', 'none');
    });

  g.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x));

  // append Y axis label
  g.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(y).ticks(null, 's'))
    .append('text')
    .attr('x', 2)
    .attr('y', () => {
      const yTick = y.ticks().pop();
      const yTickVal = yTick ? yTick : 0;
      return y(yTickVal) + 0.5;
    })
    // .attr("dy", "0.32em")

      .attr('y', -margin.top / 2)
      .attr('x', 0)
      .attr('dy', '0.75em')
    .attr('fill', '#000')
    .attr('text-anchor', 'start')
    .text(axisLabels && axisLabels.left ? axisLabels.left : '');
};
