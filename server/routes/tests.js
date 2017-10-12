let express = require('express');
let router = express.Router();
let moment = require('moment');

let paging = require('../lib/paging');

let Test = require('../db/model').tests;


// Get tests
router.get('/tests', function(req, res, next) {
	let signedIn = req.isAuthenticated();

	// tests category
	let cat = req.query.cat;
	cat = cat ? cat.toLowerCase() : 'latest';

	// get published tests
	let db_query = Test.where('publish', true)
					   .sort({date: 'desc'})
					   .exec();

	db_query
	.then(tests => {
		let allTestCount = tests.length;

		// Sort tests if category is 'popular'
		if (cat === 'popular'){
			// bubble tests with the max views
		   tests.sort((x, y)=>{
			   return (y.views|0) - (x.views|0);
		   });
		}

		// limit result wrt paging index
		let pagingStart = ((Math.abs(+req.query.s) | 0) * 27);

		if (pagingStart > tests.length)
			tests = tests.slice(0, 27);
		else 
			tests = tests.slice(pagingStart, pagingStart + 27);

		// paging
		let pagingHTML = paging(`/tests?cat=${cat}`, allTestCount, pagingStart, 27 /* max items */);

		res.render('tests', {
			cat,
			signedIn,
			moment, // pass the moment module so we can use it in our page via ejs
			user: req.user,
			
			tests: tests,
			paging: pagingHTML,
			pagingStart: (pagingStart/27)
		});

	})
	.catch(err => {
		res.locals.message = err;

		// render the error page
		res.render('error', {
			error: {},
			user: req.user,
			signedIn: req.isAuthenticated()
		});
	});
});


module.exports = router;
