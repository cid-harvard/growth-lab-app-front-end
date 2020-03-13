import * as d3 from 'd3';

interface Options {
  radius?: number,
  width?: number,
  height?: number,
  factor?: number,
  factorLegend?: number,
  levels?: number,
  maxValue?: number,
  radians?: number,
  opacityArea?: number,
  ToRight?: number,
  TranslateX?: number,
  TranslateY?: number,
  ExtraWidthX?: number,
  ExtraWidthY?: number,
  color?: d3.ScaleOrdinal<any, any> | any;
}
interface Config {
  radius: number,
  width: number,
  height: number,
  factor: number,
  factorLegend: number,
  levels: number,
  maxValue: number,
  radians: number,
  opacityArea: number,
  ToRight: number,
  TranslateX: number,
  TranslateY: number,
  ExtraWidthX: number,
  ExtraWidthY: number,
  color: d3.ScaleOrdinal<any, any> | any;
}

export interface Datum {
  label: string;
  value: number;
}

interface Input {
  svg: d3.Selection<any, unknown, null, undefined>;
  tooltip: d3.Selection<any, unknown, null, undefined>;
  data: Array<Datum[]>;
  options?: Options;
}

const RadarChart = {
  draw: function({svg, data, tooltip, options}: Input){
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
     color: d3.scaleOrdinal().range(["#6F257F", "#CA0D59"])
    };
  
    // if user input options, replace them in the config variable
    if('undefined' !== typeof options){
      for(let i in options){
        const key = i as keyof Options;
        if('undefined' !== typeof options[key]){
          config[key] = options[key];
        }
      }
    }

    console.log(config.maxValue)
    
  const margin = {top: 60, right: 60, bottom: 60, left: 60};
  const width = config.width - margin.left - margin.right;
  const height = config.height - margin.bottom - margin.top;

  const allAxis = (data[0].map(d => d.label));
  const total = allAxis.length;
  const radius = config.factor*Math.min(width/2, height  /2);


  // append the svg object to the body of the page
  svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

  const container = svg
    .append('g')
      .attr('transform',
            'translate(' + margin.left + ',' + margin.top + ')');

    //Circular segments
    for(let j=0; j<config.levels; j++){
      const levelFactor = config.factor*radius*((j+1)/config.levels);
      container.selectAll(".levels")
       .data(allAxis)
       .enter()
       .append("svg:line")
       .attr("x1", function(_d, i){return levelFactor*(1-config.factor*Math.sin(i*config.radians/total));})
       .attr("y1", function(_d, i){return levelFactor*(1-config.factor*Math.cos(i*config.radians/total));})
       .attr("x2", function(_d, i){return levelFactor*(1-config.factor*Math.sin((i+1)*config.radians/total));})
       .attr("y2", function(_d, i){return levelFactor*(1-config.factor*Math.cos((i+1)*config.radians/total));})
       .attr("class", "line")
       .style("stroke", "grey")
       .style("stroke-opacity", "0.75")
       .style("stroke-width", "0.3px")
       .attr("transform", "translate(" + (width/2-levelFactor) + ", " + (height  /2-levelFactor) + ")");
    }

    //Text indicating at what % each level is
    for(var j=0; j<config.levels; j++){
      const levelFactor = config.factor*radius*((j+1)/config.levels);
      container.selectAll(".levels")
       .data([1]) //dummy data
       .enter()
       .append("svg:text")
       .attr("x", function(){return levelFactor*(1-config.factor*Math.sin(0));})
       .attr("y", function(){return levelFactor*(1-config.factor*Math.cos(0));})
       .attr("class", "legend")
       .style("font-family", "sans-serif")
       .style("font-size", "10px")
       .attr("transform", "translate(" + (width/2-levelFactor + config.ToRight) + ", " + (height  /2-levelFactor) + ")")
       .attr("fill", "#737373")
       .text( Math.round((j+1)*config.maxValue/config.levels) );
    }

    let series = 0;

    const axis = container.selectAll(".axis")
        .data(allAxis)
        .enter()
        .append("g")
        .attr("class", "axis");

    axis.append("line")
      .attr("x1", width/2)
      .attr("y1", height  /2)
      .attr("x2", function(_d, i){return width/2*(1-config.factor*Math.sin(i*config.radians/total));})
      .attr("y2", function(_d, i){return height  /2*(1-config.factor*Math.cos(i*config.radians/total));})
      .attr("class", "line")
      .style("stroke", "grey")
      .style("stroke-width", "1px");

    axis.append("text")
      .attr("class", "legend")
      .text(function(d){return d})
      .style("font-size", "11px")
      .attr("text-anchor", "middle")
      .attr("dy", "1.5em")
      .attr("transform", function(){return "translate(0, -10)"})
      .attr("x", function(_d, i){return width/2*(1-config.factorLegend*Math.sin(i*config.radians/total))-60*Math.sin(i*config.radians/total);})
      .attr("y", function(_d, i){return height  /2*(1-Math.cos(i*config.radians/total))-20*Math.cos(i*config.radians/total);});

 
    data.forEach(function(d){
      const dataValues = d.map(({value}, i) => {
        return [
          width/2*(1-(parseFloat(Math.max(value, 0).toString())/config.maxValue)*config.factor*Math.sin(i*config.radians/total)), 
          height/2*(1-(parseFloat(Math.max(value, 0).toString())/config.maxValue)*config.factor*Math.cos(i*config.radians/total))
        ];
      });
      dataValues.push(dataValues[0]);
      container.selectAll(".area")
             .data([dataValues])
             .enter()
             .append("polygon")
             .attr("class", "radar-chart-serie"+series)
             .style("stroke-width", "2px")
             .style("stroke", config.color(series))
             .attr("points",function(point) {
               let str="";
               for(let pti=0;pti<point.length;pti++){
                 str=str+point[pti][0]+","+point[pti][1]+" ";
               }
               return str;
              })
             .style("fill", function(){return config.color(series)})
             .style("fill-opacity", config.opacityArea)
             .on('mouseover', function (){
                      const z = "polygon."+d3.select(this).attr("class");
                      container.selectAll("polygon")
                       .transition()
                       .style("fill-opacity", 0.1); 
                      container.selectAll(z)
                       .transition()
                       .style("fill-opacity", .7);
                      })
             .on('mouseout', function(){
                      container.selectAll("polygon")
                       .transition()
                       .style("fill-opacity", config.opacityArea);
             });
      series++;
    });
    series=0;


    data.forEach(function(d){

      container.selectAll(".nodes")
      .data(d).enter()
      .append("svg:circle")
      .attr("class", "radar-chart-serie"+series)
      .attr('r', config.radius)
      .attr("alt", function(j){return Math.max(j.value, 0)})
      .attr("cx", function(j, i){
        return width/2*(1-(Math.max(j.value, 0)/config.maxValue)*config.factor*Math.sin(i*config.radians/total));
      })
      .attr("cy", function(j, i){
        return height  /2*(1-(Math.max(j.value, 0)/config.maxValue)*config.factor*Math.cos(i*config.radians/total));
      })
      .attr("data-id", function(j){return j.label})
      .style("fill", "#fff")
      .style("stroke-width", "2px")
      .style("stroke", config.color(series)).style("fill-opacity", .9)
      .on('mousemove', function (d){
            tooltip
              .style("left", d3.event.pageX + "px")
              .style("top", d3.event.pageY + "px")
              .style("display", "inline-block")
              .html(`<strong>${d.label}</strong>: ${d.value}`);
            })
        .on("mouseout", function(){ tooltip.style("display", "none");});

      series++;
    });
  }
};

export default RadarChart;