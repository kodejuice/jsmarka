let express = require('express');
let router = express.Router();
let uuid = require('uuid/v1');

let Test = require('../db/model').tests;

require('../lib/helpers')();

// add test
router.post('/addtest', function(req, res, next) {
	let signedIn = req.isAuthenticated();

	let slug = req.body.slug,
		title = req.body.title,
		js_code1 = encodeURIComponent(req.body.jscode1),
		js_code2 = encodeURIComponent(req.body.jscode2),
		html_code = encodeURIComponent(req.body.htmlcode),
		publish = (req.body.publish === "true"),

		originalSlug = req.body.originalSlug || slug; // user-inputed slug

	let uniqueID = uuid();

	if (signedIn){
		let user = req.user.username;

		let date = new Date;
		let newItem = {
			user,
			slug,
			title,
			uid: uniqueID,

			html_code,
			js_code1,
			js_code2,

			date,
			last_modified: null,

			publish,
			views: 0
		};

		// find test with same slug
		Test.find({slug}, (err, item)=>{
			if (err)
				return res.send(`error:${err}`);

			if (item.length) {
				// slug already taken
				return res.send(`error: Sorry the slug '/${originalSlug}' is not availabe`);
			}
			else {
				slug = toSlug(slug);

				if (!isValidSlug(slug)){
					res.send(`error: Sorry the slug '/${originalSlug}' is not available`);
				}
				else if (title.length < 2) {
					res.send('error: Invalid title');
				}
				else {
					// create new test

					newItem.slug = slug;

					// add test
					Test.create(newItem, (err, item)=>{
						if (err)
							res.send(`error:${err}`);
						else
							res.send(item.slug);
					});
				}
			}
		});

	} else {
		res.send('error: You must sign in first');
	}
});

module.exports = router;
