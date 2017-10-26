let express = require('express');
let router = express.Router();
let moment = require('moment');
let uid = require('uuid/v1');

let _ = require('lodash');

let Test = require('../db/model').tests;

require('../lib/helpers')();


// edit test 
// POST request
router.post('/:test_slug/edit', function(req, res, next) {
	let signedIn = req.isAuthenticated();

	let slug = req.params.test_slug,
		user = signedIn && req.user.username;


	if (signedIn){
		Test.find({slug}, (err, item)=>{
			if (err) {
				return res.send(`Error: ${err}`);
			}
			else if(req.body.slug && req.body.slug.length) {
				// a change 'slug' request
				// fork test under user instead
				// 
				let js_code1 = req.body.js_code1 || "",
					js_code2 = req.body.js_code2 || "",
					html_code = req.body.html_code || "",

					new_title = req.body.title,
					publish = req.body.publish === "true",

					originalSlug = req.body.slugInput || req.body.slug; // user-inputed slug


				if (!isEmptyString(js_code1) || !isEmptyString(js_code2) || !isEmptyString(html_code)){

					// look for test with same slug
					// if found respond with (slug already taken)
					// else create new test with slug
					// ...

					let new_slug = toSlug(req.body.slug);

					Test.find({slug: new_slug}, (err, r)=>{
						if (err){
							return res.send(`Error: ${err}`);
						}
						else if (r.length){
							// slug already taken
							return res.send(`error: Sorry the slug '/${originalSlug}' is not available`);
						}

						html_code = encodeURIComponent(html_code);
						js_code1 = encodeURIComponent(js_code1);
						js_code2 = encodeURIComponent(js_code2);

						let uniqueID = uid();

						// else: create new
						let newItem = {
							user,
							slug: new_slug,
							title: new_title,
							uid: uniqueID,

							html_code,
							js_code1,
							js_code2,

							date: new Date,

							publish,
							views: 0
						};


						// add test
						Test.create(newItem, (err, item)=>{
							if (err)
								res.send(`error:${err}`);
							else
								res.send(item.slug);
						});
					});
					return;
				}

				return res.send('Error: No test code found');
			}


			item = item[0];
			if (item.user === user){
				let writeable = ['js_code1', 'js_code2', 'html_code', 'title', 'publish'];
				let updates = _.pick(req.body, ...writeable);

				// escape codes
				if (updates.js_code1) updates.js_code1 = encodeURIComponent(updates.js_code1);
				if (updates.js_code2) updates.js_code2 = encodeURIComponent(updates.js_code2);
				if (updates.html_code) updates.html_code = encodeURIComponent(updates.html_code);


				if (updates.title && updates.title.length < 2)
					delete updates.title;

				if (Object.keys(updates).length){
					// update last_modified time
					updates.last_modified = new Date;

					// extend item with updates and save
					//  document
					_
					.extend(item, updates)
					.save();
				}

				// redirect to test page
				res.redirect(`/${slug}`);
			}
			else {
				res.send('Error: You can\'t do that!');
			}
		});
	}
	else {
		res.send('Error: You must sign in first');
	}

});



// edit test page
// GET request
router.get('/:test_slug/edit', (req, res, next)=>{
	let signedIn = req.isAuthenticated();

	let slug = req.params.test_slug,
		user = signedIn && req.user.username;

	Test.find({slug}, (err, item)=>{
		if (err){
			res.locals.message = err;
			return res.render('error', {
				error: {},
				signedIn,
				user: req.user
			});
		}
		else if (!item.length){
			return next();
		}


		item = item[0];
		if (signedIn){
			if (item.user === user || item.publish){
				res.render('edit_test', {
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
					js2: item.js_code2
				});
			} else {
				res.redirect(`/${slug}`);
			}
		} else {
			// not signed in, redirect back to test page
			res.redirect(`/${slug}`);
		}
	});


});


module.exports = router;
