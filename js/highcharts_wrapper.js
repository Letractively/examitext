/* This file contains helper functions for each chart that may
 * be shown by the analyser. Assumes highcharts.js has already 
 * been included, so include that before using this! */

/* Argument 1: ID of the container which will contain the chart.
 * Argument 2: Title of the chart.
 * Argument 3: An array which contains two-element arrays, where
 * the the first element is the name of a segment and second
 * element is how much of the pie chart that segment will take. */
function createPieChart(id, title, data) {
	return new Highcharts.Chart({
		chart : {
			renderTo : id,
			type : "pie",
      		plotBackgroundColor: null,
         	plotBorderWidth: null,
         	plotShadow: false
		},

		title: {
			text: title
		},

		tooltip: {
			formatter: function() {
				return "<strong>" + this.point.name + "</strong>: " + roundNumber(this.y, 2) + "%";
			}
		},

		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: "pointer",
				dataLabels: {
					enabled: true,
					color: "#000000",
					connectorColor: '#000000',
					formatter: function() {
						return "<strong>" + this.point.name + "</strong>: " + roundNumber(this.y, 2) + "%";
					}
				}
			}
		},

		series: [{
			type: "pie"	,
			name: title,
			data : data
		}]

	});
}

/* Argument 1: ID of the container which will contain the chart.
 * Argument 2: Title of the chart.
 * Argument 3: Label of the y-axis.
 * Argument 4: A function which returns a string that determines
 * the format of the tooltip text.
 * Argument 5: An array which contains objects which have a name
 * property and a data property (that is an array of the data to
 * show on the graph). Each object will be represented as a line
 * with area. */
function createAreaGraph(id, title, yLabel, tooltipFormatter, data) {
	return new Highcharts.Chart({
		chart: {
			renderTo: id,
			defaultSeriesType: "area"
		},

		title: {
			text: title
		},

		yAxis: {
			title: {
				text: yLabel
			}	
		},

		tooltip: {
			formatter : tooltipFormatter
		},

		series : data

	});
}