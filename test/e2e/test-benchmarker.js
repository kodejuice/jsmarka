
/* global casper */

var t = require('../_helper');

/* override phantomjs viewport */
casper.options.viewportSize = t.view;


var HOST = "http://localhost:"+t.PORT;
var TEST_MAX_RUN_TIME = 14000;


// Run test
casper.test.begin('Test runner', 2, function(test){

	var onLoad = function(){
		this.click('#run_test');

		casper.wait(TEST_MAX_RUN_TIME,
			function then() {
				t.snap(casper, 'test/screenshots/test-runner.png');

				test.assert(
					this.exists("div#canvas iframe.chartjs-hidden-iframe"),

					"Displays test result in bar chart"
				);

				test.assertEquals(
					"Operations per second (higher is better)",
					 this.getElementInfo("div#current-test div[center]").html,

					 "Runs test with no errors"
				);
			});
	};


	casper.start(HOST, function(h) {
		casper.waitFor(function(){
			return this.exists('title');
		}, onLoad);
	});

	casper.run(function(){
		test.done();
	});
});

