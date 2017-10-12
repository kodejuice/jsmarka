let express = require('express');
let router = express.Router();
let moment = require('moment');

let Test = require('../db/model').tests;

let paging = require('../lib/paging');


// Search tests
router.get('/search', function(req, res, next) {
	let signedIn = req.isAuthenticated();

	// search query, paging start index
	let query = req.query.q || "",
		pagingStart = ((Math.abs(+req.query.s) | 0) * 27);

	let db_query;

	db_query = new Promise((resolve, reject)=>{
		Test.search(query, {}, {
		    conditions: {publish: true},
		    sort: {date: 'desc'}
		  }, function(err, data) {
		  	if (err)
		  		return reject(err);
		  	resolve(data.results);
		  });
	});

	db_query
	.then(result => {
		let resultsCount = result.length;

		// limit result
		if (pagingStart > result.length)
			result = result.slice(0, 27);
		else 
			result = result.slice(pagingStart, pagingStart + 27);

		// paging
		let pagingHTML = paging(`/search?q=${query}`, resultsCount, pagingStart, 27 /* max items */);

		res.render('search', {
			query,
			signedIn,
			moment,
			resultsCount,
			tests: result,
			paging: pagingHTML,
			pagingStart: pagingStart/27,
			user: req.user
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