var m = {t:50,r:50,b:50,l:0},
    w = document.getElementById('canvas').clientWidth - m.l - m.r,
    h = document.getElementById('canvas').clientHeight - m.t -m.b;

var plot = d3.select('.canvas')
    .append('svg')
    .attr('width', w + m.l + m.r)
    .attr('height', h + m.t + m.b)
    .append('g')
    .attr('transform','translate('+ m.l+','+ m.t+')');

var factorName = "Education";
var barInterval = 35, barHeight = 30;
// Scale
var scaleX= d3.scaleLinear()
    .range([0,w/2]);
var scaleY = d3.scaleBand()
    .range([h,0])
    .padding(0.1);
// var scaleColor = d3.scaleOrdinal()
//     .domain(['1', '2', '3'])
//     .range(['#c9c9c9','#ff9712', '#ff7b7b']); // grey, orange, red

// Axis
var axisX = d3.axisBottom()
  .scale(scaleX)
  .tickSize(-3);
var axisY = d3.axisLeft()
  .scale(scaleY)
  .tickSize(-w);

// Data input
d3.queue()
  .defer(d3.csv, 'data/all_factor_dis.csv',parse)
	.await(dataLoaded);

function dataLoaded(err, data){
  scaleX.domain([0,1]);
  //scaleX.domain([0, d3.max(data, function(d) {return d.notOverweight;})]);
  scaleY.domain(data.map(function(d) {return d.item; }));

  //draw(data);

  $('.factor a').click(function(){
    factorName = $(this).html();
    console.log(factorName);
    filteredData = data.filter(function(d) {return d.factor == factorName});
    console.log(filteredData);
    draw(filteredData);
  });

  //drawAxis();
}

// Draw axis
function drawAxis(){
  var axisX = d3.axisBottom()
      .scale(scaleX)
      .tickSize(-h);
  var axisY = d3.axisLeft()
      .scale(scaleY)
      .tickSize(-w);
  plot.append('g').attr('class','axis axis-x')
      .attr('transform','translate(0,'+h+')')
      .call(axisX);
  plot.append('g').attr('class','axis axis-y').call(axisY);
}


// Draw main plot
function draw(data){
  // Not Overweight bar
  //ENTER
  let barNotOverweight = plot.selectAll('.notOverweightBar').data(data);

  let barNotOverweightEnter = barNotOverweight.enter()
      .append('rect')
      //.filter(function(d) {return d.factor == factorName})
      .attr('class','bar notOverweightBar')
      .attr('x', w/2)
      .attr("y", function(d, i) {return i*barInterval;})
      .on('click',function(d,i){
          console.log(d);
          console.log(i);
          console.log(this);
      })
      // .on('mouseenter',function(d){
      //     var tooltip = d3.select('.custom-tooltip');
      //     tooltip.select('.title')
      //         .html(d.factor)
      //     tooltip.select('.value1')
      //         .html(d.notOverweight/(d.overweightObese + d.notOverweight));
      //     tooltip.transition().style('opacity',1);
      //     d3.select(this).style('stroke-width','3px');
      // })
      // .on('mousemove',function(d){
      //     var tooltip = d3.select('.custom-tooltip');
      //     var xy = d3.mouse(d3.select('.container').node());
      //     tooltip
      //         .style('left',xy[0]+10+'px')
      //         .style('top',xy[1]+10+'px');
      // })
      // .on('mouseleave',function(d){
      //     var tooltip = d3.select('.custom-tooltip');
      //     tooltip.transition().style('opacity',0);
      //     d3.select(this).style('stroke-width','0px');
      // });

    //UPDATE + ENTER - NotOverweight
    barNotOverweightEnter.merge(barNotOverweight)
        .transition()
        .duration(1000)
        .attr("x", function(d){
          return w/2-scaleX(d.notOverweight/(d.overweightObese + d.notOverweight));
        })
        .attr("width", function(d) {
          //console.log(d.notOverweight/(d.overweightObese + d.notOverweight));
          return scaleX(d.notOverweight/(d.overweightObese + d.notOverweight));
        } )
        .attr("height", barHeight);
        //.attr("height", scaleY.bandwidth());

    //EXIT
    barNotOverweight.exit()
      .transition()
      .duration(500)
      .attr('x', w/2)
      .attr('width', 0)
      .remove();

    // Overweight & Obese bar
    let barOverweight = plot.selectAll('.overweightBar').data(data);

    let barOverweightEnter = barOverweight.enter()
        .append('rect')
        .attr('x', w/2)
        .attr('y', function(d, i) {return i*barInterval;})
        .attr('class','bar overweightBar')
        .on('click',function(d,i){
            console.log(d);
            console.log(i);
            console.log(this);
        })
        .on('mouseenter',function(d){
            var tooltip = d3.select('.custom-tooltip');
            tooltip.select('.title')
                .html(d.factor)
            tooltip.select('.value1')
                .html(d.overweightObese/(d.overweightObese + d.notOverweight));
            tooltip.transition().style('opacity',1);
            d3.select(this).style('stroke-width','3px');
        })
        .on('mousemove',function(d){
            var tooltip = d3.select('.custom-tooltip');
            var xy = d3.mouse(d3.select('.container').node());
            tooltip
                .style('left',xy[0]+10+'px')
                .style('top',xy[1]+10+'px');
        })
        .on('mouseleave',function(d){
            var tooltip = d3.select('.custom-tooltip');
            tooltip.transition().style('opacity',0);
            d3.select(this).style('stroke-width','0px');
        });;

    //UPDATE + ENTER - Overweight
    barOverweightEnter.merge(barOverweight)
        .transition()
        .duration(1000)
        .attr('width', function(d) {
          //console.log(d.overweightObese/(d.overweightObese + d.notOverweight));
          return scaleX(d.overweightObese/(d.overweightObese + d.notOverweight));
        } )
        .attr('height', barHeight);
        //.attr("height", scaleY.bandwidth());

    //EXIT
    barOverweight.exit()
      .transition()
      .duration(500)
      .attr('width', 0)
      .remove();

    // Append NOT overweight labels
    let notOverweightLabel = plot.selectAll('.notOverweightLabel').data(data);

    let notOverweightLabelEnter = notOverweightLabel.enter()
        .append('text')
        .attr('class', 'notOverweightLabel label')
        .text(function(d){
          return Math.round(d.notOverweight/(d.overweightObese + d.notOverweight)* 100)+ '%' ;})
        .attr('x', w/10)
        .attr('y', function(d, i) {return i*barInterval + 20;})
        .style('text-anchor', "left")
        .style('fill', '#212121');

    //UPDATE + ENTER - Label
    notOverweightLabelEnter.merge(notOverweightLabel)
      .text(function(d){
        return Math.round(d.notOverweight/(d.overweightObese + d.notOverweight)* 100)+ '%';});

    //EXIT
    notOverweightLabel.exit().remove();


    // Append overweight labels
    let overweightLabel = plot.selectAll('.overweightLabel').data(data);

    let overweightLabelEnter = overweightLabel.enter()
        .append('text')
        .attr('class', 'overweightLabel label')
        .text(function(d){
          return Math.round(d.overweightObese/(d.overweightObese + d.notOverweight)* 100)+ '%' ;})
        .attr('x', w-w/10)
        .attr('y', function(d, i) {return i*barInterval + 20;})
        .style('text-anchor', "right")
        .style('fill', '#212121');

    //UPDATE + ENTER - Label
    overweightLabelEnter.merge(overweightLabel)
      .text(function(d){
        return Math.round(d.overweightObese/(d.overweightObese + d.notOverweight)* 100)+ '%';});

    //EXIT
    overweightLabel.exit().remove();

    // Append labels
    let factorLevelLabel = plot.selectAll('.factorLevelLabel').data(data);

    let factorLevelLabelEnter = factorLevelLabel.enter()
        .append('text')
        .attr('class', 'factorLevelLabel label')
        .text(function(d){return d.item;})
        .attr('x', w/2)
        .attr('y', function(d, i) {return i*barInterval + 20;})
        .style('text-anchor', "middle")
        .style('fill', '#212121');

      //UPDATE + ENTER - Label
      factorLevelLabelEnter.merge(factorLevelLabel)
        .text(function(d){return d.item;});

      //EXIT
      factorLevelLabel.exit().remove();
}

// Parse
function parse(d){
  return {
    item: d.Item,
    factor: d.factor,
    notOverweight: +d.NotOverweight,
    overweightObese: +d.OverweightObese
  }
}
