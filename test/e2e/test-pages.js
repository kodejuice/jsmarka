
/* global casper */

var t = require('../_helper');

/* override phantomjs viewport */
casper.options.viewportSize = t.view;


var HOST = "http://localhost:"+t.PORT;


///////////////////
// `/tests` page //
///////////////////

casper.test.begin('/tests page', 1, function(test){
	var onLoad = function(){

		t.snap(casper, 'test/screenshots/pages/tests-page.png');

		test.assert(
			this.exists('a#mytests-tab'),

			"Tests Page loads properly"
		);

	};

	casper.start(HOST+'/tests', function(h) {
		casper.waitFor(function(){
			return this.exists('title');
		}, casper.wait.bind(casper, 1000, onLoad));
	});

	casper.run(function(){
		test.done();
	});
});



///////////////////
// `/mytests` page //
///////////////////

casper.test.begin('/mytests page', 1, function(test){
	var onLoad = function(){

		t.snap(casper, 'test/screenshots/pages/mytests-page.png');

		test.assert(
			this.exists('a#alltests-tab'),

			"User Tests Page loads properly"
		);

	};

	casper.start(HOST+'/mytests', function(h) {
		casper.waitFor(function(){
			return this.exists('title');
		}, casper.wait.bind(casper, 1000, onLoad));
	});

	casper.run(function(){
		test.done();
	});
});


///////////////////
// `/search` page //
///////////////////

casper.test.begin('/search page', 1, function(test){
	var onLoad = function(){
		var query = "hello world";

		casper.sendKeys('input[name="q"]', query);

		this.thenClick('button[type=submit]', casper.wait.bind(casper, 2000, function() {
			t.snap(casper, 'test/screenshots/pages/search-page.png');

			test.assertEquals(
				this.getElementInfo('div.row.tests-list em[margin-left] b').html.indexOf(query) > -1,
				true,

				"Search works properly"
			);
		}));
	};

	casper.start(HOST+'/search', function(h) {
		casper.waitFor(function(){
			return this.exists('title');
		}, casper.wait.bind(casper, 1000, onLoad));
	});

	casper.run(function(){
		test.done();
	});
});