import * as d3 from 'd3';
// import { baseColor } from '../../styling/styleUtils';

interface Dimensions {
  width: number;
  height: number;
}

export interface GeoJsonCustomProperties {
  percent: number;
  tooltipContent?: string;
}

interface Input {
  svg: d3.Selection<any, unknown, null, undefined>;
  tooltip: d3.Selection<any, unknown, null, undefined>;
  data: d3.ExtendedFeature<any, GeoJsonCustomProperties>;
  size: Dimensions;
  minColor: string;
  maxColor: string;
}

export default (input: Input) => {
  const { svg, data, size, tooltip, minColor, maxColor } = input;

  const margin = {top: 30, right: 30, bottom: 30, left: 30};
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.bottom - margin.top;

  const center = d3.geoCentroid(data);
  let scale  = 150;
  let offset: [number, number] = [width/2, height/2];
  let projection = d3.geoMercator().scale(scale).center(center)
        .translate(offset);

  // create the path
  let path = d3.geoPath().projection(projection);

  // using the path determine the bounds of the current map and use
  // these to determine better values for the scale and translation
  const bounds  = path.bounds(data);
  const hscale  = scale*width  / (bounds[1][0] - bounds[0][0]);
  const vscale  = scale*height / (bounds[1][1] - bounds[0][1]);
  scale   = (hscale < vscale) ? hscale : vscale;
  offset  = [width - (bounds[0][0] + bounds[1][0])/2,
                    height - (bounds[0][1] + bounds[1][1])/2];

  // new projection
  projection = d3.geoMercator().center(center)
    .scale(scale).translate(offset);
  path = path.projection(projection);

  const allValues: number[] = (data as any).features.map((node: any) => node.properties.percent);

  const rawMinValue = d3.min(allValues);
  const rawMaxValue = d3.max(allValues);

  const minValue = rawMinValue ? Math.floor(rawMinValue) : 0;
  const maxValue = rawMaxValue ? Math.ceil(rawMaxValue) : 0;

  const colorScale = d3.scaleLinear<string>().domain([minValue, maxValue]).range([minColor, maxColor]);

  svg
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  const container = svg
    .append('g')
      .attr('transform',
      'translate(' + margin.left + ',' + margin.top + ')');

  container.selectAll('path')
     .data((data as any).features)
      .enter()
     .append('path')
     .attr('d', path)
     // .attr('stroke-width',1)
     // .attr('stroke',baseColor)
     .attr('class','pathClass')
     .on('mousemove', function(d: any) {
       if (d.properties.tooltipContent) {
        tooltip
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY + 'px')
          .style('display', 'block')
          .html(d.properties.tooltipContent);
       }
      })
      .on('mouseout', function(){
        tooltip.style('display', 'none');
      });

  container.selectAll('.pathClass').attr('fill', (d: any) => colorScale(d.properties.percent));

};
