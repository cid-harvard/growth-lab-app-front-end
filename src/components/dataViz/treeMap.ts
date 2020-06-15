import * as d3 from 'd3';

export interface RootDatum {
  id: string;
  label: string;
  fill: string;
  children: (LeafDatum | RootDatum)[];
}

interface LeafDatum {
  id: string;
  label: string;
  tooltipContent: string;
  size: number;
}

interface Dimensions {
  width: number;
  height: number;
}

interface Input {
  svg: d3.Selection<any, unknown, null, undefined>;
  tooltip: d3.Selection<any, unknown, null, undefined>;
  size: Dimensions;
  data: RootDatum;
}

export default (input: Input) => {
  const { svg, size, data} = input;

  const margin = {top: 30, right: 30, bottom: 30, left: 30};
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.bottom - margin.top;

  const treemap = d3.treemap()
      .tile(d3.treemapResquarify)
      .size([width, height])
      .round(true)
      .paddingInner(1);

  const root = d3.hierarchy(data)
      .eachBefore((d: any) => d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.id)
      .sum((d: any) => d.size)
      .sort((a, b) => {
        if (b.height - a.height) {
          return b.height - a.height;
        } else if (b.value && a.value) {
          return b.value - a.value;
        } else {
          return 0;
        }
       });

  treemap(root);

  const cell = svg.selectAll('g')
    .data(root.leaves())
    .enter().append('g')
      .attr('transform', (d: any) => 'translate(' + d.x0 + ',' + d.y0 + ')');

  cell.append('rect')
      .attr('id', (d: any) => d.data.id)
      .attr('finalwidth', (d: any) => d.x1 - d.x0)
      .attr('finalheight', (d: any) => d.y1 - d.y0)
      .attr('width', '0')
      .attr('height', '0')
      .transition()
      .duration(750)
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('height', (d: any) => d.y1 - d.y0)
      .attr('fill', (d: any) =>  d.parent.data.fill);

  cell.append('clipPath')
      .attr('id', (d: any) => 'clip-' + d.data.id)
    .append('use')
      .attr('xlink:href', (d: any) => '#' + d.data.id);

  cell.append('text')
      .attr('clip-path', (d: any) => 'url(#clip-' + d.data.id + ')')
      .attr('font-size', '0.65rem')
      .attr('x', 8)
      .attr('y', 16)
      .text((d: any) => d.data.name + ' - ' + d.data.size + '%')
      .call(wrap);

  function wrap(text: any) {
    text.each(function() {
      // @ts-ignore
      const t = d3.select(this as any);
      // @ts-ignore
      const rect = this.parentElement.querySelector('rect');
      const rectWidth = rect.getAttribute('finalwidth');
      const rectHeight = rect.getAttribute('finalheight');
      const words = t.text().split(/\s+/).reverse();
      let word = words.pop();
      let line: string[] = [];
      let lineNumber = 0; //<-- 0!
      const lineHeight = 1.2; // ems
      const x = t.attr('x'); //<-- include the x!
      const y = t.attr('y');
      const dy = t.attr('dy') ? t.attr('dy') : 0; //<-- null check
      let tspan = t.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');
      while (word !== undefined) {
        line.push(word);
        tspan.text(line.join(' '));
        const node = tspan.node();
        if (node && node.getComputedTextLength() > (rectWidth * 0.8)) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          // @ts-ignore
          tspan = t.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
        }
        word = words.pop();
      }
      if (t.node().getBBox().width > rectWidth || t.node().getBBox().height > rectHeight * 0.8) {
        t.attr('opacity', '0');
      }
    });
  }
};
