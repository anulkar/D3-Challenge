var svgWidth = 800;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 60
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Census Data from csv
d3.csv("assets/data/data.csv").then(function(censusData) {

     // Parse and Cast data
    censusData.forEach(function(data) {
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
      });
  
    // Create scale functions
    var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d.poverty) - 1, d3.max(censusData, d => d.poverty) + 0.5])
    .range([0, width]);

    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d.healthcare) - 2, d3.max(censusData, d => d.healthcare) + 2])
    .range([height, 0]);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append Axes to the chart
    chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    chartGroup.append("g")
    .call(leftAxis);

    // Create scatter point circles
    chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", "10")
        .attr("fill", "skyblue")
        .attr("stroke", "black")
        .attr("opacity");

    // Add State abbreviation as label for each scatter point 
    chartGroup.selectAll("text")
        .data(censusData)
        .enter()
        .append("text").text(d => d.abbr)
        .attr("x", d => xLinearScale(d.poverty))
        .attr("y", d => yLinearScale(d.healthcare))
        .attr("font-size", "8px")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .attr("fill", "black");

    // Create y-axis label
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 1.5))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("Lacks Healthcare %")
        .attr("font-weight", "bold");

    // Create x-axis label
    chartGroup.append("text")
        .attr("transform", `translate(${width / 2.3}, ${height + margin.top + 30})`)
        .attr("class", "axisText")
        .text("In Poverty (%)")
        .attr("font-weight", "bold");
    }).catch(function(error) {
        console.log(error);

});