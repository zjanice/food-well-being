
var m = {t:50,r:50,b:50,l:50},
    w = document.getElementById('canvas').clientWidth - m.l - m.r,
    h = document.getElementById('canvas').clientHeight - m.t - m.b;

var plot = d3.select('.canvas')
    .append('svg')
    .attr('width', w + m.l + m.r)
    .attr('height', h + m.t + m.b)
    .append('g').attr('class','plot')
    .attr('transform','translate('+ m.l+','+ m.t+')');

var numPerRow = 10;
var gapY = 15;

var legendContainer = d3.select('.legend')
  .append('svg')
  .attr('width', w + m.l + m.r)
  .attr('height', 50)
  .append('g').attr('class','legendContainer')
  .attr('transform','translate('+ m.l+','+ m.t+')');

var legendSelection = legendContainer.append('circle')
  .attr('cx', w/4)
  .attr('cy', 50)
  .attr('r', 5)
  .style('fill', '#ffb355');

var scaleColor = d3.scaleOrdinal()
    .domain(['1', '2', '3']) // Not overweight: 1, overweight: 2, obese: 3
    .range(['#43c9bd', '#ffb355', '#ff7b7b']); // green, orange, red

d3.queue()
  .defer(d3.csv, 'data/individual_with_groupId.csv',parse)
	.await(dataLoaded);

function dataLoaded(err, data){
  let cf = crossfilter(data);
  let filterByRegion = cf.dimension((d) => d.familysize);
  let filterByRegionGroup = filterByRegion.group();
  let regionOptions = filterByRegionGroup.all();

  // Populate the options
  d3.select('.nav').select('#filterByRegion')
    .selectAll('li')
    .data(regionOptions)
    .enter()
    .append('li')
    .append('a')
    .attr('href','#')
    .attr('class','option dropdown-item')
    .html(function(d){
      // console.log(d);
      return d.key;
    });

    // Listen for changes in the dropdown menus
  	d3.select('#filterByRegion')
  		.selectAll('.option')
  		.on('click',function(){
        optionSelected = $(this).text();
        filterByRegion.filter(optionSelected);
        draw(filterByRegion.top(Infinity));

        $('.option-dropdown').text(optionSelected);
  		});

  draw(data);
}

function draw(data){
  let node = plot.selectAll('circle').data(data);
  //ENTER
    var nodeEnter = node.enter()
        .append('circle')
        .attr('class','node')
        .on('click',function(d,i){
            console.log(d);
            console.log(i);
            console.log(this);
        })
        .on('mouseenter',function(d){
            var tooltip = d3.select('.custom-tooltip');
            tooltip.select('.title')
                .html("Family " + d.g_index)
            tooltip.select('.value1')
                .html("BMI: " + d.bmi)
            tooltip.select('.value2')
                .html("Census region: " + d.region)
            tooltip.select('.value3')
                .html("Monthly income: $" + d.income)
            tooltip.select('.value4')
                .html("Family size: " + d.familysize);
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
        });

    //UPDATE + ENTER
    nodeEnter
        .merge(node)
        .attr('r',3)
        .attr('cx',function(d){
          return w/numPerRow * (d.g_index%numPerRow) + w/numPerRow/13 * d.pnum;
        })
        .attr('cy',function(d){
          return gapY * Math.floor(d.g_index/numPerRow);
        })
        // .attr('stroke', function(d){return scaleColor(d.bmicat)})
        .style('fill', function(d){return scaleColor(d.bmicat)});
        //.style("opacity", .7);

    //EXIT
    node.exit().remove();
}

// Parse
function parse(d){
  return {
    hhnum: d.HHNUM,
    pnum: d.PNUM,
    g_index: d.g_index,
    bmi: d.BMI,
    bmicat: d.BMICAT,
    region: d.region,
    targetgroup: d.targetgroup,
    income: d.inchhavg_r,
    familysize: d.resunitsize
  }
}
