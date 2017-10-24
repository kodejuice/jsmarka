
/* global casper */

var t = require('../_helper');

/* override phantomjs viewport */
casper.options.viewportSize = t.view;

var HOST = "http://localhost:"+t.PORT;

// test server
casper.test.begin('JsMarka Server running on PORT '+t.PORT, 1, function(test){

	casper.start(HOST, function(h) {
		casper.waitFor(function(){
			return this.exists('title');
		},
		function then(){
			t.snap(casper, 'test/screenshots/pages/home.png');

			test.assertTitle(
				'JsMarka - JavaScript Code Performance Benchmarker',

				'Server is running properly'
			);
		}, null, 7000);
	});

	casper.run(function(){
		test.done();
	});
});
