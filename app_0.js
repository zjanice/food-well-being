 var m = {t:50,r:50,b:50,l:50},
    w = document.getElementById('canvas').clientWidth - m.l - m.r,
    h = document.getElementById('canvas').clientHeight - m.t -m.b,
    hLable = h+100,
    wLable = w-70;

var plot = d3.select('.canvas')
    .append('svg')
    .attr('width', w + m.l + m.r)
    .attr('height', h + m.t + m.b +30)
    .append('g')
    .attr('transform','translate('+ m.l+','+ m.t+')');

// Scale
var scaleX = d3.scaleLinear()
    .domain([0,25660]) //income
    //.domain([0,7]) // ndinnersout
    .range([0,w]);
var scaleY = d3.scaleLinear()
    .domain([0,100])
    .range([h,0]);
var scaleColor = d3.scaleOrdinal()
    // .domain(['1', '2'])  // Male 1, Female 2
    // .range(['#c9c9c9','#ff9712'])
    .domain(['1', '2', '3']) // Not overweight: 1, overweight: 2, obese: 3
    .range(['#c9c9c9','#ff9712', '#ff7b7b']); // grey, orange, red
// Axis
var axisX = d3.axisBottom()
  .scale(scaleX)
  .tickSize(-3);
var axisY = d3.axisLeft()
  .scale(scaleY)
  .tickSize(-w);

// Ticks

// Data input
d3.queue()
  .defer(d3.csv, 'data/individual_dataset.csv',parse)
	.await(dataLoaded);

function dataLoaded(err, data){
  let cf = crossfilter(data);
  let filterBySex = cf.dimension((d) => d.sex);
  let filterBySexGroup = filterBySex.group();
  let sexOptions = filterBySexGroup.all();

  let filterByRace = cf.dimension((d) => d.race);
  let filterByRaceGroup = filterByRace.group();
  let raceOptions = filterByRaceGroup.all();

  let filterByEdu = cf.dimension((d) => d.edu);
  let filterByEduGroup = filterByEdu.group();
  let eduOptions = filterByEduGroup.all();


  // Populate the options
  d3.select('.leftCol').select('#filterBySex')
    .selectAll('button')
    .data(sexOptions)
    .enter()
    .append('button')
    .append('a')
    .attr('href','#')
    .attr('class','sexOption option')
    .html(function(d){
      //console.log(d);
      return d.key;
    });

  d3.select('.leftCol').select('#filterByRace')
    .selectAll('button')
    .data(raceOptions)
    .enter()
    .append('button')
    .append('a')
    .attr('href','#')
    .attr('class','raceOption option')
    .html(function(d){
      //console.log(d);
      return d.key;
    });

  d3.select('.leftCol').select('#filterByEdu')
    .selectAll('button')
    .data(eduOptions)
    .enter()
    .append('button')
    .append('a')
    .attr('href','#')
    .attr('class','eduOption option')
    .html(function(d){
      //console.log(d);
      return d.key;
    });


  // Listen for changes
  d3.select('#showAllBtn')
    .on('click',function(){
      // filterByType.filter(null);
      draw(data);
    });

	d3.select('#filterBySex')
		.selectAll('.sexOption')
		.on('click',function(){
      typeSelected = $(this).text();
      filterBySex.filter(typeSelected);
      draw(filterBySex.top(Infinity));
		});

  d3.select('#filterByRace')
    .selectAll('.raceOption')
    .on('click',function(){
      typeSelected = $(this).text();
      filterByRace.filter(typeSelected);
      draw(filterByRace.top(Infinity));
    });

  d3.select('#filterByEdu')
    .selectAll('.eduOption')
    .on('click',function(){
      typeSelected = $(this).text();
      filterByRace.filter(typeSelected);
      draw(filterByEdu.top(Infinity));
    });

  // draw(data);
  drawAxis();
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
                .html(d.bmi)
            tooltip.select('.value1')
                .html(d.bmicat);
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
        .attr('r',5)
        .attr('cx',function(d){return scaleX(d.hhincome)})
        .attr('cy',function(d){return scaleY(d.bmi)})
        .attr('stroke', function(d){return scaleColor(d.bmicat)})
        .style('fill', "none");
        // .style('fill', function(d){return scaleColor(d.bmicat)})
        //.style("opacity", .7)  ;

    //EXIT
    node.exit().remove();
}

// Parse
function parse(d){
  return {
    id: d.ID,
    hhnum: +d.HHNUM,
    pnum: +d.PNUM,
    healthstatus: +d.HEALTHSTATUS,
    bmi: +d.BMI,
    bmicat: +d.BMICAT,

    sex: +d.SEX,
    age: +d.AGE_R,
    race: +d.RACECAT_R,
    edu: +d.EDUCCAT,
    marital: +d.MARITAL,
    employment: +d.EMPLOYMENT,
    reasonnowork: +d.REASONNOWORK,

    ndinnersout: +d.NDINNERSOUT,
    vegetarian: +d.VEGETARIAN,
    lactoseintol: +d.LACTOSEINTOL,
    foodallergy: +d.FOODALLERGY,
    dieting: +d.DIETING,

    hhincome: +d.INCHHAVG_R
  }
}
