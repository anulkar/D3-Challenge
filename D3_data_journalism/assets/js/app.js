var svgWidth = 800;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
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

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function used for updating x-axis scale upon clicking on the chosen x-axis label
function xScale(censusData, chosenXAxis) {

    // Create x-axis scale
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.9, d3.max(censusData, d => d[chosenXAxis]) * 1.1])
      .range([0, width]);
  
    return xLinearScale;
}

// Function used for updating y-axis scale upon clicking on the chosen y-axis label
function yScale(censusData, chosenYAxis) {

    // Create y-axis scale
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8, d3.max(censusData, d => d[chosenYAxis]) * 1.1])
        .range([height, 0]);
  
    return yLinearScale;
}

// Function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}

// Function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
}
  
// Function used for updating X & Y-axis circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// Function used for adding State abbreviation labels to the scatter plot circles 
function renderCircleLabels(circlesGroup, censusData, chosenXAxis, xLinearScale, chosenYAxis, yLinearScale) {

    // Add State abbreviation as label for each scatter point 
    circlesGroup.selectAll(".scatterLabel")
        .data(censusData)
        .enter()
        .append("text")
        .attr("class", "scatterLabel")
        .text(d => d.abbr)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("font-size", "8px")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("fill", "black");
    
    return circlesGroup;
}

// Function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var labelX, labelY;
  
    switch (chosenXAxis) {
        case "age":
            labelX = "Age (Median): ";
            break;
        case "income":
            labelX = "Income (Median): ";
            break;
        default: // default is Poverty
            labelX = "In Poverty (%): ";
    }
    switch (chosenYAxis) {
        case "obesity":
            labelY = "Obese (%): ";
            break;
        case "smokes":
            labelY = "Smokes (%): ";
            break;
        default: // default is Healthcare
            labelY = "Lacks Healthcare (%): ";
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([0, 0])
      .html(function(d) {
        return (`<strong>${d.state}</strong><br>${labelX} ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }

// Import Census Data from csv
d3.csv("assets/data/data.csv").then(function(censusData, err) {
    if (err) throw err;

    // Parse and Cast data
    censusData.forEach(function(data) {
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.smokes = +data.smokes;
        data.income = +data.income;
        data.obesity = +data.obesity;
      });

    // Create scale functions based on default chosen x & y-axis defined
    var xLinearScale = xScale(censusData, chosenXAxis);
    var yLinearScale = yScale(censusData, chosenYAxis);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append Axes to the chart
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        // .attr("transform", `translate(0, ${height})`)
        .call(leftAxis);

    // chartGroup.append("g")
    //     .call(leftAxis);

    // Create scatter point circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        // .attr("cx", d => xLinearScale(d.poverty))
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", "15")
        .attr("fill", "orange")
        .attr("opacity", "0.6");
    
    // Create group for 3 x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    // Create x-axis label for Poverty
    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");
    
    // Create x-axis label for Median Age
    var ageLabel= xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");
    
    // Create x-axis label for Median Household Income
    var incomeLabel= xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

    // Create group for 3 y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    // Create y-axis label for Healthcare
    var healthCareLabel = yLabelsGroup.append("text")
        .attr("y", 60 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .text("Lacks Healthcare (%)")
    
    // Create y-axis label for Healthcare
    var smokesLabel = yLabelsGroup.append("text")
        .attr("y", 40 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)")

    // Create y-axis label for Healthcare
    var obesityLabel = yLabelsGroup.append("text")
        .attr("y", 20 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obese (%)")
    
    // Add State abbreviation as label for each scatter point 
    chartGroup.selectAll(".scatterLabel")
        .data(censusData)
        .enter()
        .append("text")
        .attr("class", "scatterLabel")
        .text(d => d.abbr)
        .attr("x", d => xLinearScale(d.poverty))
        .attr("y", d => yLinearScale(d.healthcare))
        .attr("font-size", "8px")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("fill", "black");
    
    // update tooltips
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x-axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function() {

            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                // replaces chosenXAxis with value
                chosenXAxis = value;

                // updates x scale for new data
                xLinearScale = xScale(censusData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // updates circles with new x & y values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // add state abbreviations to circle labels
                circlesGroup = renderCircleLabels(circlesGroup, censusData, chosenXAxis, xLinearScale, chosenYAxis, yLinearScale);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                switch (chosenXAxis) {
                    case "age":
                        ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                        povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                        incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                        break;
                    case "income":
                        incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                        ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                        povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                        break;
                    default: // default is Poverty
                        povertyLabel
                        .classed("active", true)
                        .classed("inactive", false); 
                        ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                        incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });
    
    // y-axis labels event listener
    yLabelsGroup.selectAll("text")
        .on("click", function() {

            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {
                // replaces chosenYAxis with value
                chosenYAxis = value;

                // updates y-scale for new data
                yLinearScale = yScale(censusData, chosenYAxis);

                // updates y-axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new x & y values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // add state abbreviations to circle labels
                circlesGroup = renderCircleLabels(circlesGroup, censusData, chosenXAxis, xLinearScale, chosenYAxis, yLinearScale);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                switch (chosenYAxis) {
                    case "smokes":
                        smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                        healthCareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                        obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                        break;
                    case "obesity":
                        obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                        smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                        healthCareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                        break;
                    default: // default is Healthcare
                        healthCareLabel
                        .classed("active", true)
                        .classed("inactive", false); 
                        smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                        obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });

}).catch(function(error) {
        console.log(error);
    });