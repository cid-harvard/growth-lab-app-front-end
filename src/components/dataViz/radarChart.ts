import * as d3 from 'd3';

interface Options {
  radius?: number;
  width?: number;
  height?: number;
  factor?: number;
  factorLegend?: number;
  levels?: number;
  maxValue?: number;
  radians?: number;
  opacityArea?: number;
  ToRight?: number;
  TranslateX?: number;
  TranslateY?: number;
  ExtraWidthX?: number;
  ExtraWidthY?: number;
  color?: d3.ScaleOrdinal<any, any> | any;
}

interface Config {
  radius: number;
  width: number;
  height: number;
  factor: number;
  factorLegend: number;
  levels: number;
  maxValue: number;
  radians: number;
  opacityArea: number;
  ToRight: number;
  TranslateX: number;
  TranslateY: number;
  ExtraWidthX: number;
  ExtraWidthY: number;
  color: d3.ScaleOrdinal<any, any> | any;
}

export interface Datum {
  label: string;
  value: number;
}

interface Input {
  svg: d3.Selection<any, unknown, null, undefined>;
  tooltip: d3.Selection<any, unknown, null, undefined>;
  data: Datum[][];
  options?: Options;
}

export default ({svg, data, tooltip, options}: Input) => {
  // set default config
  const config: Config = {
    radius: 5,
    width: 600,
    height: 600,
    factor: 1,
    factorLegend: .85,
    levels: 5,
    maxValue: 100,
    radians: 2 * Math.PI,
    opacityArea: 0.5,
    ToRight: 5,
    TranslateX: 80,
    TranslateY: 30,
    ExtraWidthX: 100,
    ExtraWidthY: 100,
    color: d3.scaleOrdinal().range(['#6F257F', '#CA0D59']),
  };

  // if user input options, replace them in the config variable
  if(options && 'undefined' !== typeof options){
    Object.keys(options).forEach(function(key: keyof Options) {
      if('undefined' !== typeof options[key]){
        config[key] = options[key];
      }
    });
  }

  const margin = {top: 60, right: 60, bottom: 60, left: 60};
  const width = config.width - margin.left - margin.right;
  const height = config.height - margin.bottom - margin.top;

  const allAxis = (data && data.length ? data[0].map(d => d.label) : []);
  const total = allAxis.length;
  const radius = config.factor * Math.min(width / 2, height / 2);


  svg
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  const container = svg
    .append('g')
      .attr('transform',
      'translate(' + margin.left + ',' + margin.top + ')');

  //Circular segments
  for(let j = 0; j < config.levels; j++) {
    const levelFactor = config.factor * radius * ((j + 1)/config.levels);
    container.selectAll('.levels')
      .data(allAxis)
      .enter()
      .append('svg:line')
        .attr('x1', (_d, i) => levelFactor * (1 - config.factor * Math.sin(i * config.radians / total)))
        .attr('y1', (_d, i) => levelFactor * (1 - config.factor * Math.cos(i * config.radians / total)))
        .attr('x2', (_d, i) => levelFactor * (1 - config.factor * Math.sin((i + 1) * config.radians / total)))
        .attr('y2', (_d, i) => levelFactor * (1 - config.factor * Math.cos((i + 1) * config.radians / total)))
        .attr('class', 'line')
        .style('stroke', 'grey')
        .style('stroke-opacity', '0.75')
        .style('stroke-width', '0.6px')
        .attr('transform', `translate(${width / 2 - levelFactor}, ${height / 2 - levelFactor})`);
  }

  //Text indicating at what % each level is
  for(let j = 0; j < config.levels; j++) {
    const levelFactor = config.factor * radius * ((j + 1) / config.levels);
    container.selectAll('.levels')
      .data([1]) //dummy data
      .enter()
      .append('svg:text')
        .attr('x', () => levelFactor * (1 - config.factor*Math.sin(0)))
        .attr('y', () => levelFactor * (1 - config.factor*Math.cos(0)))
        .attr('class', 'legend')
        .style('font-family', 'sans-serif')
        .style('font-size', '10px')
        .attr('transform', `translate(${width / 2 - levelFactor + config.ToRight}, ${height / 2 - levelFactor})`)
        .attr('fill', '#737373')
        .text( Math.round((j + 1) * config.maxValue / config.levels));
  }

  let series = 0;

  const axis = container.selectAll('.axis')
    .data(allAxis)
    .enter()
    .append('g')
      .attr('class', 'axis');

  axis.append('line')
    .attr('x1', width/2)
    .attr('y1', height  /2)
    .attr('x2', (_d, i) => width / 2 * (1 - config.factor * Math.sin(i * config.radians / total)))
    .attr('y2', (_d, i) => height / 2 * (1 - config.factor * Math.cos(i * config.radians / total)))
    .attr('class', 'line')
    .style('stroke', 'grey')
    .style('stroke-width', '1px');

  data.forEach((d) => {
    const dataValues = d.map(({value}, i) => [
      width/2*(1-(parseFloat(Math.max(value, 0).toString())/config.maxValue)*config.factor*Math.sin(i*config.radians/total)),
      height/2*(1-(parseFloat(Math.max(value, 0).toString())/config.maxValue)*config.factor*Math.cos(i*config.radians/total)),
    ]);

    // push the first dataValue back to make a complete closed path
    dataValues.push(dataValues[0]);

      container.selectAll('.area')
      .data([dataValues])
      .enter()
      .append('polygon')
        .attr('class', 'radar-chart-serie'+series)
        .style('stroke-width', '2px')
        .style('stroke', config.color(series))
        .attr('points', point => {
          let value = '';
          for(const p of point){
            value = value + p[0] + ',' + p[1] + ' ';
          }
          return value;
        })
        .style('fill', config.color(series))
        .style('fill-opacity', config.opacityArea)
        .on('mouseover', function () {
          const shape = 'polygon.'+d3.select(this).attr('class');
          container.selectAll('polygon')
          .transition()
          .style('fill-opacity', 0.1);
          container.selectAll(shape)
          .transition()
          .style('fill-opacity', .7);
        })
        .on('mouseout', () => {
          container.selectAll('polygon')
          .transition()
          .style('fill-opacity', config.opacityArea);
        });

    series++;
  });

  series = 0;

  data.forEach(d => {

    container.selectAll('.nodes')
      .data(d)
      .enter()
      .append('svg:circle')
        .attr('class', 'radar-chart-serie' + series)
        .attr('r', config.radius)
        .attr('alt', j => Math.max(j.value, 0))
        .attr('cx', (j, i) => width/2*(1-(Math.max(j.value, 0)/config.maxValue)*config.factor*Math.sin(i*config.radians/total)))
        .attr('cy', (j, i) => height  /2*(1-(Math.max(j.value, 0)/config.maxValue)*config.factor*Math.cos(i*config.radians/total)))
        .attr('data-id', j => j.label)
        .style('fill', '#fff')
        .style('stroke-width', '2px')
        .style('stroke', config.color(series)).style('fill-opacity', .9)
        .on('mousemove', p => {
          tooltip
            .style('left', d3.event.pageX + 'px')
            .style('top', d3.event.pageY + 'px')
            .style('display', 'block')
            .html(`<strong>${p.label}</strong>: ${p.value}`);
        })
        .on('mouseout', function(){ tooltip.style('display', 'none');});

    series++;
  });

  const labels = axis.append('text')
    .style('font-size', '11px')
    .style('font-family', "'Source Sans Pro',sans-serif")
    .attr('text-anchor', 'middle')
    .attr('dy', '1.5em')
    .attr('transform', (_d, i) => {
      if (i === 0) {
        return 'translate(0, -12)';
      } else if (i === 1 && total === 4) {
        return 'translate(4, 0)';
      } else {
        return 'translate(0, 0)';
      }
    })
    .attr('class', 'legend')
    .attr('x', (_d, i) => width / 2 * (1 - config.factorLegend * Math.sin(i * config.radians / total)) -60 * Math.sin(i * config.radians/total))
    .attr('y', (_d, i) => height / 2 * (1 - Math.cos(i * config.radians / total)) - 20 * Math.cos(i *config.radians / total));

  const seperator = '|||||';

  labels.selectAll('tspan')
    .data((d, i) => {
      const res = d.split('\n');
      const arr = res.map(text => `${i}${seperator}${text}`);
      return arr;
    })
    .enter()
    .append('tspan')
    .text(d => {
      const text = d.split(seperator).pop();
      return text !== undefined ? text : '';
    })
    .attr('x', (d) => {
      const originalI = d.split(seperator).shift();
      const i = originalI !== undefined ? parseInt(originalI, 10) : 0;
      return width / 2 * (1 - config.factorLegend * Math.sin(i * config.radians / total)) -60 * Math.sin(i * config.radians/total);
    })
    .attr('dx', 0)
    .attr('dy', (_d, i) => i !== 0 ? 15 : 0);

};

