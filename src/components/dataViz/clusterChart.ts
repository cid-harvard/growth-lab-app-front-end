import * as d3 from 'd3';
import {adaptLabelFontSize} from './Utils';

export interface Datum {
  name: string;
  label: string;
  value: number;
  fill: string;
}

interface ParentDatum {
  id: string;
}

interface SrcDatum extends ParentDatum {
  name: string;
  value: number;
  parentId: string;
}

type SrcData = (SrcDatum | ParentDatum)[];

interface Dimensions {
  width: number;
  height: number;
}

interface Input {
  svg: d3.Selection<any, unknown, null, undefined>;
  tooltip: d3.Selection<any, unknown, null, undefined>;
  size: Dimensions;
  data: Datum[];
  hideLabels?: boolean;
  circleSpacing?: number;
  max?: number;
}

export default (input: Input) => {
  const {
    svg, size, data, tooltip, hideLabels,
    circleSpacing, max,
  } = input;


  const allValues: number[] = [];

  const srcData: SrcData = data.map(d => {
    allValues.push(d.value);
    return {
      id: d.label, size: d.value, parentId: 'global', ...d,
    };
  });
  srcData.unshift({id: 'global'});

  const margin = {top: 10, right: 10, bottom: 10, left: 10};
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.bottom - margin.top;

  svg.attr('width', width)
     .attr('height', height);

  const g = svg.append('g')
            .attr('class', 'main-group');


  let layout: d3.PackLayout<any>;
  if (max) {
    const sizeScale = d3.scaleSqrt().range([0, max]);
    layout = d3.pack()
              .radius((d: any) => sizeScale(d.value))
              .size([width, height])
              .padding(circleSpacing !== undefined ? circleSpacing : 6);
  } else {
    layout = d3.pack()
              .size([width, height])
              .padding(circleSpacing !== undefined ? circleSpacing : 6);
  }

  const stratData = d3.stratify()(srcData);
  const root = d3.hierarchy(stratData)
      .sum(function(d: any) { return d.data.size; })
      .sort(function(a: any, b: any) { return b.value - a.value; });
  const nodes = root.descendants();

  layout(root);

  g.selectAll('circle')
    .data(nodes)
    .enter()
    .filter((d) => d.parent !== null )
    .append('circle')
    .attr('cx', (d: any) => d.x)
    .attr('cy', (d: any) => d.y)
    .attr('r', (d: any) => d.r)
    .style('fill', (d: any) => d.data.data.fill)
    .on('mousemove', (d: any) => {
        tooltip
          .style('position', 'fixed')
          .style('left', d3.event.clientX + 'px')
          .style('top', d3.event.clientY + 'px')
          .style('display', 'flex')
          .style('align-items', 'center')
          .html(`<div style="
            display: inline-block;
            width: 12px;
            height: 12px;
            margin-right: 12px;
            background-color: ${d.data.data.fill};
            flex-shrink: 0;
          "></div>
              <strong>${d.data.data.name}</strong>: ${d.data.data.value}

          `);
      })
    .on('mouseout', () => tooltip.style('display', 'none'));

  if (!hideLabels) {
    g.selectAll('text')
      .data(nodes)
      .enter()
      .filter((d) => d.parent !== null )
      .append('text')
      .attr('x', (d: any) => d.x)
      .attr('y', (d: any) => d.y)
      .text(d => {
        if (d.data.id) {
          return d.data.id;
        } else {
          return '';
        }
      })
      .style('fill', '#fff')
      .style('font-size', adaptLabelFontSize)
      .attr('text-anchor', 'middle')
      .style('transform', (d: any) => {
        const adjust = parseInt(d.r, 10) * 0.15;
        return 'translate(0px, ' + adjust + 'px)';
      })
      .style('pointer-events', 'none');
  }

  g.style('transform', () => max !== undefined ? 'scale(' + max / 100 + ')' : null)
   .style('transform-origin', 'center');
};
