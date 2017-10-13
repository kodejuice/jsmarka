let express = require('express');
let router = express.Router();
let moment = require('moment');

let Test = require('../db/model').tests;


// view test
router.get('/:test_slug', function(req, res, next) {
	let signedIn = req.isAuthenticated();

	let slug = req.params.test_slug,
		user = signedIn && req.user.username;

	Test.find({slug}, (err, item)=>{
		if (err) {
			res.locals.message = err;
			return res.render('error', {
				error: {},
				signedIn,
				user: req.user
			});
		}
		else if(!item.length) {
			return next();
		}


		item = item[0];
		if (item.publish || (signedIn && item.user === user)){
			if (!req.session[item.slug]){
				req.session[item.slug] = true;
				item.views = (item.views|0) + 1; // increment views

				item.save();
			}

			res.render('viewtest', {
				signedIn,
				user: req.user,
				moment,

				author: item.user,

				slug,
				title: item.title,
				publish: item.publish,
				views: item.views,

				date: item.date,
				last_modified: item.last_modified,

				html: item.html_code,
				js1: item.js_code1,
				js2: item.js_code2,

				views: item.views
			});
		}
		else {
			res.locals.message = "Private test";

			// render the error page
			return res.render('error', {
				error: {},
				user: req.user,
				signedIn: req.isAuthenticated()
			});
		}
	});

});

module.exports = router;
